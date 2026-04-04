const { PrismaClient } = require('@prisma/client');
const { config } = require('dotenv');
config();

const p = new PrismaClient();

const dayNames = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

function getWorkingDays(year, month) {
  const days = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    const day = date.getDay();
    if (day !== 5) days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

function normalizeString(str) {
  if (!str) return "";
  return str
    .trim()
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ");
}

async function testGenerate() {
  try {
    console.log("Starting Scheduler Test...");
    const supervisors = await p.supervisor.findMany({
      where: { isActive: true },
      include: { spec: true },
    });
    console.log(`Found ${supervisors.length} active supervisors.`);

    const schools = await p.school.findMany({
      where: { status: "ACTIVE" },
    });
    console.log(`Found ${schools.length} active schools.`);

    if (supervisors.length === 0 || schools.length === 0) {
        console.log("No supervisors or schools found. Cannot continue.");
        return;
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const workingDays = getWorkingDays(year, month);

    console.log(`Current Month: ${month + 1}, Year: ${year}. Working days (excl. Fridays): ${workingDays.length}`);

    // Pre-calculate compatible schools
    const compatibleSchoolsMap = new Map();
    for (const sup of supervisors) {
      const supLevels = (sup.levels || "").split(",").map(normalizeString).filter(Boolean);
      const supTypes = (sup.types || "").split(",").map(normalizeString).filter(Boolean);
      
      const compSchools = [];
      for (const school of schools) {
        const schLevels = (school.levels || "").split(",").map(normalizeString).filter(Boolean);
        const schTypes = (school.types || "").split(",").map(normalizeString).filter(Boolean);

        const hasCommonLevel = supLevels.some(l => schLevels.includes(l));
        const hasCommonType = supTypes.some(t => schTypes.includes(t));

        if (hasCommonLevel && hasCommonType) {
          compSchools.push(school.id);
        }
      }
      compatibleSchoolsMap.set(sup.id, compSchools);
      console.log(`Supervisor ${sup.name}: Found ${compSchools.length} compatible schools.`);
    }

    const totalCompatible = Array.from(compatibleSchoolsMap.values()).reduce((acc, curr) => acc + curr.length, 0);
    console.log(`Total compatibility matches: ${totalCompatible}`);

    if (totalCompatible === 0) {
        console.log("ERROR: NO COMPATIBLE MATCHES FOUND. CHECK LEVELS AND TYPES DATA.");
    } else {
        console.log("SUCCESS: Compatibility matching is working.");
    }

  } catch (error) {
    console.error("Test Error:", error);
  } finally {
    await p.$disconnect();
  }
}

testGenerate();
