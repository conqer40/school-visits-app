const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Fixing sequence...');
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Specialization"', 'id'), coalesce(max(id),0) + 1, false) FROM "Specialization";`);
  console.log('Sequence fixed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
