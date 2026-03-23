import { prisma } from "@/lib/prisma";
import { getSession, egyptDate, egyptTime } from "@/lib/auth";
import { redirect } from "next/navigation";
import ChartsSection from "@/app/components/ChartsSection";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  // If Supervisor, redirect to their schedule
  if (user.role === "SUPERVISOR") redirect("/my-schedule");

  const totalSchools = await prisma.school.count();
  const totalSupervisors = await prisma.supervisor.count();
  const activeVisits = await prisma.visit.count({
    where: { status: "PENDING" }
  });
  
  const completedVisits = await prisma.visit.count({
    where: { status: "COMPLETED" }
  });

  const excusedVisits = await prisma.visit.count({
    where: { status: "EXCUSED" }
  });

  const coveragePercent = totalSchools > 0 ? Math.round((completedVisits / totalSchools) * 100) : 0;

  const recentReports = await (prisma as any).visitReport.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { supervisor: true, visit: { include: { school: true } } }
  });

  return (
    <div dir="rtl">
      <header style={{ marginBottom: "2rem", borderBottom: "1px solid var(--border-light)", paddingBottom: "1rem" }}>
        <h1 style={{ color: "var(--primary-deep-blue)", margin: 0 }}>نظام إدارة الزيارات المدرسية 🚀</h1>
        <p style={{ color: "var(--accent-gold)", fontWeight: "bold", margin: "0.5rem 0" }}>
          إدارة غرب الزقازيق التعليمية — تحت إشراف أ. محمد العسيلى
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <p style={{ color: "#888", fontSize: "0.9rem" }}>
            التاريخ الحالي: {egyptDate(new Date())} | الساعة: {egyptTime(new Date())}
          </p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid-responsive" style={{ marginBottom: "2rem" }}>
        <div className="card" style={{ borderTop: "4px solid var(--primary-deep-blue)", textAlign: "center" }}>
          <p style={{ fontSize: "0.85rem", color: "#666", margin: 0 }}>إجمالي المدارس</p>
          <p style={{ fontSize: "2.8rem", fontWeight: "bold", color: "var(--primary-deep-blue)", margin: "0.3rem 0" }}>{totalSchools}</p>
          <p style={{ fontSize: "0.75rem", color: "#999", margin: 0 }}>🏫 مدرسة مسجلة</p>
        </div>
        <div className="card" style={{ borderTop: "4px solid var(--secondary-dark-navy)", textAlign: "center" }}>
          <p style={{ fontSize: "0.85rem", color: "#666", margin: 0 }}>إجمالي الموجهين</p>
          <p style={{ fontSize: "2.8rem", fontWeight: "bold", color: "var(--secondary-dark-navy)", margin: "0.3rem 0" }}>{totalSupervisors}</p>
          <p style={{ fontSize: "0.75rem", color: "#999", margin: 0 }}>👤 موجه نشط</p>
        </div>
        <div className="card" style={{ borderTop: "4px solid #22c55e", textAlign: "center" }}>
          <p style={{ fontSize: "0.85rem", color: "#666", margin: 0 }}>زيارات منجزة</p>
          <p style={{ fontSize: "2.8rem", fontWeight: "bold", color: "#22c55e", margin: "0.3rem 0" }}>{completedVisits}</p>
          <p style={{ fontSize: "0.75rem", color: "#999", margin: 0 }}>✅ تمت بنجاح</p>
        </div>
        <div className="card" style={{ borderTop: "4px solid var(--accent-gold)", textAlign: "center" }}>
          <p style={{ fontSize: "0.85rem", color: "#666", margin: 0 }}>زيارات معلقة</p>
          <p style={{ fontSize: "2.8rem", fontWeight: "bold", color: "var(--accent-gold)", margin: "0.3rem 0" }}>{activeVisits}</p>
          <p style={{ fontSize: "0.75rem", color: "#999", margin: 0 }}>⏳ في الانتظار</p>
        </div>
        <div className="card" style={{ borderTop: "4px solid var(--success)", textAlign: "center" }}>
          <p style={{ fontSize: "0.85rem", color: "#666", margin: 0 }}>نسبة التغطية</p>
          <p style={{ fontSize: "2.8rem", fontWeight: "bold", color: "var(--success)", margin: "0.3rem 0" }}>{coveragePercent}%</p>
          <p style={{ fontSize: "0.75rem", color: "#999", margin: 0 }}>📊 من المدارس</p>
        </div>
        <div className="card" style={{ borderTop: "4px solid #6366f1", textAlign: "center" }}>
          <p style={{ fontSize: "0.85rem", color: "#666", margin: 0 }}>اعتذارات</p>
          <p style={{ fontSize: "2.8rem", fontWeight: "bold", color: "#6366f1", margin: "0.3rem 0" }}>{excusedVisits}</p>
          <p style={{ fontSize: "0.75rem", color: "#999", margin: 0 }}>🔵 مع عذر</p>
        </div>
      </div>

      {/* Charts Section */}
      <ChartsSection />

      {/* Recent Reports */}
      <div style={{ marginTop: "2rem" }}>
        <div className="card">
          <h2 style={{ fontSize: "1.2rem", marginBottom: "1.5rem" }}>📝 آخر التقارير المرفوعة</h2>
          {recentReports.length === 0 ? (
            <p style={{ color: "#999", textAlign: "center", padding: "2rem" }}>لا توجد تقارير جديدة حالياً.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {recentReports.map((report: any) => (
                <div key={report.id} style={{ padding: "1rem", borderBottom: "1px solid var(--border-light)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                    <strong>{report.supervisor.name}</strong>
                    <span style={{ fontSize: "0.8rem", color: "#999" }}>{egyptTime(report.createdAt)}</span>
                  </div>
                  <p style={{ margin: "0.5rem 0", color: "#444" }}>مدرسة: <strong>{report.visit?.school?.name}</strong></p>
                  <div style={{ fontSize: "0.9rem", color: "#555", background: "#f9f9f9", padding: "8px", borderRadius: "6px", borderRight: "3px solid var(--accent-gold)" }}>
                    {report.reportText}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
