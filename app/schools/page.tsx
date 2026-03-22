import { prisma } from "@/lib/prisma";
import { addSchoolAction, editSchoolAction, deleteSchoolAction } from "./actions";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { importSchoolsCSVAction } from "../admin/import-actions";

export const dynamic = "force-dynamic";

const CSV_BOM = "\uFEFF";

const LEVELS_OPTIONS = ["رياض أطفال", "ابتدائي", "إعدادي", "ثانوي عام", "ثانوي فني", "تربية خاصة"];
const TYPES_OPTIONS = ["رسمي", "لغات", "خاص", "تجاري", "صناعي", "زراعي", "فندقي", "مهني"];
const WORKING_DAYS_OPTIONS = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"];

export default async function SchoolsPage({ searchParams }: { searchParams: Promise<{ editId?: string }> }) {
  const { editId: editIdRaw } = await searchParams;
  const user = await getSession();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const schools = await (prisma as any).school.findMany({
    orderBy: { name: "asc" },
  });

  const editId = editIdRaw ? parseInt(editIdRaw) : null;
  const schoolToEdit = editId ? schools.find((s: any) => s.id === editId) : null;

  const csvContent = CSV_BOM + "اسم المدرسة,الإدارة,المرحلة (مفصول بفاصلة),النوع (مفصول بفاصلة),أيام العمل (مفصول بفاصلة),الوردية\nمدرسة السادات,غرب الزقازيق التعليمية,ثانوي عام,رسمي,الأحد-الإثنين-الثلاثاء-الأربعاء-الخميس,صباحي\nمدرسة السلام,غرب الزقازيق,ابتدائي-إعدادي,لغات,السبت-الأحد-الإثنين-الثلاثاء-الأربعاء-الخميس,مسائي";

  return (
    <div dir="rtl">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ color: "var(--primary-deep-blue)", margin: 0 }}>🏫 إدارة المدارس</h1>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
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

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: "2rem", alignItems: "start" }}>

        {/* Add/Edit Form */}
        <div className="card">
          <h2 style={{ fontSize: "1.2rem", color: "var(--primary-deep-blue)", marginBottom: "1.5rem" }}>
            {schoolToEdit ? "📝 تعديل بيانات مدرسة" : "➕ إضافة مدرسة جديدة"}
          </h2>
          <form action={schoolToEdit ? editSchoolAction.bind(null, schoolToEdit.id) : addSchoolAction} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
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
            <div>
              <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem", fontWeight: "bold" }}>الإدارة:</label>
              <input
                name="admin"
                defaultValue={schoolToEdit?.administration || "غرب الزقازيق التعليمية"}
                required
                style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", fontFamily: "inherit", background: "#f9f9f9", boxSizing: "border-box" }}
              />
            </div>
            
            {/* Multi-Level Selection */}
            <div>
              <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem", fontWeight: "bold" }}>📚 المرحلة التعليمية (اختر واحدة أو أكثر):</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", background: "#f8f9fa", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border)" }}>
                {LEVELS_OPTIONS.map(lvl => {
                  const isChecked = schoolToEdit ? (schoolToEdit.levels || "").includes(lvl) : false;
                  return (
                    <label key={lvl} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer" }}>
                      <input type="checkbox" name="levels" value={lvl} defaultChecked={isChecked} style={{ cursor: "pointer" }} /> {lvl}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Multi-Type Selection */}
            <div>
              <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem", fontWeight: "bold" }}>🏛️ نوع المدرسة (اختر واحدة أو أكثر):</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", background: "#f8f9fa", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border)" }}>
                {TYPES_OPTIONS.map(type => {
                  const isChecked = schoolToEdit ? (schoolToEdit.types || "").includes(type) : false;
                  return (
                    <label key={type} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer" }}>
                      <input type="checkbox" name="types" value={type} defaultChecked={isChecked} style={{ cursor: "pointer" }} /> {type}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Multi-Working Days Selection */}
            <div>
              <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem", fontWeight: "bold" }}>📅 أيام العمل:</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", background: "#f8f9fa", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border)" }}>
                {WORKING_DAYS_OPTIONS.map(day => {
                  // Default behavior for new schools: All selected (Saturday to Thursday)
                  const isChecked = schoolToEdit ? (schoolToEdit.workingDays || "").includes(day) : true;
                  return (
                    <label key={day} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer" }}>
                      <input type="checkbox" name="workingDays" value={day} defaultChecked={isChecked} style={{ cursor: "pointer" }} /> {day}
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem", fontWeight: "bold" }}>🌅 الوردية:</label>
              <select
                name="shift"
                defaultValue={(schoolToEdit as any)?.shift || "صباحي"}
                style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", fontFamily: "inherit", background: "white", boxSizing: "border-box" }}
              >
                <option value="صباحي">☀️ صباحي</option>
                <option value="مسائي">🌆 مسائي</option>
              </select>
            </div>
            
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                {schoolToEdit ? "حفظ التعديلات" : "إضافة المدرسة"}
              </button>
              {schoolToEdit && (
                <Link href="/schools" style={{ flex: 1, padding: "0.75rem", textAlign: "center", textDecoration: "none", border: "1px solid #ccc", borderRadius: "8px", color: "#666" }}>
                  إلغاء
                </Link>
              )}
            </div>
          </form>
        </div>

        {/* Schools Table */}
        <div className="card">
          <h2 style={{ fontSize: "1.2rem", color: "var(--primary-deep-blue)", marginBottom: "1.5rem" }}>📋 قائمة المدارس ({schools.length})</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)", backgroundColor: "var(--surface)" }}>
                  <th style={{ padding: "0.75rem" }}>المدرسة</th>
                  <th style={{ padding: "0.75rem" }}>المراحل / الأنواع</th>
                  <th style={{ padding: "0.75rem" }}>أيام العمل</th>
                  <th style={{ padding: "0.75rem" }}>الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {schools.map((school: any) => (
                  <tr key={school.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "0.75rem" }}>
                      <div style={{ fontWeight: "bold" }}>{school.name}</div>
                      <span style={{
                        display: "inline-block",
                        marginTop: "4px",
                        background: school.shift === "مسائي" ? "#e3f2fd" : "#fff8e1",
                        color: school.shift === "مسائي" ? "#1565c0" : "#e65100",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                      }}>
                        {school.shift === "مسائي" ? "🌆 مسائي" : "☀️ صباحي"}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                        {(school.levels ? school.levels.split(",") : []).map((l: string, i: number) => (
                          <span key={i} style={{ background: "#e0f2f1", padding: "2px 6px", borderRadius: "4px", fontSize: "0.75rem", color: "#00695c" }}>{l}</span>
                        ))}
                        {(school.types ? school.types.split(",") : []).map((t: string, i: number) => (
                          <span key={`t-${i}`} style={{ background: "#f3e5f5", padding: "2px 6px", borderRadius: "4px", fontSize: "0.75rem", color: "#6a1b9a" }}>{t}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "2px", maxWidth: "120px" }}>
                        {(school.workingDays ? school.workingDays.split(",") : []).map((w: string, i: number) => (
                          <span key={`w-${i}`} style={{ background: "#eeeeee", padding: "2px 4px", borderRadius: "4px", fontSize: "0.7rem", color: "#424242" }}>{w}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <Link href={`/schools?editId=${school.id}`} style={{ color: "var(--primary-deep-blue)", textDecoration: "none", fontSize: "0.9rem" }}>تعديل</Link>
                        <form action={deleteSchoolAction.bind(null, school.id)}>
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

