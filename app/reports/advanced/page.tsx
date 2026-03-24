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
    } as any, 
    orderBy: { date: "asc" }
  });

  return (
    <div dir="rtl" className="report-container" style={{ minHeight: "100vh", paddingBottom: "3rem" }}>
      {/* Filters - Hidden in Print */}
      <div className="no-print card" style={{ marginBottom: "2rem", padding: "2rem", borderTop: "5px solid var(--accent-gold)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
           <h2 style={{ fontSize: "1.4rem", margin: 0, color: "var(--primary-deep-blue)", display: "flex", alignItems: "center", gap: "0.8rem", fontWeight: "900" }}>
             <span style={{ padding: "0.5rem", background: "rgba(37,99,235,0.1)", borderRadius: "10px", display: "flex" }}>⚙️</span> 
             تخصيص التقارير وخطط الطباعة
           </h2>
           <PrintButton />
        </div>
        
        <form action="" method="get" className="grid-responsive" style={{ gap: "1.5rem", alignItems: "flex-end", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", color: "var(--secondary-dark-navy)", marginBottom: "0.5rem", fontWeight: "800" }}>نطاق العرض:</label>
            <select name="type" defaultValue={type} className="input-field" style={{ width: "100%", padding: "0.8rem", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--background-light)", fontWeight: "600" }}>
              <option value="daily">تقرير يومي (اليوم فقط)</option>
              <option value="weekly">تقرير أسبوعي</option>
              <option value="monthly">خطة شهرية شاملة</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", color: "var(--secondary-dark-navy)", marginBottom: "0.5rem", fontWeight: "800" }}>الشهر (للخطة الشهرية):</label>
            <select name="month" defaultValue={selectedMonth} className="input-field" style={{ width: "100%", padding: "0.8rem", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--background-light)", fontWeight: "600" }}>
              {arabicMonths.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", color: "var(--secondary-dark-navy)", marginBottom: "0.5rem", fontWeight: "800" }}>تصفية بموجه محدد:</label>
            <select name="supervisorId" defaultValue={params.supervisorId || ""} className="input-field" style={{ width: "100%", padding: "0.8rem", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--background-light)", fontWeight: "600" }}>
              <option value="">جميع الموجهين (عرض الكل)</option>
              {supervisors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", color: "var(--secondary-dark-navy)", marginBottom: "0.5rem", fontWeight: "800" }}>تصفية بمدرسة محددة:</label>
            <select name="schoolId" defaultValue={params.schoolId || ""} className="input-field" style={{ width: "100%", padding: "0.8rem", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--background-light)", fontWeight: "600" }}>
              <option value="">جميع المدارس (عرض الكل)</option>
              {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <button type="submit" className="btn-primary" style={{ width: "100%", padding: "0.8rem", fontSize: "1.05rem", borderRadius: "10px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
              🔄 عرض التقرير
            </button>
          </div>
        </form>
      </div>

      {/* 🧾 Document to Print */}
      <div className="printable-document" style={{ background: "white", padding: "2rem", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
        
        {/* Report Header - Formal Layout */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", borderBottom: "3px double #000", paddingBottom: "1.5rem" }}>
          <div style={{ textAlign: "right", lineHeight: "1.6" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "bold" }}>وزارة التربية والتعليم والتعليم الفني</h3>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "bold" }}>مديرية التربية والتعليم بالشرقية</h3>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "bold" }}>إدارة غرب الزقازيق التعليمية — التوجيه</h3>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "80px", height: "80px", border: "2px solid #000", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", fontWeight: "bold", fontSize: "1.5rem" }}>شعار</div>
          </div>
          <div style={{ textAlign: "left", lineHeight: "1.6", minWidth: "200px" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "bold" }}>السجل المرجعي للزيارات</h3>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "bold" }}>تاريخ الإصدار: {egyptDate(new Date())}</h3>
          </div>
        </div>

        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h2 style={{ display: "inline-block", border: "2px solid #000", padding: "0.5rem 2rem", borderRadius: "30px", fontSize: "1.4rem", fontWeight: "900", background: "#f8f9fa" }}>
            {type === "monthly" ? `الخطة الاستراتيجية للزيارات الميدانية - شهر ${arabicMonths[selectedMonth]} ${selectedYear}م` : 
             type === "daily" ? `البيان اليومي المجمع لزيارات الموجهين - ${egyptDate(new Date())}` : "التقرير التحليلي لزيارات المدارس"}
          </h2>
        </div>

        {/* Report Table */}
        <table className="report-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "center" }}>
          <thead>
            <tr style={{ background: "#e2e8f0" }}>
              <th style={{ padding: "12px 8px", border: "2px solid #000", width: "5%" }}>م</th>
              <th style={{ padding: "12px 8px", border: "2px solid #000", width: "15%" }}>التاريخ / اليوم</th>
              <th style={{ padding: "12px 8px", border: "2px solid #000", width: "20%" }}>اسم الموجه المشرف</th>
              <th style={{ padding: "12px 8px", border: "2px solid #000", width: "20%" }}>المدرسة المستهدفة</th>
              <th style={{ padding: "12px 8px", border: "2px solid #000", width: "25%" }}>الموقف والإجراءات المتخذة</th>
              <th style={{ padding: "12px 8px", border: "2px solid #000", width: "15%" }}>قرار المتابعة</th>
            </tr>
          </thead>
          <tbody>
            {visits.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: "3rem", fontSize: "1.2rem", fontWeight: "bold" }}>لا توجد بيانات مسجلة في هذا النطاق الزمني.</td></tr>
            ) : (
              visits.map((visit: any, index) => (
                <tr key={visit.id}>
                  <td style={{ padding: "12px 8px", border: "1px solid #000", fontWeight: "bold" }}>{index + 1}</td>
                  <td style={{ padding: "12px 8px", border: "1px solid #000" }}>
                    <div style={{ fontWeight: "900", color: "#1e293b" }}>{visit.dayOfWeek}</div>
                    <div style={{ fontSize: "0.85rem", color: "#475569" }}>{new Date(visit.date).toLocaleDateString("en-GB")}</div>
                  </td>
                  <td style={{ padding: "12px 8px", border: "1px solid #000", fontWeight: "700" }}>أ. {visit.supervisor?.name}</td>
                  <td style={{ padding: "12px 8px", border: "1px solid #000", fontWeight: "900" }}>{visit.school?.name}</td>
                  <td style={{ padding: "12px 8px", border: "1px solid #000", fontSize: "0.95rem", textAlign: "right", verticalAlign: "top" }}>
                    {visit.notes && <div style={{ marginBottom: "8px", fontWeight: "600" }}><span style={{color:"#000"}}>هدف:</span> {visit.notes}</div>}
                    {visit.report?.reportText && <div style={{ color: "#333" }}><span style={{color:"#000", fontWeight:"bold"}}>التقرير:</span> {visit.report.reportText}</div>}
                    {!visit.notes && !visit.report?.reportText && <span style={{ color: "#94a3b8" }}>— بانتظار إفادة الموجه —</span>}
                  </td>
                  <td style={{ padding: "12px 8px", border: "1px solid #000", fontSize: "0.95rem", fontWeight: "bold" }}>
                    {visit.status === "COMPLETED" ? (
                      <span style={{ color: "#166534", background: "#dcfce7", padding: "4px 8px", borderRadius: "12px", border: "1px solid #166534" }}>تمت الزيارة</span>
                    ) : visit.status === "EXCUSED" ? (
                      <div style={{ color: "#991b1b", background: "#fee2e2", padding: "4px 8px", borderRadius: "12px", border: "1px solid #991b1b" }}>
                        اعتذر<br/><span style={{fontSize:"0.75rem"}}>({visit.report?.excuseReason})</span>
                      </div>
                    ) : (
                      <span style={{ color: "#64748b" }}>مُجدولة</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer for Signature */}
        <div style={{ marginTop: "4rem", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2rem", padding: "0 2rem", textAlign: "center", pageBreakInside: "avoid" }}>
          <div>
            <p style={{ fontWeight: "bold", fontSize: "1.1rem" }}>الموجه الأول / المنسق</p>
            <div style={{ marginTop: "3rem", width: "70%", margin: "3rem auto 0", borderBottom: "1px dashed #000" }}></div>
          </div>
          <div>
            <p style={{ fontWeight: "bold", fontSize: "1.1rem" }}>مدير التعليم</p>
            <div style={{ marginTop: "3rem", width: "70%", margin: "3rem auto 0", borderBottom: "1px dashed #000" }}></div>
          </div>
          <div>
            <p style={{ fontWeight: "bold", fontSize: "1.1rem" }}>يعتمد، وكيل الإدارة</p>
            <p style={{ marginTop: "1rem", fontWeight: "900", fontSize: "1.2rem" }}>أ. محمد العسيلى</p>
            <div style={{ marginTop: "1rem", width: "70%", margin: "1rem auto 0", borderBottom: "1px dashed #000" }}></div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        /* PDF and Layout Optimization */
        .printable-document { margin: 0 auto; max-width: 100%; transition: all 0.3s; }
        
        @media print {
          @page { size: A4 landscape; margin: 10mm; }
          body { background: white !important; font-size: 11pt !important; }
          .no-print { display: none !important; }
          .printable-document { box-shadow: none !important; padding: 0 !important; border: none !important; }
          
          /* Force hide Sidebar and Navbar */
          nav, .sidebar, .mobile-header, footer { display: none !important; }
          .main-content { margin: 0 !important; width: 100% !important; max-width: 100% !important; padding: 0 !important; }
          .app-layout { grid-template-columns: 1fr !important; }

          /* Table Print Physics */
          .report-table { width: 100% !important; page-break-inside: auto; }
          .report-table tr { page-break-inside: avoid; page-break-after: auto; }
          .report-table thead { display: table-header-group; }
          .report-table tfoot { display: table-footer-group; }
          .report-table th, .report-table td { color: black !important; }
          
          /* Convert interactive UI colors to print safe colors */
          span, div { color: black !important; background: transparent !important; border-color: black !important; box-shadow: none !important; }
          
          /* Retain subtle gray backgrounds for headers */
          thead tr, .report-table th { background-color: #f1f5f9 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          h2 { border-color: black !important; }
        }
      `}} />
    </div>
  );
}
