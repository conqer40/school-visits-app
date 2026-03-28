const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Resetting sequences...");
    // هذه الأوامر تعمل على PostgreSQL لتصحيح عداد الـ ID
    await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"User"', 'id'), coalesce(max(id),0) + 1, false) FROM "User";`);
    await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Supervisor"', 'id'), coalesce(max(id),0) + 1, false) FROM "Supervisor";`);
    await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Specialization"', 'id'), coalesce(max(id),0) + 1, false) FROM "Specialization";`);
    
    console.log("✅ Sequences reset successfully.");
  } catch (err) {
    console.error("❌ Error resetting sequences:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
