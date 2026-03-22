const { PrismaClient } = require("@prisma/client");
const fs = require("fs");

async function importData() {
  const prisma = new PrismaClient();
  
  if (!fs.existsSync("exported-data.json")) {
    console.error("❌ exported-data.json not found!");
    return;
  }

  const data = JSON.parse(fs.readFileSync("exported-data.json", "utf8"));

  try {
    console.log("⏳ Starting data import to PostgreSQL...");

    // 1. Specializations
    for (const spec of data.specializations) {
      await prisma.specialization.upsert({
        where: { id: spec.id },
        update: {},
        create: spec
      });
    }
    console.log("✅ Specializations imported");

    // 2. Schools
    for (const school of data.schools) {
      await prisma.school.upsert({
        where: { id: school.id },
        update: {},
        create: {
          ...school,
          lastVisitDate: school.lastVisitDate ? new Date(school.lastVisitDate) : null,
          createdAt: new Date(school.createdAt),
          updatedAt: new Date(school.updatedAt)
        }
      });
    }
    console.log("✅ Schools imported");

    // 3. Supervisors
    for (const sup of data.supervisors) {
      await prisma.supervisor.upsert({
        where: { id: sup.id },
        update: {},
        create: {
          ...sup,
          createdAt: new Date(sup.createdAt),
          updatedAt: new Date(sup.updatedAt)
        }
      });
    }
    console.log("✅ Supervisors imported");

    // 4. Users
    for (const user of data.users) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: {},
        create: {
          ...user,
          createdAt: new Date(user.createdAt)
        }
      });
    }
    console.log("✅ Users imported");

    // 5. Visits
    for (const visit of data.visits) {
      await prisma.visit.upsert({
        where: { id: visit.id },
        update: {},
        create: {
          ...visit,
          date: new Date(visit.date),
          checkInTime: visit.checkInTime ? new Date(visit.checkInTime) : null,
          createdAt: new Date(visit.createdAt),
          updatedAt: new Date(visit.updatedAt)
        }
      });
    }
    console.log("✅ Visits imported");

    // 6. Reports
    for (const report of data.visitReports) {
      await prisma.visitReport.upsert({
        where: { id: report.id },
        update: {},
        create: {
          ...report,
          createdAt: new Date(report.createdAt)
        }
      });
    }
    console.log("✅ Visit Reports imported");

    // 7. Logs
    for (const log of data.logs) {
      await prisma.log.create({
        data: {
          ...log,
          createdAt: new Date(log.createdAt)
        }
      });
    }
    console.log("✅ Logs imported");

    console.log("\n🎊 DATA MIGRATION COMPLETE!");
  } catch (e) {
    console.error("❌ Migration error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

importData();
