import { prisma } from "@/lib/prisma";
import { getSession, egyptDate } from "@/lib/auth";
import { redirect } from "next/navigation";
import PrintButton from "@/app/components/PrintButton";

export const dynamic = "force-dynamic";

export default async function AdvancedReportsPage({ searchParams }: { searchParams: Promise<{ 
  month?: string, 
  year?: string, 
  supervisorId?: string,
  schoolId?: string,
  type?: "daily" | "weekly" | "monthly"
}>}) {
  const params = await searchParams;
  const user = await getSession();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const now = new Date();
  const selectedMonth = params.month ? parseInt(params.month) : now.getMonth();
  const selectedYear = params.year ? parseInt(params.year) : now.getFullYear();
  const type = params.type || "monthly";

  // Arabic Months
  const arabicMonths = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  // Fetch data with explicit relation includes
  const supervisors = await prisma.supervisor.findMany({ orderBy: { name: "asc" } });
  const schools = await prisma.school.findMany({ orderBy: { name: "asc" } });

  const where: any = {};
  if (type === "monthly") {
    const startDate = new Date(selectedYear, selectedMonth, 1);
    const endDate = new Date(selectedYear, selectedMonth + 1, 0);
    where.date = { gte: startDate, lte: endDate };
  } else if (type === "daily") {
    const startOfDay = new Date(new Date().setHours(0,0,0,0));
    const endOfDay = new Date(new Date().setHours(23,59,59,999));
    where.date = { gte: startOfDay, lte: endOfDay };
  }

  if (params.supervisorId) where.supervisorId = parseInt(params.supervisorId);
  if (params.schoolId) where.schoolId = parseInt(params.schoolId);

  // Fetch visits with relations
  const visits = await prisma.visit.findMany({
    where,
    include: { 
      school: true, 
      supervisor: true, 
      report: true 
    } as any, // Bypass Prisma type mismatch if needed
    orderBy: { date: "asc" }
  });

  return (
    <div dir="rtl" className="report-container">
      {/* Filters - Hidden in Print */}
      <div className="no-print" style={{ marginBottom: "2.5rem", background: "white", padding: "1.5rem 2rem", borderRadius: "16px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", borderTop: "5px solid var(--primary-deep-blue)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid #eee", paddingBottom: "1rem" }}>
           <h2 style={{ fontSize: "1.3rem", margin: 0, color: "var(--primary-deep-blue)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
             <span style={{ fontSize: "1.5rem" }}>⚙️</span> إعدادات تخصيص الطباعة والتقارير
           </h2>
           <PrintButton />
        </div>
        <form action="" method="get" style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 150px" }}>
            <label style={{ display: "block", fontSize: "0.9rem", color: "#555", marginBottom: "0.5rem", fontWeight: "bold" }}>نطاق العرض:</label>
            <select name="type" defaultValue={type} className="input-field" style={{ width: "100%", padding: "0.7rem", borderRadius: "8px", border: "1px solid #dcdcdc", background: "#f9f9f9" }}>
              <option value="daily">تقرير يومي (اليوم فقط)</option>
              <option value="weekly">تقرير أسبوعي</option>
              <option value="monthly">خطة شهرية شاملة</option>
            </select>
          </div>
          <div style={{ flex: "1 1 120px" }}>
            <label style={{ display: "block", fontSize: "0.9rem", color: "#555", marginBottom: "0.5rem", fontWeight: "bold" }}>تحديد الشهر:</label>
            <select name="month" defaultValue={selectedMonth} className="input-field" style={{ width: "100%", padding: "0.7rem", borderRadius: "8px", border: "1px solid #dcdcdc", background: "#f9f9f9" }}>
              {arabicMonths.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: "1 1 180px" }}>
            <label style={{ display: "block", fontSize: "0.9rem", color: "#555", marginBottom: "0.5rem", fontWeight: "bold" }}>تصفية بموجه محدد:</label>
            <select name="supervisorId" defaultValue={params.supervisorId || ""} className="input-field" style={{ width: "100%", padding: "0.7rem", borderRadius: "8px", border: "1px solid #dcdcdc", background: "#f9f9f9" }}>
              <option value="">جميع الموجهين (عرض الكل)</option>
              {supervisors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div style={{ flex: "1 1 180px" }}>
            <label style={{ display: "block", fontSize: "0.9rem", color: "#555", marginBottom: "0.5rem", fontWeight: "bold" }}>تصفية بمدرسة محددة:</label>
            <select name="schoolId" defaultValue={params.schoolId || ""} className="input-field" style={{ width: "100%", padding: "0.7rem", borderRadius: "8px", border: "1px solid #dcdcdc", background: "#f9f9f9" }}>
              <option value="">جميع المدارس (عرض الكل)</option>
              {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div style={{ flex: "0 0 auto", minWidth: "120px" }}>
            <button type="submit" className="btn-primary" style={{ width: "100%", padding: "0.75rem 1.5rem", fontSize: "1rem", borderRadius: "8px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
              🔄 تطبيق
            </button>
          </div>
        </form>
      </div>

      {/* Report Header - For Print */}
      <div className="print-only" style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 style={{ margin: 0 }}>وزارة التربية والتعليم والتعليم الفني</h1>
        <h2 style={{ margin: "0.5rem 0" }}>مديرية التربية والتعليم بالشرقية</h2>
        <h3 style={{ margin: 0 }}>إدارة غرب الزقازيق التعليمية — وكالة الإدارة</h3>
        <hr style={{ margin: "1rem 0", border: "1px solid #000" }} />
        <h2 style={{ textDecoration: "underline" }}>
          {type === "monthly" ? `خطة زيارات شهر ${arabicMonths[selectedMonth]} ${selectedYear}م` : 
           type === "daily" ? `بيان زيارات يوم ${egyptDate(new Date())}` : "تقرير الزيارات"}
        </h2>
      </div>

      {/* Report Table */}
      <div className="card" style={{ padding: "0" }}>
        <table className="report-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "center" }}>
          <thead>
            <tr style={{ background: "#f0f0f0", borderBottom: "2px solid #000" }}>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>م</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>التاريخ / اليوم</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>اسم الموجه</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>المدرسة المراد زيارتها</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>ملاحظات الزيارة (أهم المشكلات والإيجابيات)</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>الحالة</th>
            </tr>
          </thead>
          <tbody>
            {visits.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: "2rem" }}>لا توجد بيانات متاحة لهذا العرض.</td></tr>
            ) : (
              visits.map((visit: any, index) => (
                <tr key={visit.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{index + 1}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    <div style={{ fontWeight: "bold" }}>{visit.dayOfWeek}</div>
                    <div style={{ fontSize: "0.8rem" }}>{egyptDate(visit.date)}</div>
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>أ/ {visit.supervisor?.name}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd", fontWeight: "bold" }}>{visit.school?.name}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd", fontSize: "0.9rem", textAlign: "right" }}>
                    {/* Combine Visit Notes and VisitReport Text */}
                    {visit.notes && <div style={{ direction: "rtl", marginBottom: "5px" }}>📌 {visit.notes}</div>}
                    {visit.report?.reportText && <div style={{ direction: "rtl", color: "#444" }}>📝 {visit.report.reportText}</div>}
                    {!visit.notes && !visit.report?.reportText && <span style={{ color: "#ccc" }}>— لا توجد ملاحظات —</span>}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd", fontSize: "0.85rem" }}>
                    {visit.status === "COMPLETED" ? (
                      <span style={{ color: "green", fontWeight: "bold" }}>✅ تمت الزيارة</span>
                    ) : visit.status === "EXCUSED" ? (
                      <span style={{ color: "red", fontWeight: "bold" }}>🚫 اعتذار ({visit.report?.excuseReason})</span>
                    ) : (
                      <span style={{ color: "#999" }}>لم يتم التقرير بعد</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer for Signature */}
      <div className="print-only" style={{ marginTop: "4rem", display: "flex", justifyContent: "space-between", padding: "0 2rem" }}>
        <div style={{ textAlign: "center" }}>
          <p>يعتمد،،</p>
          <p style={{ fontWeight: "bold", marginTop: "1rem" }}>وكيل الإدارة</p>
          <p style={{ marginTop: "2rem" }}>أ. محمد العسيلى</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p>تحريراً في: {egyptDate(new Date())}</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p>توقيع المنسق</p>
          <div style={{ marginTop: "3rem", width: "150px", borderBottom: "1px solid #000" }}></div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; padding: 0 !important; }
          .card { border: none !important; box-shadow: none !important; padding: 0 !important; }
          .main-content { margin: 0 !important; padding: 0 !important; width: 100% !important; }
          .sidebar { display: none !important; }
          .report-table th, .report-table td { border: 1px solid #000 !important; color: black !important; }
        }
        .print-only { display: none; }
        .input-field { width: 100%; padding: 0.5rem; border-radius: 6px; border: 1px solid #ccc; font-family: inherit; }
      `}} />
    </div>
  );
}
