import { prisma } from "@/lib/prisma";
import { deleteSchoolAction } from "./actions";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { importSchoolsCSVAction } from "../admin/import-actions";
import ExcelExportButton from "@/app/components/ExcelExportButton";

export const dynamic = "force-dynamic";

const CSV_BOM = "\uFEFF";

const LEVELS_OPTIONS = ["رياض أطفال", "ابتدائي", "إعدادي", "ثانوي عام", "ثانوي فني", "تربية خاصة"];
const TYPES_OPTIONS = ["رسمي", "لغات", "خاص", "تجاري", "صناعي", "زراعي", "فندقي", "مهني"];
const WORKING_DAYS_OPTIONS = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"];

export async function addSchoolAction(formData: FormData) {
  const name = formData.get("name") as string;
  const admin = formData.get("admin") as string;
  const shift = formData.get("shift") as string || "صباحي";
  const levels = formData.getAll("levels").join(",");
  const types = formData.getAll("types").join(",");
  const principalName = formData.get("principalName") as string;
  const principalPhone = formData.get("principalPhone") as string;
  const googleMapsUrl = formData.get("googleMapsUrl") as string;
  
  // Default string if none provided = fall back to default from schema
  let workingDaysArray = formData.getAll("workingDays");
  let workingDays = workingDaysArray.length > 0 ? workingDaysArray.join(",") : "السبت,الأحد,الإثنين,الثلاثاء,الأربعاء,الخميس";

  await (prisma as any).school.create({
    data: { 
      name, 
      administration: admin, 
      levels, 
      types, 
      shift, 
      workingDays,
      principalName,
      principalPhone,
      googleMapsUrl
    },
  });

  revalidatePath("/schools");
  revalidatePath("/");
}

export async function editSchoolAction(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const admin = formData.get("admin") as string;
  const shift = formData.get("shift") as string || "صباحي";
  const levels = formData.getAll("levels").join(",");
  const types = formData.getAll("types").join(",");
  const principalName = formData.get("principalName") as string;
  const principalPhone = formData.get("principalPhone") as string;
  const googleMapsUrl = formData.get("googleMapsUrl") as string;

  let workingDaysArray = formData.getAll("workingDays");
  let workingDays = workingDaysArray.length > 0 ? workingDaysArray.join(",") : "السبت,الأحد,الإثنين,الثلاثاء,الأربعاء,الخميس";

  await (prisma as any).school.update({
    where: { id },
    data: { 
      name, 
      administration: admin, 
      levels, 
      types, 
      shift, 
      workingDays,
      principalName,
      principalPhone,
      googleMapsUrl
    },
  });

  revalidatePath("/schools");
  revalidatePath("/");
}

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
          <div className="table-container">
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)", backgroundColor: "var(--surface)" }}>
                    <th style={{ padding: "1rem", textAlign: "right", borderBottom: "2px solid var(--border-light)" }}>المدرسة</th>
                    <th style={{ padding: "1rem", textAlign: "right", borderBottom: "2px solid var(--border-light)" }}>المدير / التواصل</th>
                    <th style={{ padding: "1rem", textAlign: "right", borderBottom: "2px solid var(--border-light)" }}>الفترة</th>
                    <th style={{ padding: "1rem", textAlign: "right", borderBottom: "2px solid var(--border-light)" }}>الموقع</th>
                    <th style={{ padding: "1rem", textAlign: "center", borderBottom: "2px solid var(--border-light)" }}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {schools.map((school: any) => (
                  <tr key={school.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "1rem" }}>
                      <div style={{ fontWeight: "bold", fontSize: "1rem", color: "var(--primary-deep-blue)" }}>{school.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "#888", marginTop: "0.2rem" }}>{school.administration}</div>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      {school.principalName ? (
                        <>
                          <div style={{ fontWeight: "500", fontSize: "0.9rem" }}>👤 {school.principalName}</div>
                          {school.principalPhone && (
                            <div style={{ fontSize: "0.85rem", color: "var(--primary-deep-blue)", direction: "ltr", textAlign: "right", marginTop: "0.2rem" }}>
                              📞 {school.principalPhone}
                            </div>
                          )}
                        </>
                      ) : (
                        <span style={{ color: "#ccc", fontSize: "0.8rem" }}>غير مسجل</span>
                      )}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{
                        display: "inline-block",
                        background: school.shift === "مسائي" ? "#e3f2fd" : (school.shift === "صباحي ومسائي" ? "#f3e5f5" : "#fff8e1"),
                        color: school.shift === "مسائي" ? "#1565c0" : (school.shift === "صباحي ومسائي" ? "#6a1b9a" : "#e65100"),
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                      }}>
                        {school.shift === "مسائي" ? "🌆 مسائي" : (school.shift === "صباحي ومسائي" ? "🌓 فترتين" : "☀️ صباحي")}
                      </span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      {school.googleMapsUrl ? (
                        <a 
                          href={school.googleMapsUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            background: "#ea433515",
                            color: "#ea4335",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontSize: "0.8rem",
                            textDecoration: "none",
                            fontWeight: "500"
                          }}
                        >
                          📍 الخريطة
                        </a>
                      ) : (
                        <span style={{ color: "#ccc", fontSize: "0.8rem" }}>لا يوجد رابط</span>
                      )}
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "0.8rem", justifyContent: "center" }}>
                        <Link href={`/schools?editId=${school.id}`} style={{ 
                          color: "var(--primary-deep-blue)", 
                          textDecoration: "none", 
                          fontSize: "0.85rem",
                          padding: "4px 12px",
                          border: "1px solid var(--primary-deep-blue)",
                          borderRadius: "6px"
                        }}>
                          تعديل
                        </Link>
                        <form action={deleteSchoolAction.bind(null, school.id)}>
                          <button type="submit" style={{ 
                            background: "rgba(239, 68, 68, 0.1)", 
                            border: "1px solid rgba(239, 68, 68, 0.2)", 
                            color: "#ef4444", 
                            cursor: "pointer", 
                            fontSize: "0.85rem", 
                            padding: "4px 12px", 
                            borderRadius: "6px",
                            fontFamily: "inherit" 
                          }}>
                            حذف
                          </button>
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

