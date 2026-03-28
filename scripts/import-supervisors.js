/**
 * سكريبت استيراد الموجهين من ملف التوجيهات.xlsx
 * يقوم بإنشاء التخصصات، الموجهين، وحسابات المستخدمين
 */

const XLSX = require("xlsx");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// دالة لتنظيف رقم الهاتف
function cleanPhone(phone) {
  if (!phone) return null;
  let p = phone.toString().trim();
  // إذا كان رقم (مثل 1001234567)، نحوله لنص ونضيف 0 في البداية
  if (p.length === 10 && (p.startsWith('1') || p.startsWith('5'))) {
    p = '0' + p;
  }
  // إزالة أي فواصل أو مسافات لو وجدت
  p = p.replace(/\s/g, '');
  return p;
}

// دالة لتصنيف المرحلة
function mapLevel(levelRaw) {
  if (!levelRaw) return "ابتدائي,إعدادي";
  const s = levelRaw.toString().trim();
  if (s.includes("الاعدادية") || s.includes("إعدادي")) return "إعدادي";
  if (s.includes("الابتدائية") || s.includes("ابتدائي")) return "ابتدائي";
  if (s.includes("الثانوية") || s.includes("ثانوي")) return "ثانوي";
  return "ابتدائي,إعدادي"; // افتراضي
}

async function main() {
  try {
    const filePath = path.join(__dirname, "..", "التوجيهات.xlsx");
    const wb = XLSX.readFile(filePath);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(ws);

    console.log(`📂 إجمالي الصفوف المكتشفة: ${data.length}`);

    let addedCount = 0;
    let skippedCount = 0;

    for (const row of data) {
      const name = row["الاسم رباعياً"]?.toString().trim();
      const specName = row["التخصص"]?.toString().trim();
      const levelRaw = row["المرحلة / الوظيفة"]?.toString().trim();
      const phoneRaw = row["رقم الهاتف"];

      if (!name || !specName) {
        console.log(`⚠️ تخطي صف ناقص البيانات: ${JSON.stringify(row)}`);
        skippedCount++;
        continue;
      }

      const phone = cleanPhone(phoneRaw);
      const levels = mapLevel(levelRaw);

      // 1. التعامل مع التخصص (Find or Create)
      let specialization = await prisma.specialization.findUnique({
        where: { name: specName }
      });

      if (!specialization) {
        specialization = await prisma.specialization.create({
          data: { name: specName }
        });
        console.log(`➕ تم إنشاء تخصص جديد: ${specName}`);
      }

      // 2. التحقق من وجود الموجه مسبقاً (بالاسم أو الهاتف)
      let supervisor = await prisma.supervisor.findFirst({
        where: {
          OR: [
            { name: name },
            phone ? { phone: phone } : undefined
          ].filter(Boolean)
        }
      });

      if (supervisor) {
        console.log(`ℹ️ الموجه [${name}] موجود بالفعل، تخطي...`);
        skippedCount++;
        continue;
      }

      // 3. إنشاء الموجه
      supervisor = await prisma.supervisor.create({
        data: {
          name: name,
          phone: phone,
          levels: levels,
          specializationId: specialization.id,
          region: "غرب الزقازيق",
          isActive: true
        }
      });

      // 4. إنشاء حساب مستخدم للموجه
      // نستخدم رقم الهاتف كاسم مستخدم، وإذا غاب نستخدم الاسم (بدون مسافات)
      const username = phone || name.replace(/\s/g, '');
      
      // التحقق من أن هذا الموجه ليس لديه حساب بالفعل
      const existingUserBySup = await prisma.user.findFirst({
        where: { supervisorId: supervisor.id }
      });
      
      if (existingUserBySup) {
        console.log(`ℹ️ الموجه [${name}] لديه حساب بالفعل باسم [${existingUserBySup.username}]`);
        addedCount++; // نحسبه كمضاف للتناسق
        continue;
      }

      // التحقق من أن اسم المستخدم غير مستخدم
      const existingUserByUsername = await prisma.user.findUnique({
        where: { username: username }
      });

      if (existingUserByUsername) {
        console.log(`⚠️ اسم المستخدم [${username}] مستخدم بالفعل، تخطي إنشاء حساب للـ [${name}]`);
        skippedCount++;
        continue;
      }

      await prisma.user.create({
        data: {
          username: username,
          password: "123456",
          role: "SUPERVISOR",
          supervisorId: supervisor.id
        }
      });

      addedCount++;
      if (addedCount % 10 === 0) {
        console.log(`✅ تم إضافة ${addedCount} موجه...`);
      }
    }

    console.log(`\n🎉 اكتملت العملية!`);
    console.log(`✅ عدد الموجهين المضافين: ${addedCount}`);
    console.log(`⚠️ عدد العناوين المتخطاة: ${skippedCount}`);

  } catch (err) {
    console.error("❌ حدث خطأ أثناء الاستيراد:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
