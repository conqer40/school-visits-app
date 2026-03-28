import { prisma } from "@/lib/prisma";
import { getSession, egyptDateTime } from "@/lib/auth";
import { redirect } from "next/navigation";
import ExcelExportButton from "@/app/components/ExcelExportButton";
import { approveExcuseAction, rejectExcuseAction } from "@/app/schedule/actions";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const totalSchools = await prisma.school.count();
  const unvisitedSchools = await prisma.school.count({
    where: { lastVisitDate: null }
  });

  const logs = await prisma.log.findMany({
    orderBy: { createdAt: "desc" },
    take: 20
  });

  const reports = await prisma.visitReport.findMany({
    include: {
      supervisor: true,
      visit: { include: { school: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 20
  });

  return (
    <div dir="rtl">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <h1 style={{ color: "var(--primary-deep-blue)", margin: 0 }}>📊 التقارير والنشاط</h1>
        <ExcelExportButton type="reports" label="تصدير Excel" />
      </div>

      <div className="grid-responsive" style={{ marginBottom: "2.5rem" }}>
        <div className="card" style={{ borderRight: "4px solid var(--primary-deep-blue)" }}>
          <h3 style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>إجمالي المدارس</h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold", margin: "0.5rem 0" }}>{totalSchools}</p>
        </div>
        <div className="card" style={{ borderRight: "4px solid var(--danger)" }}>
          <h3 style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>مدارس لم تزار أبداً</h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold", margin: "0.5rem 0", color: "var(--danger)" }}>{unvisitedSchools}</p>
        </div>
        <div className="card" style={{ borderRight: "4px solid var(--success)" }}>
          <h3 style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>نسبة التغطية الكلية</h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold", margin: "0.5rem 0", color: "var(--success)" }}>
            {totalSchools > 0 ? Math.round(((totalSchools - unvisitedSchools) / totalSchools) * 100) : 0}%
          </p>
        </div>
      </div>

      <div className="grid-responsive">
        {/* Reports Section */}
        <section className="card">
          <h2 style={{ fontSize: "1.2rem", marginBottom: "1.5rem", borderBottom: "2px solid var(--border-light)", paddingBottom: "0.5rem" }}>
            📝 آخر تقارير الموجهين
          </h2>
          {reports.length === 0 ? (
            <p style={{ color: "#888" }}>لا توجد تقارير مقدمة حالياً.</p>
          ) : (
            reports.map(report => (
              <div key={report.id} style={{ padding: "1rem", borderBottom: "1px solid var(--border-light)", marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <strong style={{ color: "var(--primary-deep-blue)" }}>أ/ {report.supervisor.name}</strong>
                  <span style={{ fontSize: "0.8rem", color: "#999" }}>{egyptDateTime(report.createdAt)}</span>
                </div>
                <div style={{ color: "#444", fontSize: "0.9rem" }}>
                  مدرسة: <strong style={{ color: "var(--secondary-dark-navy)" }}>{report.visit.school.name}</strong>
                </div>
                {report.isExcuse ? (
                  <div style={{ color: "var(--danger)", background: "#fff5f5", padding: "1rem", borderRadius: "8px", marginTop: "0.5rem", border: "1px solid #fee2e2" }}>
                    <div style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>🛑 اعتذار: {report.reportText}</div>
                    {report.replacementName && (
                      <div style={{ color: "var(--success)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                        👤 البديل المقترح: <strong>{report.replacementName}</strong>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
                      <div style={{ fontSize: "0.8rem" }}>
                         الحالة: 
                         <span style={{ 
                           marginLeft: "10px", 
                           fontWeight: "bold", 
                           color: report.excuseStatus === "PENDING" ? "var(--accent-gold)" : report.excuseStatus === "APPROVED" ? "var(--success)" : "var(--danger)" 
                         }}>
                           {report.excuseStatus === "PENDING" ? "⏳ في انتظار الاعتماد" : report.excuseStatus === "APPROVED" ? "✅ معتمد" : "❌ مرفوض"}
                         </span>
                      </div>
                      
                      {report.excuseStatus === "PENDING" && (
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                           <form action={approveExcuseAction.bind(null, report.id)}>
                              <button type="submit" style={{ padding: "0.4rem 0.8rem", background: "var(--success)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}>
                                اعتماد
                              </button>
                           </form>
                           <form action={rejectExcuseAction.bind(null, report.id)}>
                              <button type="submit" style={{ padding: "0.4rem 0.8rem", background: "var(--danger)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}>
                                رفض
                              </button>
                           </form>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ color: "#555", marginTop: "0.5rem", fontStyle: "italic" }}>
                    ✅ تقرير: {report.reportText}
                  </div>
                )}
              </div>
            ))
          )}
        </section>

        {/* System Logs Section */}
        <section className="card">
          <h2 style={{ fontSize: "1.2rem", marginBottom: "1.5rem", borderBottom: "2px solid var(--border-light)", paddingBottom: "0.5rem" }}>
            🕒 سجل النشاط (System Logs)
          </h2>
          <div style={{ fontSize: "0.85rem" }}>
            {logs.map(log => (
              <div key={log.id} style={{ padding: "0.75rem", borderBottom: "1px solid var(--border-light)" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: "bold", color: "var(--primary-deep-blue)" }}>{log.action}</span>
                  <span style={{ color: "#999" }}>{egyptDateTime(log.createdAt)}</span>
                </div>
                <div style={{ color: "#666", marginTop: "0.2rem" }}>{log.details}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div style={{ marginTop: "3rem", textAlign: "center", borderTop: "1px solid var(--border-light)", paddingTop: "1rem" }}>
        <p style={{ color: "var(--border-dark)", fontSize: "0.8rem" }}>
          إدارة غرب الزقازيق التعليمية — أ. محمد العسيلى
        </p>
      </div>
    </div>
  );
}
