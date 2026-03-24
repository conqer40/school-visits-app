const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const SPECIALIZATIONS = [
  "لغة عربية",
  "رياضيات",
  "علوم",
  "دراسات اجتماعية",
  "لغة إنجليزية",
  "لغة فرنسية",
  "حاسب آلي وتكنولوجيا",
  "تربية دينية",
  "تربية فنية",
  "تربية رياضية",
  "تربية موسيقية",
  "رياض أطفال",
  "فني زراعي",
  "فني صناعي",
  "فني تجاري",
  "أخصائي نفسي",
  "أخصائي اجتماعي",
  "اقتصاد منزلي",
  "مجال صناعي",
  "مجال زراعي",
  "مكتبات"
];

async function main() {
  console.log('🌱 Starting specializations seed...');
  let added = 0;
  
  for (const name of SPECIALIZATIONS) {
    // Check if it already exists
    const existing = await prisma.specialization.findUnique({
      where: { name }
    });
    
    if (!existing) {
      await prisma.specialization.create({
        data: { name }
      });
      console.log(`✅ Added: ${name}`);
      added++;
    } else {
      console.log(`⏩ Skipped (already exists): ${name}`);
    }
  }

  console.log(`🎉 Seed finished! Added ${added} new specializations.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
