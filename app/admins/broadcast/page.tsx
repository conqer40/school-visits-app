import { prisma } from "@/lib/prisma";
import { getSession, egyptDate } from "@/lib/auth";
import { redirect } from "next/navigation";
import BroadcastClient from "./BroadcastClient";

export default async function AdminBroadcastPage({ searchParams }: any) {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const { target, spec, level } = await searchParams;

  const specializations = await (prisma as any).specialization.findMany({
    orderBy: { name: "asc" }
  });

  let recipients: any[] = [];
  const activeTarget = target || "supervisors";

  if (activeTarget === "supervisors") {
    const filter: any = { isActive: true };
    if (spec && spec !== "all") filter.specializationId = parseInt(spec);
    if (level && level !== "all") filter.levels = { contains: level };

    recipients = await (prisma as any).supervisor.findMany({
      where: filter,
      include: { spec: true },
      orderBy: { name: "asc" }
    });
  } else if (activeTarget === "principals") {
    const filter: any = { status: "ACTIVE" };
    if (level && level !== "all") filter.levels = { contains: level };

    const schools = await (prisma as any).school.findMany({
      where: filter,
      orderBy: { name: "asc" },
      include: {
        visits: {
          where: {
            date: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
            }
          },
          include: { supervisor: true }
        }
      }
    });

    recipients = schools.map((s: any) => ({
      id: s.id,
      name: s.principalName || "مدير المدرسة",
      phone: s.principalPhone,
      schoolName: s.name,
      visits: s.visits,
      type: "PRINCIPAL"
    })).filter((r: any) => r.phone);
  }

  return (
    <div dir="rtl" className="animate-fade-in">
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ color: "var(--primary-deep-blue)", margin: 0 }}>📢 نظام الرسائل الجماعية Pro</h1>
        <p style={{ color: "#666" }}>إرسال تنبيهات وتعميمات وجداول الزيارات عبر الواتساب</p>
      </div>

      <BroadcastClient 
        initialRecipients={recipients} 
        specializations={specializations}
        activeTarget={activeTarget}
        activeSpec={spec}
        activeLevel={level}
      />
    </div>
  );
}
