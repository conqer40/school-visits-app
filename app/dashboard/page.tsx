import { prisma } from "@/lib/prisma";
import { getSession, egyptDate, egyptTime } from "@/lib/auth";
import { redirect } from "next/navigation";

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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ color: "#888", fontSize: "0.9rem" }}>
            التاريخ الحالي: {egyptDate(new Date())} | الساعة: {egyptTime(new Date())}
          </p>
          <div style={{ background: "var(--surface)", padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "0.9rem", fontWeight: "bold", color: "var(--primary-deep-blue)" }}>
             🕒 {new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>
      </header>

      <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
        <div className="card">
          <h3 style={{ fontSize: "1rem", color: "#666" }}>إجمالي المدارس</h3>
          <p style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--primary-deep-blue)" }}>{totalSchools}</p>
        </div>
        <div className="card">
          <h3 style={{ fontSize: "1rem", color: "#666" }}>إجمالي الموجهين</h3>
          <p style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--secondary-dark-navy)" }}>{totalSupervisors}</p>
        </div>
        <div className="card">
          <h3 style={{ fontSize: "1rem", color: "#666" }}>الزيارات المعلقة</h3>
          <p style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--accent-gold)" }}>{activeVisits}</p>
        </div>
        <div className="card">
          <h3 style={{ fontSize: "1rem", color: "#666" }}>نسبة التغطية</h3>
          <p style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--success)" }}>{coveragePercent}%</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr", gap: "2rem" }}>
        <section className="card">
          <h2 style={{ fontSize: "1.2rem", marginBottom: "1.5rem" }}>📝 آخر التقارير المرفوعة</h2>
          {recentReports.length === 0 ? (
            <p style={{ color: "#999", textAlign: "center", padding: "2rem" }}>لا توجد تقارير جديدة حالياً.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {recentReports.map((report: any) => (
                <div key={report.id} style={{ padding: "1rem", borderBottom: "1px solid var(--border-light)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
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
        </section>

        <section className="card" style={{ background: "var(--primary-deep-blue)", color: "white" }}>
          <h2 style={{ fontSize: "1.2rem", color: "var(--accent-gold)", marginBottom: "1rem" }}>💡 ملاحظات النسخة</h2>
          <ul style={{ paddingRight: "1.2rem", fontSize: "0.9rem", lineHeight: "1.6" }}>
            <li>تم تفعيل نظام تسجيل الدخول الموحد.</li>
            <li>إضافة خاصية تعديل المدارس والموجهين.</li>
            <li>تفعيل مركز التقارير اليومية للموجهين.</li>
            <li>تحسين خوارزمية التوزيع العادل للمدارس.</li>
          </ul>
          <div style={{ marginTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1rem", fontSize: "0.8rem", opacity: 0.8 }}>
            تنفيذ وإشراف: أ. محمد العسيلى<br/>
            وكيل إدارة غرب الزقازيق التعليمية
          </div>
        </section>
      </div>
    </div>
  );
}
