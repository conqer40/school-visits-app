import { prisma } from "@/lib/prisma";
import { getSession, egyptDate } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import CheckInButton from "@/app/components/CheckInButton";
import { addManualVisitAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function MySchedulePage() {
  const user = await getSession();
  if (!user || user.role !== "SUPERVISOR") redirect("/login");

  const visits = await prisma.visit.findMany({
    where: { supervisorId: user.supervisorId! },
    include: { school: true },
    orderBy: { date: "asc" },
  });

  const allSchools = await prisma.school.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" }
  });

  const todayEgy = egyptDate(new Date());
  const todayVisits = visits.filter(v => egyptDate(v.date) === todayEgy);

  const completedCount = visits.filter(v => v.status === "COMPLETED").length;
  const pendingCount = visits.filter(v => v.status === "PENDING").length;
  const totalCount = visits.length;

  return (
    <div dir="rtl">
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ color: "var(--primary-deep-blue)", margin: 0 }}>جدول زياراتي</h1>
          <p style={{ color: "var(--border-dark)", margin: "0.4rem 0 0" }}>اهلا بك، أ/ {user.supervisor?.name}</p>
        </div>
        <Link href="/my-schedule/settings" style={{ padding: "0.6rem 1rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", textDecoration: "none", color: "#666", fontSize: "0.9rem" }}>
          ⚙️ إعدادات الحساب
        </Link>
      </div>

      <div className="grid-responsive" style={{ marginBottom: "2rem" }}>
        <div className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
          <h3 style={{ fontSize: "1rem", color: "#666", margin: "0 0 0.5rem 0" }}>إجمالي الزيارات</h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--primary-deep-blue)", margin: 0 }}>{totalCount}</p>
        </div>
        <div className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
          <h3 style={{ fontSize: "1rem", color: "#666", margin: "0 0 0.5rem 0" }}>ما تم إنجازه</h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--success)", margin: 0 }}>{completedCount}</p>
        </div>
        <Link href="/chat" style={{ textDecoration: "none" }}>
          <div className="card-hover-effect" style={{
            padding: "1.5rem",
            textAlign: "center",
            background: "linear-gradient(135deg, #2563eb, #60a5fa)",
            color: "white",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            boxShadow: "0 8px 20px rgba(37, 99, 235, 0.2)",
            transition: "transform 0.2s"
          }}>
            <h3 style={{ fontSize: "1rem", color: "rgba(255,255,255,0.9)", margin: "0 0 0.5rem 0" }}>💬 غرفة الدردشة</h3>
            <p style={{ fontSize: "1.2rem", fontWeight: "bold", margin: 0 }}>تواصل مع التخصص</p>
          </div>
        </Link>
        <div className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
          <h3 style={{ fontSize: "1rem", color: "#666", margin: "0 0 0.5rem 0" }}>المتبقي / معلق</h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--accent-gold)", margin: 0 }}>{pendingCount}</p>
        </div>
      </div>

      <div style={{ display: "grid", gap: "2rem" }}>
        {/* Manual Visit Request Card */}
        <section className="card" style={{ borderRight: "4px solid var(--primary-deep-blue)" }}>
          <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>➕ إضافة زيارة يدوية (تطلب موافقة الأدمن)</h2>
          <form action={addManualVisitAction} style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.4rem", color: "#666" }}>اختر المدرسة:</label>
              <select name="schoolId" required style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--border)" }}>
                <option value="">-- اختر مدرسة --</option>
                {allSchools.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.levels})</option>
                ))}
              </select>
            </div>
            <div style={{ width: "160px" }}>
              <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.4rem", color: "#666" }}>التاريخ:</label>
              <input type="date" name="date" required style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--border)" }} />
            </div>
            <button type="submit" className="btn-primary" style={{ padding: "0.7rem 1.5rem" }}>إرسال الطلب</button>
          </form>
        </section>

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
          <div className="table-container">
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
                      {visit.isManual && (
                        <div style={{ fontSize: "0.7rem", marginTop: "5px", color: visit.adminApproval === "PENDING" ? "var(--accent-gold)" : visit.adminApproval === "APPROVED" ? "var(--success)" : "var(--danger)" }}>
                          {visit.adminApproval === "PENDING" ? "⏳ في انتظار الموافقة" : visit.adminApproval === "APPROVED" ? "✅ تمت الموافقة" : "❌ مرفوض"}
                        </div>
                      )}
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
