const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(__dirname, '..', 'مدارس غرب.xlsx');
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  console.log(`Starting import for ${data.length - 1} possible schools...`);

  let addedCount = 0;
  let skippedCount = 0;

  // Skip header
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const name = row[0]?.toString().trim();
    const levelRaw = row[1]?.toString().trim();

    if (!name) continue;

    const existing = await prisma.school.findFirst({
      where: { name: name }
    });

    if (existing) {
      console.log(`Skipped (Duplicate): ${name}`);
      skippedCount++;
      continue;
    }

    // Determine Levels
    let levels = 'ابتدائي';
    if (levelRaw?.includes('الاعداديه') || name.includes(' ع')) levels = 'إعدادي';
    if (levelRaw?.includes('الثانويه') || name.includes(' ث')) levels = 'ثانوي';
    if (name.includes('ت اساسي') || name.includes('تعليم اساسي')) levels = 'ابتدائي,إعدادي';
    
    // Determine Types
    let types = 'رسمي';
    if (name.includes('لغات')) types = 'لغات';
    if (name.includes('خاص')) types = 'خاص';
    if (name.includes('فني')) types = 'فني';
    if (name.includes('صناعي')) types = 'فني صناعي';
    if (name.includes('تجاري')) types = 'فني تجاري';
    if (name.includes('زراعي')) types = 'فني زراعي';
    if (name.includes('المتميزة')) types = 'لغات متميزة';

    try {
      await prisma.school.create({
        data: {
          name,
          levels,
          types,
          administration: 'غرب الزقازيق التعليمية',
          shift: 'صباحي',
          status: 'ACTIVE'
        }
      });
      console.log(`Added: ${name} [${levels}] [${types}]`);
      addedCount++;
    } catch (error) {
      console.error(`Error adding ${name}:`, error);
    }
  }

  console.log('\nImport Finished!');
  console.log(`Total Added: ${addedCount}`);
  console.log(`Total Skipped: ${skippedCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
