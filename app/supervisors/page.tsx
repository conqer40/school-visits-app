import { prisma } from "@/lib/prisma";
import { addSupervisorAction, editSupervisorAction } from "./actions";
import { sendAllCredentialsAction } from "@/app/login/actions";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { importSupervisorsCSVAction } from "../admin/import-actions";
import ExcelExportButton from "@/app/components/ExcelExportButton";
import DeleteSupervisorButton from "@/app/components/DeleteSupervisorButton";

export const dynamic = "force-dynamic";

const CSV_BOM = "\uFEFF";

const LEVELS_OPTIONS = ["رياض أطفال", "ابتدائي", "إعدادي", "ثانوي عام", "ثانوي فني", "تربية خاصة"];
const TYPES_OPTIONS = ["رسمي", "لغات", "خاص", "تجاري", "صناعي", "زراعي", "فندقي", "مهني"];

export default async function SupervisorsPage({ searchParams }: { searchParams: Promise<{ editId?: string }> }) {
  const { editId: editIdRaw } = await searchParams;
  const user = await getSession();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const p = prisma as any;

  const [supervisors, specializations] = await Promise.all([
    p.supervisor.findMany({
      orderBy: { name: "asc" },
      include: { user: true, spec: true },
    }),
    p.specialization.findMany({ orderBy: { name: "asc" } }),
  ]);

  const editId = editIdRaw ? parseInt(editIdRaw) : null;
  const supervisorToEdit = editId ? supervisors.find((s: any) => s.id === editId) : null;

  const csvTemplate = CSV_BOM + "اسم الموجه,رقم الهاتف,المراحل المتاحة له,الأنواع المتاحة له,المنطقة\nأحمد محمد,0123456789,ابتدائي-إعدادي,رسمي-لغات,غرب الزقازيق\nمحمود علي,0987654321,ثانوي فني,صناعي-زراعي,غرب الزقازيق";

  return (
    <div dir="rtl">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <h1 style={{ color: "var(--primary-deep-blue)", margin: 0 }}>👥 إدارة الموجهين</h1>

        <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
          <ExcelExportButton type="supervisors" label="تصدير Excel" />
          <Link href="/specializations" style={{ fontSize: "0.85rem", padding: "0.4rem 0.8rem", border: "1px solid var(--primary-deep-blue)", borderRadius: "8px", textDecoration: "none", color: "var(--primary-deep-blue)" }}>
            📚 إدارة التخصصات
          </Link>
          <a
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(csvTemplate)}`}
            download="supervisors_template.csv"
            style={{ fontSize: "0.8rem", color: "var(--primary-deep-blue)", textDecoration: "underline" }}
          >
            📥 قالب الاستيراد
          </a>
          <form action={importSupervisorsCSVAction} style={{ display: "flex", gap: "0.5rem" }}>
            <input type="file" name="file" accept=".csv" required style={{ fontSize: "0.8rem" }} />
            <button type="submit" className="btn-primary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>استيراد CSV</button>
          </form>
          <form action={sendAllCredentialsAction}>
            <button type="submit" className="btn-primary" style={{ background: "var(--success)", border: "none", fontSize: "0.85rem" }}>
              📲 إرسال الحسابات للجميع
            </button>
          </form>
        </div>
      </div>

      <div className="grid-responsive" style={{ alignItems: "start" }}>

        {/* Add/Edit Form */}
        <div className="card">
          <h2 style={{ fontSize: "1.2rem", color: "var(--primary-deep-blue)", marginBottom: "1.5rem" }}>
            {supervisorToEdit ? "📝 تعديل بيانات موجه" : "👤 إضافة موجه جديد"}
          </h2>
          <form action={supervisorToEdit ? editSupervisorAction : addSupervisorAction} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {supervisorToEdit && <input type="hidden" name="supervisorId" value={supervisorToEdit.id} />}
            <div>
              <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem", fontWeight: "bold" }}>الاسم الكامل:</label>
              <input
                name="name"
                defaultValue={supervisorToEdit?.name || ""}
                required
                placeholder="أ/ أحمد محمد..."
                style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", fontFamily: "inherit", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem", fontWeight: "bold" }}>رقم الواتساب:</label>
              <input
                name="phone"
                defaultValue={supervisorToEdit?.phone || ""}
                required
                placeholder="01012345678"
                style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", fontFamily: "inherit", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem", fontWeight: "bold" }}>كلمة المرور:</label>
              <input
                name="password"
                defaultValue={(supervisorToEdit as any)?.user?.password || ""}
                required={!supervisorToEdit}
                placeholder={supervisorToEdit ? "اتركه فارغاً للحفاظ على القديم" : "123456"}
                style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", fontFamily: "inherit", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem", fontWeight: "bold" }}>📚 التخصص:</label>
              {specializations.length > 0 ? (
                <select
                  name="specializationId"
                  defaultValue={supervisorToEdit?.specializationId?.toString() || ""}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", fontFamily: "inherit", boxSizing: "border-box", background: "white" }}
                >
                  <option value="">— اختر التخصص —</option>
                  {specializations.map((spec: any) => (
                    <option key={spec.id} value={spec.id.toString()}>{spec.name}</option>
                  ))}
                </select>
              ) : (
                <div style={{ padding: "0.75rem", background: "#fff3cd", borderRadius: "8px", fontSize: "0.85rem" }}>
                  ⚠️ لا توجد تخصصات. <Link href="/specializations" style={{ color: "var(--primary-deep-blue)" }}>أضف تخصصات أولاً</Link>
                  <input name="specializationId" type="hidden" value="" />
                </div>
              )}
            </div>
            
            {/* Multi-Level Selection */}
            <div>
              <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem", fontWeight: "bold" }}>المراحل المسموح بزيارتها:</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", background: "#f8f9fa", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border)" }}>
                {LEVELS_OPTIONS.map(lvl => {
                  const isChecked = supervisorToEdit ? (supervisorToEdit.levels || "").includes(lvl) : false;
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
              <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem", fontWeight: "bold" }}>أنواع المدارس المسموح بزيارتها:</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", background: "#f8f9fa", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border)" }}>
                {TYPES_OPTIONS.map(type => {
                  const isChecked = supervisorToEdit ? (supervisorToEdit.types || "").includes(type) : false;
                  return (
                    <label key={type} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer" }}>
                      <input type="checkbox" name="types" value={type} defaultChecked={isChecked} style={{ cursor: "pointer" }} /> {type}
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem", fontWeight: "bold" }}>المنطقة:</label>
              <input
                name="region"
                defaultValue={supervisorToEdit?.region || "غرب الزقازيق"}
                required
                style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", fontFamily: "inherit", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                {supervisorToEdit ? "حفظ التعديلات" : "إضافة الموجه"}
              </button>
              {supervisorToEdit && (
                <Link href="/supervisors" style={{ flex: 1, padding: "0.75rem", textAlign: "center", textDecoration: "none", border: "1px solid #ccc", borderRadius: "8px", color: "#666" }}>
                  إلغاء
                </Link>
              )}
            </div>
          </form>
        </div>

        {/* Supervisors Table */}
        <div className="card">
          <h2 style={{ fontSize: "1.2rem", color: "var(--primary-deep-blue)", marginBottom: "1.5rem" }}>📋 قائمة الموجهين ({supervisors.length})</h2>
          <div className="table-container">
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)", backgroundColor: "var(--surface)" }}>
                  <th style={{ padding: "0.75rem" }}>الموجه</th>
                  <th style={{ padding: "0.75rem" }}>نطاق العمل</th>
                  <th style={{ padding: "0.75rem" }}>الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {supervisors.map((sup: any) => {
                  const whatsappMsg = encodeURIComponent(`السلام عليكم أ/${sup.name}\nبيانات دخولك لنظام الزيارات:\n👤 اسم المستخدم: ${sup.phone}\n🔑 كلمة المرور: ${sup.user?.password || "نفس الباسورد المتفق عليه"}`);
                  const whatsappLink = `https://wa.me/${sup.phone?.replace(/^0/, "20")}?text=${whatsappMsg}`;

                  return (
                    <tr key={sup.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                      <td style={{ padding: "0.75rem" }}>
                        <div style={{ fontWeight: "bold" }}>{sup.name}</div>
                        <div style={{ fontSize: "0.8rem", color: "#666", marginTop: "4px" }}>{sup.phone}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--primary-deep-blue)", marginTop: "2px", fontWeight: "bold" }}>{sup.spec?.name || sup.specialization || "—"}</div>
                      </td>
                      <td style={{ padding: "0.75rem", width: "45%" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {(sup.levels ? sup.levels.split(",") : []).map((l: string, i: number) => (
                            <span key={i} style={{ background: "#e0f2f1", padding: "2px 6px", borderRadius: "4px", fontSize: "0.75rem", color: "#00695c" }}>{l}</span>
                          ))}
                          {(sup.types ? sup.types.split(",") : []).map((t: string, i: number) => (
                            <span key={`t-${i}`} style={{ background: "#f3e5f5", padding: "2px 6px", borderRadius: "4px", fontSize: "0.75rem", color: "#6a1b9a" }}>{t}</span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: "0.75rem" }}>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                          <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "var(--success)", textDecoration: "none", fontSize: "1.1rem", background: "#e8f5e9", padding: "4px 8px", borderRadius: "6px" }}
                            title="إرسال بيانات الدخول"
                          >📲</a>
                          <Link href={`/supervisors?editId=${sup.id}`} style={{ color: "var(--primary-deep-blue)", textDecoration: "none", fontSize: "0.9rem" }}>تعديل</Link>
                          <DeleteSupervisorButton supervisorId={sup.id} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
