const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.school.count();
  console.log('Schools count in DB:', count);
  const sups = await prisma.supervisor.findMany({ where: { isActive: true } });
  console.log('Active Supervisors count in DB:', sups.length);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
