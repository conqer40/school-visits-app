import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Visits by supervisor (top 10)
  const supervisorVisits = await prisma.supervisor.findMany({
    select: {
      name: true,
      _count: {
        select: { visits: true },
      },
      visits: {
        select: { status: true },
      },
    },
    take: 10,
    orderBy: { workloadScore: "desc" },
  });

  // Visits by status overall
  const [pending, completed, missed, excused] = await Promise.all([
    prisma.visit.count({ where: { status: "PENDING" } }),
    prisma.visit.count({ where: { status: "COMPLETED" } }),
    prisma.visit.count({ where: { status: "MISSED" } }),
    prisma.visit.count({ where: { status: "EXCUSED" } }),
  ]);

  // Reports per day (last 14 days)
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const recentReports = await prisma.visitReport.findMany({
    where: { createdAt: { gte: twoWeeksAgo } },
    select: { createdAt: true, isExcuse: true },
    orderBy: { createdAt: "asc" },
  });

  // Group by date
  const reportsByDay: Record<string, { reports: number; excuses: number }> = {};
  recentReports.forEach((r) => {
    const day = r.createdAt.toISOString().split("T")[0];
    if (!reportsByDay[day]) reportsByDay[day] = { reports: 0, excuses: 0 };
    if (r.isExcuse) reportsByDay[day].excuses++;
    else reportsByDay[day].reports++;
  });

  const dailyData = Object.entries(reportsByDay).map(([date, counts]) => ({
    date,
    ...counts,
  }));

  // Per specialization count
  const specializationData = await prisma.specialization.findMany({
    select: {
      name: true,
      _count: { select: { supervisors: true } },
    },
  });

  return NextResponse.json({
    supervisorVisits: supervisorVisits.map((sv) => ({
      name: sv.name,
      completed: sv.visits.filter((v) => v.status === "COMPLETED").length,
      pending: sv.visits.filter((v) => v.status === "PENDING").length,
      excused: sv.visits.filter((v) => v.status === "EXCUSED").length,
    })),
    statusBreakdown: [
      { name: "منجزة", value: completed, color: "#22c55e" },
      { name: "معلقة", value: pending, color: "#f59e0b" },
      { name: "فائتة", value: missed, color: "#ef4444" },
      { name: "باعتذار", value: excused, color: "#6366f1" },
    ],
    dailyData,
    specializationData: specializationData.map((s) => ({
      name: s.name,
      count: s._count.supervisors,
    })),
  });
}
