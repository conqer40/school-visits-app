/**
 * سكريبت استيراد بيانات المدارس من ملف Excel المحدث
 * يمسح المدارس الحالية ثم يضيف المدارس من الملف مع الحقول الجديدة
 */

const XLSX = require("xlsx");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// --- قواعد التصنيف ---
function classifySchool(schoolName) {
  const name = schoolName.trim();

  // تحديد المراحل
  let levels = "ابتدائي"; // افتراضي

  if (name.includes("ت . س") || name.includes("ت .س") || name.includes("ت.س")) {
    levels = "رياض أطفال,ابتدائي,إعدادي";
  } else if (/\s+ب\s*$/.test(name) || / ب$/.test(name) || name.endsWith(" ب")) {
    levels = "ابتدائي";
  } else if (name.includes("اللغات") || name.includes("لغات")) {
    levels = "ابتدائي"; // مدارس اللغات المذكورة في الملف هي للمرحلة ب
  }

  // تحديد النوع
  let types = "رسمي"; // افتراضي
  if (name.includes("لغات") || name.includes("اللغات") || name.includes("للغات")) {
    types = "لغات";
  }

  return { levels, types };
}

// --- تحديد الفترة ---
function classifyShift(shiftRaw) {
  if (!shiftRaw) return "صباحي";
  const s = shiftRaw.toString().trim();
  if (s.includes("مسائى") || s.includes("مسائي")) return "مسائي";
  if (s.includes("دوار صباح") || s.includes("صباح")) return "صباحي";
  if (s.includes("فترة واحدة") || s.includes("فتره واحده")) return "صباحي ومسائي";
  if (s.includes("دوار مسائ")) return "مسائي";
  return "صباحي";
}

async function main() {
  try {
    // 1. قراءة ملف Excel
    const filePath = path.join(__dirname, "ارقام التليفونات.xlsx");
    const wb = XLSX.readFile(filePath);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const allRows = XLSX.utils.sheet_to_json(ws, { header: 1 });

    console.log(`📂 إجمالي الصفوف في الملف: ${allRows.length}`);

    // 2. فلترة الصفوف
    const schoolRows = allRows.filter((row) => {
      return (
        row[0] &&
        typeof row[0] === "number" &&
        row[1] &&
        typeof row[1] === "string" &&
        row[1].trim().length > 2
      );
    });

    console.log(`\n✅ صفوف المدارس المكتشفة: ${schoolRows.length}`);

    // 3. مسح المدارس الحالية
    console.log("\n⚠️  جاري مسح بيانات المدارس والزيارات...");
    await prisma.$executeRawUnsafe('DELETE FROM "VisitReport"');
    await prisma.$executeRawUnsafe('DELETE FROM "Visit"');
    await prisma.$executeRawUnsafe('DELETE FROM "School"');

    // 4. إضافة المدارس الجديدة
    console.log("\n📥 جاري إضافة المدارس الجديدة مع بيانات المديرين...");

    let added = 0;
    for (const row of schoolRows) {
      const schoolName = (row[1] || "").toString().trim();
      const principalName = (row[2] || "").toString().trim();
      const principalPhone = (row[3] || "").toString().trim();
      const shiftRaw = (row[4] || "").toString().trim();

      const { levels, types } = classifySchool(schoolName);
      const shift = classifyShift(shiftRaw);

      try {
        await prisma.school.create({
          data: {
            name: schoolName,
            administration: "غرب الزقازيق التعليمية",
            levels,
            types,
            shift,
            workingDays: "السبت,الأحد,الإثنين,الثلاثاء,الأربعاء,الخميس",
            principalName,
            principalPhone,
            status: "ACTIVE",
          },
        });
        added++;
        if(added % 10 === 0) console.log(`  ✓ تم إضافة ${added} مدرسة...`);
      } catch (err) {
        console.error(`  ✗ خطأ في إضافة [${schoolName}]:`, err.message);
      }
    }

    console.log(`\n🎉 تم استيراد ${added} مدرسة بنجاح!`);

  } catch (err) {
    console.error("❌ خطأ عام:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
