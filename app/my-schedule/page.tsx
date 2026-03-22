import { prisma } from "@/lib/prisma";
import { getSession, egyptDate } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import CheckInButton from "@/app/components/CheckInButton";

export const dynamic = "force-dynamic";

export default async function MySchedulePage() {
  const user = await getSession();
  if (!user || user.role !== "SUPERVISOR") redirect("/login");

  const visits = await prisma.visit.findMany({
    where: { supervisorId: user.supervisorId! },
    include: { school: true },
    orderBy: { date: "asc" },
  });

  const todayEgy = egyptDate(new Date());
  const todayVisits = visits.filter(v => egyptDate(v.date) === todayEgy);

  const completedCount = visits.filter(v => v.status === "COMPLETED").length;
  const pendingCount = visits.filter(v => v.status === "PENDING").length;
  const totalCount = visits.length;

  return (
    <div dir="rtl">
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ color: "var(--primary-deep-blue)" }}>جدول زياراتي</h1>
          <p style={{ color: "var(--border-dark)" }}>اهلا بك، أ/ {user.supervisor?.name}</p>
        </div>
        <Link href="/my-schedule/settings" style={{ padding: "0.6rem 1rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", textDecoration: "none", color: "#666", fontSize: "0.9rem" }}>
          ⚙️ إعدادات الحساب
        </Link>
      </div>

      <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        <div className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
          <h3 style={{ fontSize: "1rem", color: "#666", margin: "0 0 0.5rem 0" }}>إجمالي الزيارات</h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--primary-deep-blue)", margin: 0 }}>{totalCount}</p>
        </div>
        <div className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
          <h3 style={{ fontSize: "1rem", color: "#666", margin: "0 0 0.5rem 0" }}>ما تم إنجازه</h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--success)", margin: 0 }}>{completedCount}</p>
        </div>
        <div className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
          <h3 style={{ fontSize: "1rem", color: "#666", margin: "0 0 0.5rem 0" }}>المتبقي / معلق</h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--accent-gold)", margin: 0 }}>{pendingCount}</p>
        </div>
      </div>

      <div style={{ display: "grid", gap: "2rem" }}>
        {/* Today's Visits Section */}
        <section className="card" style={{ borderRight: "4px solid var(--accent-gold)" }}>
          <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>🗓️ زيارات اليوم ({egyptDate(new Date())})</h2>
          {todayVisits.length === 0 ? (
            <p style={{ color: "#888" }}>لا توجد زيارات مجدولة لليوم.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {todayVisits.map(visit => (
                <div key={visit.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem", background: "var(--surface)", borderRadius: "8px", border: "1px solid var(--border-light)" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.2rem", color: "var(--primary-deep-blue)" }}>{visit.school.name}</h3>
                    <div style={{ fontSize: "0.9rem", color: "#666", marginTop: "0.5rem" }}>
                       الحالة: <span style={{ fontWeight: "bold", color: visit.status === "PENDING" ? "var(--accent-gold)" : "var(--success)" }}>
                          {visit.status === "PENDING" ? "⏳ معلقة" : visit.status}
                       </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                    {visit.status === "PENDING" && !visit.checkInTime && (
                       <CheckInButton visitId={visit.id} />
                    )}
                    {visit.status === "PENDING" && visit.checkInTime && (
                      <Link href={`/submit-report/${visit.id}`} className="btn-primary" style={{ textDecoration: "none", fontSize: "0.9rem", padding: "0.6rem 1.2rem" }}>
                        📝 كتابة التقرير
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Full Schedule Table */}
        <section className="card">
          <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>📅 الجدول الكامل لهذا الشهر</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)", backgroundColor: "var(--surface)" }}>
                  <th style={{ padding: "1rem" }}>التاريخ</th>
                  <th style={{ padding: "1rem" }}>اليوم</th>
                  <th style={{ padding: "1rem" }}>المدرسة</th>
                  <th style={{ padding: "1rem" }}>الحالة</th>
                  <th style={{ padding: "1rem" }}>الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {visits.map(visit => (
                  <tr key={visit.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "1rem" }}>{egyptDate(visit.date)}</td>
                    <td style={{ padding: "1rem" }}>{visit.dayOfWeek}</td>
                    <td style={{ padding: "1rem", fontWeight: "bold" }}>{visit.school.name}</td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{
                        background: visit.status === "COMPLETED" ? "var(--success)" : visit.status === "EXCUSED" ? "var(--danger)" : "var(--accent-gold)",
                        color: "white", padding: "0.25rem 0.75rem", borderRadius: "15px", fontSize: "0.75em"
                      }}>
                        {visit.status === "PENDING" ? "انتظار" : visit.status === "COMPLETED" ? "تمت" : "اعتذار"}
                      </span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      {visit.status === "PENDING" && (
                        <Link href={`/submit-report/${visit.id}`} style={{ color: "var(--primary-deep-blue)", fontWeight: "bold", textDecoration: "none" }}>
                          تقرير
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
