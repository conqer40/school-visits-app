"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function sendDailyRemindersAction(formData: FormData) {
  const todayStr = new Date().toISOString().split("T")[0];
  const pendingVisitsToday = await prisma.visit.findMany({
    where: { 
      status: "PENDING",
      date: { gte: new Date(todayStr), lt: new Date(new Date(todayStr).getTime() + 86400000) }
    },
    include: { supervisor: true, school: true }
  });

  const reminders = pendingVisitsToday.map(visit => {
    if (!visit.supervisor.phone) return null;
    
    const phone = visit.supervisor.phone.replace(/^0/, "20");
    const msg = `تذكير من إدارة غرب الزقازيق التعليمية ⚠️
أ/ ${visit.supervisor.name}، يرجى تسجيل تقرير زيارتك اليوم لمدرسة ${visit.school.name} عبر النظام في أقرب وقت.
🔗 رابط تسجيل التقرير: https://visits.example.com/login`;

    return {
      name: visit.supervisor.name,
      school: visit.school.name,
      phone: visit.supervisor.phone,
      waLink: `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
    };
  }).filter(r => r !== null);

  await prisma.log.create({
    data: { action: "SEND_REMINDERS", details: `تم توليد تذكيرات لـ ${reminders.length} موجه` },
  });

  revalidatePath("/whatsapp");
}
