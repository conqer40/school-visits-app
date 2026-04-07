import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { addSpecializationAction, editSpecializationAction, deleteSpecializationAction } from "./actions";
import SearchableSelect from "@/app/components/SearchableSelect";

export const dynamic = "force-dynamic";

const DAY_NAMES = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"];

export default async function SpecializationsPage({ searchParams }: { searchParams: Promise<{ editId?: string }> }) {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") redirect("/login");
  const { editId: editIdRaw } = await searchParams;

  const p = prisma as any;
  const specs = await p.specialization.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { supervisors: true } } } });
  const editId = editIdRaw ? parseInt(editIdRaw) : null;
  const specToEdit = editId ? specs.find((s: any) => s.id === editId) : null;

  return (
    <div dir="rtl">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ color: "var(--primary-deep-blue)", margin: 0 }}>📚 إدارة التخصصات</h1>
        <p style={{ color: "#666", fontSize: "0.9rem", margin: 0 }}>تحديد أيام الاجتماعات لاستبعادها تلقائياً من جدول الزيارات</p>
      </div>

      <div className="grid-responsive" style={{ alignItems: "start" }}>
        {/* Form */}
        <div className="card">
          <h2 style={{ fontSize: "1.2rem", color: "var(--primary-deep-blue)", marginBottom: "1.5rem" }}>
            {specToEdit ? "📝 تعديل التخصص" : "➕ إضافة تخصص جديد"}
          </h2>
          <form action={specToEdit ? editSpecializationAction.bind(null, specToEdit.id) : addSpecializationAction} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem", fontWeight: "bold" }}>اسم التخصص:</label>
              <input
                name="name"
                defaultValue={specToEdit?.name || ""}
                required
                placeholder="مثال: لغة عربية، رياضيات..."
                style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", fontFamily: "inherit", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem", fontWeight: "bold" }}>يوم الاجتماع الشهري (اختياري):</label>
              <SearchableSelect
                name="meetingDay"
                defaultValue={specToEdit?.meetingDay?.toString() ?? ""}
                options={[
                  { value: "", label: "— لا يوجد يوم اجتماع —" },
                  { value: "0", label: "الأحد" },
                  { value: "1", label: "الاثنين" },
                  { value: "2", label: "الثلاثاء" },
                  { value: "3", label: "الأربعاء" },
                  { value: "4", label: "الخميس" }
                ]}
                style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", background: "white" }}
              />
              <p style={{ fontSize: "0.75rem", color: "#888", marginTop: "0.3rem" }}>⚠️ الزيارات لن تُجدوَل لهذا التخصص في يوم الاجتماع المحدد</p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                {specToEdit ? "حفظ التعديلات" : "إضافة التخصص"}
              </button>
              {specToEdit && (
                <Link href="/specializations" style={{ flex: 1, padding: "0.75rem", textAlign: "center", textDecoration: "none", border: "1px solid #ccc", borderRadius: "8px", color: "#666" }}>
                  إلغاء
                </Link>
              )}
            </div>
          </form>
        </div>

        {/* Table */}
        <div className="card">
          <h2 style={{ fontSize: "1.2rem", color: "var(--primary-deep-blue)", marginBottom: "1.5rem" }}>📋 التخصصات المسجلة ({specs.length})</h2>
          <div className="table-container">
            {specs.length === 0 ? (
              <p style={{ textAlign: "center", padding: "2rem", color: "#888" }}>لا توجد تخصصات مضافة بعد</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border)", backgroundColor: "var(--surface)" }}>
                    <th style={{ padding: "0.75rem" }}>اسم التخصص</th>
                    <th style={{ padding: "0.75rem" }}>يوم الاجتماع</th>
                    <th style={{ padding: "0.75rem" }}>عدد الموجهين</th>
                    <th style={{ padding: "0.75rem" }}>الإجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {specs.map((spec: any) => (
                    <tr key={spec.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                      <td style={{ padding: "0.75rem", fontWeight: "bold" }}>{spec.name}</td>
                      <td style={{ padding: "0.75rem" }}>
                        {spec.meetingDay !== null && spec.meetingDay !== undefined
                          ? <span style={{ background: "#fff3cd", padding: "2px 8px", borderRadius: "6px", fontSize: "0.85rem" }}>📅 {DAY_NAMES[spec.meetingDay]}</span>
                          : <span style={{ color: "#999" }}>—</span>}
                      </td>
                      <td style={{ padding: "0.75rem" }}>
                        <span style={{ background: "var(--surface)", padding: "2px 8px", borderRadius: "12px", fontSize: "0.85rem" }}>{spec._count.supervisors} موجه</span>
                      </td>
                      <td style={{ padding: "0.75rem" }}>
                        <div style={{ display: "flex", gap: "0.8rem" }}>
                          <Link href={`/specializations?editId=${spec.id}`} style={{ color: "var(--primary-deep-blue)", textDecoration: "none", fontSize: "0.9rem" }}>تعديل</Link>
                          <form action={deleteSpecializationAction.bind(null, spec.id)}>
                            <button type="submit" style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: "0.9rem", fontFamily: "inherit" }}>حذف</button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
