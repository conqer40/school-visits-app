const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const supervisors = await prisma.supervisor.findMany();
  console.log("Supervisors in DB:", JSON.stringify(supervisors, null, 2));
  
  const activeSupervisors = await prisma.supervisor.findMany({ where: { isActive: true } });
  console.log("Active Supervisors count:", activeSupervisors.length);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
