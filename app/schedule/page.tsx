import { prisma } from "@/lib/prisma";
import { generateScheduleAction, updateVisitStatusAction, clearPendingScheduleAction, adminAddManualVisitAction } from "./actions";
import Link from "next/link";
import ViewReportModal from "@/app/components/ViewReportModal";
import VisitAdminActions from "@/app/components/VisitAdminActions";
import AdminManualVisitForm from "@/app/components/AdminManualVisitForm";

export const dynamic = "force-dynamic";

export default async function SchedulePage({ searchParams }: { searchParams: Promise<{ day?: string, school?: string, supervisor?: string, exactDate?: string }> }) {
  const { day, school, supervisor, exactDate } = await searchParams;

  const whereClause: any = {};
  if (day) whereClause.dayOfWeek = day;
  if (school) whereClause.school = { name: { contains: school } };
  if (supervisor) whereClause.supervisor = { name: { contains: supervisor } };
  
  if (exactDate) {
    const [year, month, dayNum] = exactDate.split("-").map(Number);
    // Create local timezone bounds covering the whole selected local day
    const localDateStart = new Date(year, month - 1, dayNum);
    const localDateEnd = new Date(year, month - 1, dayNum + 1);
    whereClause.date = { gte: localDateStart, lt: localDateEnd };
  }

  const visits = await prisma.visit.findMany({
    where: whereClause,
    include: {
      school: true,
      supervisor: true,
      report: true
    },
    orderBy: { date: "asc" },
  });

  const allSchools = await prisma.school.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" } });
  const allSupervisors = await prisma.supervisor.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
        <h1 style={{ color: "var(--primary-deep-blue)", margin: 0 }}>📅 الجدول الشهري المعتمد</h1>
        
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <form action={clearPendingScheduleAction}>
            <button
              type="submit"
              className="btn-primary"
              style={{ background: "transparent", border: "2px solid var(--danger)", color: "var(--danger)" }}
            >
              مسح المعلق
            </button>
          </form>
          
          <form action={generateScheduleAction}>
            <button type="submit" className="btn-primary">
              توليد جدول ذكي للشهر
            </button>
          </form>
        </div>
      </div>

      <AdminManualVisitForm 
        schools={allSchools} 
        supervisors={allSupervisors} 
      />

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ marginTop: 0, marginBottom: "1rem", color: "var(--primary-deep-blue)", fontSize: "1rem" }}>🔍 تصفية الجدول</h3>
        <form style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          <input type="date" name="exactDate" defaultValue={exactDate || ""} style={{ padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--border)", fontFamily: "inherit" }} title="اختر تاريخ محدد" />
          <select name="day" defaultValue={day || ""} style={{ padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--border)", fontFamily: "inherit" }}>
            <option value="">كل الأيام</option>
            {["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <input type="text" name="school" defaultValue={school || ""} placeholder="بحث باسم المدرسة..." style={{ flex: 1, minWidth: "140px", padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--border)", fontFamily: "inherit" }} />
          <input type="text" name="supervisor" defaultValue={supervisor || ""} placeholder="بحث باسم الموجه..." style={{ flex: 1, minWidth: "140px", padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--border)", fontFamily: "inherit" }} />
          <button type="submit" className="btn-primary" style={{ padding: "0.6rem 1.2rem" }}>بحث</button>
          <Link href="/schedule" style={{ padding: "0.6rem 1rem", textDecoration: "none", color: "#666", border: "1px solid #ccc", borderRadius: "6px", background: "#f5f5f5" }}>
            مسح الفلاتر
          </Link>
        </form>
      </div>

      <div className="table-container">
        <table
          style={{ width: "100%", borderCollapse: "collapse", textAlign: "right" }}
        >
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border)", backgroundColor: "var(--surface)" }}>
              <th style={{ padding: "1rem" }}>#</th>
              <th style={{ padding: "1rem" }}>التاريخ</th>
              <th style={{ padding: "1rem" }}>اليوم</th>
              <th style={{ padding: "1rem" }}>المدرسة</th>
              <th style={{ padding: "1rem" }}>الموجه</th>
              <th style={{ padding: "1rem" }}>الحالة</th>
              <th style={{ padding: "1rem" }}>تحديث الحالة</th>
            </tr>
          </thead>
          <tbody>
            {(visits.length === 0 && !day && !school && !supervisor && !exactDate) && (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: "3rem",
                    textAlign: "center",
                    color: "var(--border-dark)",
                  }}
                >
                  <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>الجدول فارغ</p>
                  <p>اضغط على "توليد جدول ذكي" لتوزيع المدارس على الموجهين تلقائياً</p>
                </td>
              </tr>
            )}
            {(visits.length === 0 && (day || school || supervisor || exactDate)) && (
              <tr>
                <td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "var(--danger)" }}>
                  <p style={{ fontWeight: "bold" }}>لا توجد زيارات مطابقة للبحث!</p>
                </td>
              </tr>
            )}
            {visits.map((visit: any, i: number) => (
              <tr
                key={visit.id}
                style={{ borderBottom: "1px solid var(--border-light)" }}
              >
                <td style={{ padding: "1rem" }}>{i + 1}</td>
                <td style={{ padding: "1rem", fontWeight: "bold" }}>
                  {visit.date.toLocaleDateString("ar-EG")}
                </td>
                <td style={{ padding: "1rem" }}>{visit.dayOfWeek}</td>
                <td style={{ padding: "1rem", color: "var(--primary-deep-blue)", fontWeight: "bold" }}>
                  {visit.school.name}
                </td>
                <td style={{ padding: "1rem" }}>
                  {visit.supervisor.name}
                </td>
                <td style={{ padding: "1rem" }}>
                  <span
                    style={{
                      background: visit.status === "COMPLETED" ? "var(--success)" : visit.status === "MISSED" ? "var(--danger)" : "var(--accent-gold)",
                      color: visit.status === "PENDING" ? "var(--primary-deep-blue)" : "white",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "15px",
                      fontSize: "0.85em",
                      fontWeight: "bold"
                    }}
                  >
                    {visit.status === "PENDING" ? "معلقة" : visit.status === "COMPLETED" ? "مكتملة" : "ملغية"}
                  </span>
                  {visit.isManual && (
                    <div style={{ marginTop: "5.4px" }}>
                      <span style={{ fontSize: "0.7rem", padding: "2px 6px", borderRadius: "10px", background: visit.adminApproval === "PENDING" ? "#fef3c7" : visit.adminApproval === "APPROVED" ? "#dcfce7" : "#fee2e2", color: visit.adminApproval === "PENDING" ? "#92400e" : visit.adminApproval === "APPROVED" ? "#166534" : "#991b1b", border: "1px solid currentColor" }}>
                         {visit.adminApproval === "PENDING" ? "طلب يدوي - قيد الانتظار" : visit.adminApproval === "APPROVED" ? "طلب يدوي - مقبول" : "طلب يدوي - مرفوض"}
                      </span>
                    </div>
                  )}
                  {visit.checkInLat && visit.checkInLng && (
                    <div style={{ marginTop: "0.5rem" }}>
                      <a href={`https://maps.google.com/?q=${visit.checkInLat},${visit.checkInLng}`} target="_blank" style={{ fontSize: "0.75rem", color: "var(--primary-deep-blue)", fontWeight: "bold", textDecoration: "none", background: "#eef2f5", padding: "4px 8px", borderRadius: "12px", border: "1px solid var(--border)" }}>
                        📍 موقع الحضور
                      </a>
                    </div>
                  )}
                  {visit.checkInTime && (
                    <div style={{ fontSize: "0.7rem", color: "#888", marginTop: "4px" }}>
                       {visit.checkInTime.toLocaleTimeString("ar-EG")}
                    </div>
                  )}
                </td>
                <td style={{ padding: "1rem" }}>
                  {(visit.status === "COMPLETED" || visit.status === "EXCUSED") ? (
                    <ViewReportModal 
                       reportText={visit.report?.reportText} 
                       isExcuse={visit.report?.isExcuse}
                       excuseReason={visit.report?.excuseReason}
                       supervisorName={visit.supervisor.name}
                       schoolName={visit.school.name}
                       date={visit.date.toLocaleDateString("ar-EG")}
                    />
                  ) : visit.status === "PENDING" && (
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                       <VisitAdminActions 
                          visit={visit} 
                          schools={allSchools} 
                          supervisors={allSupervisors} 
                       />
                       
                       <form action={updateVisitStatusAction.bind(null, visit.id, "COMPLETED")}>
                          <button type="submit" style={{ padding: "0.4rem 0.8rem", background: "var(--success)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontFamily: "inherit", fontSize: "0.8rem" }}>
                            إنجاز
                          </button>
                       </form>
                       <form action={updateVisitStatusAction.bind(null, visit.id, "MISSED")}>
                          <button type="submit" style={{ padding: "0.4rem 0.8rem", background: "var(--danger)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontFamily: "inherit", fontSize: "0.8rem" }}>
                            إلغاء
                          </button>
                       </form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
