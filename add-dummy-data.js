const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Add 4 more schools
  await prisma.school.createMany({
    data: [
      { name: "مدرسة طارق بن زياد", administration: "غرب الزقازيق", level: "ثانوي" },
      { name: "مدرسة خديجة بنت خويلد", administration: "غرب الزقازيق", level: "إعدادي" },
      { name: "مدرسة بدر", administration: "غرب الزقازيق", level: "ابتدائي" },
      { name: "مدرسة النور", administration: "غرب الزقازيق", level: "ثانوي" },
    ]
  });
  console.log("Added 4 schools.");

  // Add 2 more supervisors
  const sup1 = await prisma.supervisor.create({
    data: { name: "أحمد كمال", phone: "01011111111", specialization: "لغة إنجليزية", region: "غرب الزقازيق" }
  });
  await prisma.user.create({
    data: { username: "01011111111", password: "password123", role: "SUPERVISOR", supervisorId: sup1.id }
  });

  const sup2 = await prisma.supervisor.create({
    data: { name: "سامي يوسف", phone: "01022222222", specialization: "علوم", region: "غرب الزقازيق" }
  });
  await prisma.user.create({
    data: { username: "01022222222", password: "password123", role: "SUPERVISOR", supervisorId: sup2.id }
  });
  console.log("Added 2 supervisors.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
