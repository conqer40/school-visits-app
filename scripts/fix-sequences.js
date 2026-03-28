const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Resetting sequences...");
    // القائمة الكاملة للجداول التي قد تحتاج لتصحيح العداد
    const models = ["User", "Supervisor", "Specialization", "School", "Visit", "VisitReport", "Log"];
    
    for (const model of models) {
      try {
        console.log(`Resetting sequence for ${model}...`);
        await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"${model}"', 'id'), coalesce(max(id),0) + 1, false) FROM "${model}";`);
      } catch (e) {
        console.warn(`⚠️ Could not reset sequence for ${model}:`, e.message);
      }
    }
    
    console.log("✅ Sequences reset process completed.");
  } catch (err) {
    console.error("❌ Error resetting sequences:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
