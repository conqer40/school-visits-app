const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, include: { supervisor: true } });
  console.log("Admins:", admins.map(a => ({ phone: a.username, name: a.supervisor?.name || "Admin" })));
  
  const supervisors = await prisma.user.findMany({ where: { role: "SUPERVISOR" }, take: 2 });
  console.log("Supervisors (sample):", supervisors.map(s => ({ phone: s.username })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
