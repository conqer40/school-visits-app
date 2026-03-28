const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const userCount = await prisma.user.count();
  const maxId = await prisma.user.aggregate({ _max: { id: true } });
  
  console.log("User Count:", userCount);
  console.log("Max User ID:", maxId._max.id);
  
  const supCount = await prisma.supervisor.count();
  const maxSupId = await prisma.supervisor.aggregate({ _max: { id: true } });
  console.log("Supervisor Count:", supCount);
  console.log("Max Supervisor ID:", maxSupId._max.id);
}

main().catch(console.error).finally(() => prisma.$disconnect());
