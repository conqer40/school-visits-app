import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "reports";

  const wb = XLSX.utils.book_new();

  if (type === "reports") {
    const reports = await prisma.visitReport.findMany({
      include: {
        supervisor: true,
        visit: { include: { school: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const rows = reports.map((r) => ({
      "اسم الموجه": r.supervisor.name,
      "المدرسة": r.visit?.school?.name || "",
      "تاريخ التقرير": r.createdAt.toLocaleDateString("ar-EG"),
      "نوع": r.isExcuse ? "اعتذار" : "تقرير",
      "التفاصيل": r.reportText,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "التقارير");
  } else if (type === "schools") {
    const schools = await prisma.school.findMany({ orderBy: { name: "asc" } });
    const rows = schools.map((s) => ({
      "اسم المدرسة": s.name,
      "المراحل": s.levels,
      "النوع": s.types,
      "الفترة": s.shift,
      "آخر زيارة": s.lastVisitDate ? s.lastVisitDate.toLocaleDateString("ar-EG") : "لم تزار",
      "إجمالي الزيارات": s.totalVisits,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "المدارس");
  } else if (type === "supervisors") {
    const supervisors = await prisma.supervisor.findMany({
      include: { spec: true, _count: { select: { visits: true } } },
      orderBy: { name: "asc" },
    });
    const rows = supervisors.map((s) => ({
      "اسم الموجه": s.name,
      "التخصص": s.spec?.name || s.specialization || "",
      "رقم الهاتف": s.phone || "",
      "المراحل": s.levels,
      "إجمالي الزيارات": s._count.visits,
      "الحالة": s.isActive ? "نشط" : "غير نشط",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "الموجهين");
  }

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${type}_${new Date().toISOString().split("T")[0]}.xlsx"`,
    },
  });
}
