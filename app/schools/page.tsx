import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import ExcelExportButton from "@/app/components/ExcelExportButton";
import { addSchoolAction, editSchoolAction, deleteSchoolAction } from "./actions";
import { importSchoolsCSVAction } from "../admin/import-actions";

export const dynamic = "force-dynamic";

const LEVELS_OPTIONS = ["رياض أطفال", "ابتدائي", "إعدادي", "ثانوي عام", "ثانوي فني", "تربية خاصة"];
const TYPES_OPTIONS = ["رسمي", "لغات", "خاص", "تجاري", "صناعي", "زراعي", "فندقي", "مهني"];
const WORKING_DAYS_OPTIONS = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"];

export default async function SchoolsPage({ searchParams }: { searchParams: Promise<{ editId?: string }> }) {
  const { editId: editIdRaw } = await searchParams;
  const user = await getSession();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const rawSchools = await (prisma as any).school.findMany({
    orderBy: { name: "asc" },
  });

  const schools = JSON.parse(JSON.stringify(rawSchools));
  const editId = editIdRaw ? parseInt(editIdRaw) : null;
  const schoolToEdit = editId ? schools.find((s: any) => s.id === editId) : null;

  const csvContent = "\uFEFF" + "اسم المدرسة,الإدارة,المرحلة (مفصول بفاصلة),النوع (مفصول بفاصلة),أيام العمل (مفصول بفاصلة),الوردية\nمدرسة السادات,غرب الزقازيق التعليمية,ثانوي عام,رسمي,الأحد-الإثنين-الثلاثاء-الأربعاء-الخميس,صباحي\nمدرسة السلام,غرب الزقازيق,ابتدائي-إعدادي,لغات,السبت-الأحد-الإثنين-الثلاثاء-الأربعاء-الخميس,مسائي";

  return (
    <div dir="rtl">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <h1 style={{ color: "var(--primary-deep-blue)", margin: 0 }}>🏫 إدارة المدارس</h1>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
          <ExcelExportButton type="schools" label="تصدير Excel" />
          <a
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`}
            download="schools_template.csv"
            style={{ fontSize: "0.8rem", color: "var(--primary-deep-blue)", textDecoration: "underline" }}
          >
            📥 تحميل قالب الاستيراد
          </a>
          <form action={importSchoolsCSVAction} style={{ display: "flex", gap: "0.5rem" }}>
            <input type="file" name="file" accept=".csv" required style={{ fontSize: "0.8rem" }} />
            <button type="submit" className="btn-primary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>استيراد CSV</button>
          </form>
        </div>
      </div>

      <div className="grid-responsive" style={{ alignItems: "start" }}>
        <div className="card">
          <h2 style={{ fontSize: "1.2rem", color: "var(--primary-deep-blue)", marginBottom: "1.5rem" }}>
            {schoolToEdit ? "📝 تعديل بيانات مدرسة" : "➕ إضافة مدرسة جديدة"}
          </h2>
          <form action={schoolToEdit ? editSchoolAction : addSchoolAction} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {schoolToEdit && <input type="hidden" name="schoolId" value={schoolToEdit.id} />}
            <div>
              <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem", fontWeight: "bold" }}>اسم المدرسة:</label>
              <input
                name="name"
                defaultValue={schoolToEdit?.name || ""}
                required
                placeholder="مثال: مدرسة السادات..."
                style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", fontFamily: "inherit", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem", fontWeight: "bold" }}>اسم المدير:</label>
                <input
                  name="principalName"
                  defaultValue={schoolToEdit?.principalName || ""}
                  placeholder="اسم مدير المدرسة"
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", fontFamily: "inherit", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem", fontWeight: "bold" }}>رقم الهاتف:</label>
                <input
                  name="principalPhone"
                  defaultValue={schoolToEdit?.principalPhone || ""}
                  placeholder="رقم هاتف المدير"
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", fontFamily: "inherit", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem", fontWeight: "bold" }}>رابط خريطة جوجل:</label>
              <input
                name="googleMapsUrl"
                defaultValue={schoolToEdit?.googleMapsUrl || ""}
                placeholder="https://maps.app.goo.gl/..."
                style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", fontFamily: "inherit", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem", fontWeight: "bold" }}>الإدارة:</label>
              <input
                name="admin"
                defaultValue={schoolToEdit?.administration || "غرب الزقازيق التعليمية"}
                required
                style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", fontFamily: "inherit", background: "#f9f9f9", boxSizing: "border-box" }}
              />
            </div>
            
            <div>
              <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem", fontWeight: "bold" }}>📚 المرحلة التعليمية:</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", background: "#f8f9fa", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border)" }}>
                {LEVELS_OPTIONS.map(lvl => (
                  <label key={lvl} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer" }}>
                    <input type="checkbox" name="levels" value={lvl} defaultChecked={schoolToEdit ? (schoolToEdit.levels || "").includes(lvl) : false} /> {lvl}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem", fontWeight: "bold" }}>🏛️ نوع المدرسة:</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", background: "#f8f9fa", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border)" }}>
                {TYPES_OPTIONS.map(type => (
                  <label key={type} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer" }}>
                    <input type="checkbox" name="types" value={type} defaultChecked={schoolToEdit ? (schoolToEdit.types || "").includes(type) : false} /> {type}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem", fontWeight: "bold" }}>📅 أيام العمل:</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", background: "#f8f9fa", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border)" }}>
                {WORKING_DAYS_OPTIONS.map(day => (
                  <label key={day} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer" }}>
                    <input type="checkbox" name="workingDays" value={day} defaultChecked={schoolToEdit ? (schoolToEdit.workingDays || "").includes(day) : true} /> {day}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem", fontWeight: "bold" }}>🌅 الوردية:</label>
              <select name="shift" defaultValue={schoolToEdit?.shift || "صباحي"} style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", fontFamily: "inherit" }}>
                <option value="صباحي">☀️ صباحي</option>
                <option value="مسائي">🌆 مسائي</option>
              </select>
            </div>
            
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>{schoolToEdit ? "حفظ التعديلات" : "إضافة المدرسة"}</button>
              {schoolToEdit && <Link href="/schools" className="btn-secondary" style={{ flex: 1, textAlign: "center", textDecoration: "none" }}>إلغاء</Link>}
            </div>
          </form>
        </div>

        <div className="card">
          <h2 style={{ fontSize: "1.2rem", color: "var(--primary-deep-blue)", marginBottom: "1.5rem" }}>📋 قائمة المدارس ({schools.length})</h2>
          <div className="table-container">
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)", backgroundColor: "var(--surface)" }}>
                    <th style={{ padding: "1rem" }}>المدرسة</th>
                    <th style={{ padding: "1rem" }}>المدير / التواصل</th>
                    <th style={{ padding: "1rem" }}>الفترة</th>
                    <th style={{ padding: "1rem" }}>الموقع</th>
                    <th style={{ padding: "1rem", textAlign: "center" }}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {schools.map((school: any) => (
                  <tr key={school.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "1rem" }}>
                      <div style={{ fontWeight: "bold", fontSize: "1rem", color: "var(--primary-deep-blue)" }}>{school.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "#888" }}>{school.administration}</div>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      {school.principalName ? (
                        <>
                          <div style={{ fontWeight: "500", fontSize: "0.9rem" }}>👤 {school.principalName}</div>
                          {school.principalPhone && <div style={{ fontSize: "0.85rem", color: "var(--primary-deep-blue)" }}>📞 {school.principalPhone}</div>}
                        </>
                      ) : <span style={{ color: "#ccc" }}>غير مسجل</span>}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ background: school.shift === "مسائي" ? "#e3f2fd" : "#fff8e1", color: school.shift === "مسائي" ? "#1565c0" : "#e65100", padding: "4px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "bold" }}>
                        {school.shift === "مسائي" ? "🌆 مسائي" : "☀️ صباحي"}
                      </span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      {school.googleMapsUrl ? <a href={school.googleMapsUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#ea4335", textDecoration: "none" }}>📍 الخريطة</a> : <span style={{ color: "#ccc" }}>لا يوجد</span>}
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "0.8rem", justifyContent: "center", alignItems: "center" }}>
                        <Link href={`/schools?editId=${school.id}`} style={{ color: "var(--primary-deep-blue)", textDecoration: "none" }}>تعديل</Link>
                        <form action={deleteSchoolAction}>
                          <input type="hidden" name="schoolId" value={school.id} />
                          <button type="submit" style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: "0.9rem", padding: 0, fontFamily: "inherit" }}>حذف</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


