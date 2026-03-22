// Export data from SQLite before migration
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

async function exportData() {
  const dbPath = path.join(process.cwd(), "prisma", "dev.db");
  const prisma = new PrismaClient({
    datasources: { db: { url: `file:${dbPath}` } }
  });

  try {
    const data = {
      users: await prisma.user.findMany(),
      schools: await prisma.school.findMany(),
      specializations: await prisma.specialization.findMany(),
      supervisors: await prisma.supervisor.findMany(),
      visits: await prisma.visit.findMany(),
      visitReports: await prisma.visitReport.findMany(),
      logs: await prisma.log.findMany(),
    };

    fs.writeFileSync("exported-data.json", JSON.stringify(data, null, 2));
    console.log("✅ Data exported successfully to exported-data.json!");
    console.log(`  - Users: ${data.users.length}`);
    console.log(`  - Schools: ${data.schools.length}`);
    console.log(`  - Supervisors: ${data.supervisors.length}`);
    console.log(`  - Visits: ${data.visits.length}`);
    console.log(`  - Reports: ${data.visitReports.length}`);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
