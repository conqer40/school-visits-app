import { prisma } from "@/lib/prisma";
import { getSession, egyptDate } from "@/lib/auth";
import { redirect } from "next/navigation";
import { submitVisitReportAction } from "@/app/my-schedule/actions";

export const dynamic = "force-dynamic";

export default async function SubmitReportPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const visitId = parseInt(resolvedParams.id);

  const user = await getSession();
  if (!user || user.role !== "SUPERVISOR") redirect("/login");

  const visit = await prisma.visit.findUnique({
    where: { id: visitId },
    include: { school: true }
  });

  if (!visit || visit.supervisorId !== user.supervisorId) redirect("/my-schedule");

  return (
    <div dir="rtl" style={{ maxWidth: "600px", margin: "0 auto", padding: "0 1rem" }}>
      <div className="card">
        <h1 style={{ color: "var(--primary-deep-blue)", fontSize: "1.5rem" }}>📝 تقديم تقرير الزيارة</h1>
        <p style={{ color: "#666" }}>المدرسة: <strong>{visit.school.name}</strong></p>
        <p style={{ color: "#666" }}>التاريخ: <strong>{egyptDate(visit.date)}</strong></p>

        <form action={submitVisitReportAction.bind(null, visit.id)} style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginTop: "2rem" }}>
          
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", background: "#fff9e6", borderRadius: "8px", border: "1px solid var(--accent-gold)" }}>
            <input type="checkbox" name="isExcuse" id="isExcuse" style={{ width: "20px", height: "20px" }} />
            <label htmlFor="isExcuse" style={{ fontWeight: "bold", color: "var(--primary-deep-blue)" }}>هل ترغب في تقديم اعتذار عن هذه الزيارة؟</label>
          </div>

          <div id="reportSection">
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", color: "var(--primary-deep-blue)" }}>الملاحظات الفنية للزيارة (تقرير مفصل):</label>
            <textarea 
              name="reportText" 
              required 
              placeholder="اكتب هنا كافة المشاهدات والملاحظات الفنية التي تمت خلال الزيارة (ستظهر في التقارير المطبوعة للأدمن)..."
              style={{ width: "100%", height: "180px", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border)", fontFamily: "inherit", fontSize: "1rem", outline: "none", lineHeight: "1.6" }}
            ></textarea>
          </div>

          <div id="excuseExtraFields" style={{ border: "1px dashed var(--accent-gold)", padding: "1rem", borderRadius: "8px", background: "#fffdf5" }}>
            <h4 style={{ margin: "0 0 1rem 0", color: "var(--primary-deep-blue)" }}>⚠️ بيانات الاعتذار الإضافية:</h4>
            
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>سبب الاعتذار:</label>
              <textarea 
                name="excuseReason" 
                placeholder="اذكر سبب الاعتذار بالتفصيل..."
                style={{ width: "100%", height: "80px", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--border)", fontFamily: "inherit" }}
              ></textarea>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>اسم البديل القائم بالزيارة (إلزامي في حالة الاعتذار):</label>
              <input 
                type="text" 
                name="replacementName" 
                placeholder="أدخل اسم الزميل البديل..."
                style={{ width: "100%", padding: "0.7rem", borderRadius: "6px", border: "1px solid var(--border)", fontFamily: "inherit" }} 
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ padding: "1rem", fontSize: "1.1rem" }}>
            إرسال التقرير الآن
          </button>
        </form>
      </div>

      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <p style={{ color: "#999", fontSize: "0.8rem" }}>
          إدارة غرب الزقازيق التعليمية — أ. محمد العسيلى
        </p>
      </div>
    </div>
  );
}
