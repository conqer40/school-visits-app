import { prisma } from "@/lib/prisma";
import { getSession, egyptDate, egyptTime } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import ChartsSection from "@/app/components/ChartsSection";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  // If Supervisor, redirect to their schedule
  if (user.role === "SUPERVISOR") redirect("/my-schedule");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const monthWhere = {
    date: {
      gte: startOfMonth,
      lte: endOfMonth
    }
  };

  const totalSchools = await prisma.school.count({ where: { status: "ACTIVE" } });
  const totalSupervisors = await prisma.supervisor.count({ where: { isActive: true } });
  
  const activeVisits = await prisma.visit.count({
    where: { status: "PENDING", ...monthWhere }
  });
  
  const completedVisits = await prisma.visit.count({
    where: { status: "COMPLETED", ...monthWhere }
  });

  const excusedVisits = await prisma.visit.count({
    where: { status: "EXCUSED", ...monthWhere }
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

      {/* Quick Access Area */}
      <div style={{ marginBottom: "2rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
         <Link href="/chat" style={{ textDecoration: "none" }}>
            <div className="card-hover-effect" style={{ 
              background: "linear-gradient(135deg, #1e40af, #3b82f6)", 
              color: "white", 
              padding: "1.5rem", 
              borderRadius: "16px", 
              display: "flex", 
              alignItems: "center", 
              gap: "1.2rem",
              boxShadow: "0 10px 25px rgba(30, 64, 175, 0.25)",
              transition: "transform 0.2s"
            }}>
               <div style={{ fontSize: "2.5rem", background: "rgba(255,255,255,0.2)", width: "60px", height: "60px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>💬</div>
               <div>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "900" }}>غرفة الدردشة التخصصية</h3>
                  <p style={{ margin: "4px 0 0", fontSize: "0.85rem", opacity: 0.9 }}>تواصل مباشر مع الموجهين ومراقبة النقاشات.</p>
               </div>
            </div>
         </Link>

         <Link href="/settings" style={{ textDecoration: "none" }}>
            <div className="card-hover-effect" style={{ 
              background: "linear-gradient(135deg, #0f172a, #334155)", 
              color: "white", 
              padding: "1.5rem", 
              borderRadius: "16px", 
              display: "flex", 
              alignItems: "center", 
              gap: "1.2rem",
              boxShadow: "0 10px 25px rgba(15, 23, 42, 0.25)",
              transition: "transform 0.2s"
            }}>
               <div style={{ fontSize: "2.5rem", background: "rgba(255,255,255,0.2)", width: "60px", height: "60px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>⚙️</div>
               <div>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "900" }}>إعدادات الهوية والنظام</h3>
                  <p style={{ margin: "4px 0 0", fontSize: "0.85rem", opacity: 0.9 }}>تعديل المسميات الرسمية، الأسماء، وحقوق الملكية.</p>
               </div>
            </div>
         </Link>
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
