import { prisma } from "@/lib/prisma";
import { getSession, egyptDateTime } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MyReportsPage() {
  const user = await getSession();
  if (!user || user.role !== "SUPERVISOR") redirect("/login");

  const reports = await prisma.visitReport.findMany({
    where: { supervisorId: user.supervisorId! },
    include: { visit: { include: { school: true } } },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div dir="rtl">
      <h1 style={{ color: "var(--primary-deep-blue)", marginBottom: "2rem" }}>📝 أرشيف تقاريري</h1>

      <div className="card">
        {reports.length === 0 ? (
          <p style={{ textAlign: "center", padding: "3rem", color: "#999" }}>لم تقم بتقديم أي تقارير بعد.</p>
        ) : (
          <div className="table-container">
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)", backgroundColor: "var(--surface)" }}>
                  <th style={{ padding: "1rem" }}>التاريخ</th>
                  <th style={{ padding: "1rem" }}>المدرسة</th>
                  <th style={{ padding: "1rem" }}>النوع</th>
                  <th style={{ padding: "1rem" }}>التفاصيل</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "1rem", fontSize: "0.9rem" }}>{egyptDateTime(report.createdAt)}</td>
                    <td style={{ padding: "1rem", fontWeight: "bold" }}>{report.visit.school.name}</td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{
                        background: report.isExcuse ? "var(--danger)" : "var(--success)",
                        color: "white", padding: "0.2rem 0.6rem", borderRadius: "10px", fontSize: "0.8rem"
                      }}>
                        {report.isExcuse ? "اعتذار" : "تقرير"}
                      </span>
                    </td>
                    <td style={{ padding: "1rem", fontSize: "0.9rem", color: "#555" }}>
                      {report.reportText}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p style={{ textAlign: "center", marginTop: "3rem", color: "#bbb", fontSize: "0.75rem" }}>
        إدارة غرب الزقازيق التعليمية — جميع الحقوق محفوظة
      </p>
    </div>
  );
}
