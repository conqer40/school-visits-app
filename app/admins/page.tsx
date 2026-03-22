import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { addAdminAction, deleteAdminAction, editAdminAction } from "./actions";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminsPage({ searchParams }: { searchParams: Promise<{ editId?: string }> }) {
  const { editId: editIdRaw } = await searchParams;
  const currentUser = await getSession();
  if (!currentUser || currentUser.role !== "ADMIN") redirect("/login");

  const admins = await (prisma as any).user.findMany({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "desc" }
  });

  const editId = editIdRaw ? parseInt(editIdRaw) : null;
  const adminToEdit = editId ? admins.find((a: any) => a.id === editId) : null;

  return (
    <div dir="rtl">
      <h1 style={{ color: "var(--primary-deep-blue)", marginBottom: "2rem" }}>🛡️ إدارة الإداريين</h1>

      <div className="grid-responsive" style={{ alignItems: "start" }}>
        
        {/* Add/Edit Admin Form */}
        <div className="card">
          <h2 style={{ fontSize: "1.2rem", color: "var(--primary-deep-blue)", marginBottom: "1.5rem" }}>
            {adminToEdit ? "📝 تعديل كلمة مرور الإداري" : "👤 إضافة أدمن جديد"}
          </h2>
          <form action={adminToEdit ? editAdminAction.bind(null, adminToEdit.id) : addAdminAction} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem" }}>اسم المستخدم (الهاتف):</label>
              <input 
                name="username" 
                defaultValue={adminToEdit?.username || ""}
                disabled={!!adminToEdit}
                required 
                placeholder="012XXXXXXXX" 
                style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", fontFamily: "inherit", background: adminToEdit ? "#f0f0f0" : "white" }} 
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.9rem" }}>كلمة المرور الجديدة:</label>
              <input 
                name="password" 
                type="text" // Made it text so admin can see what they set
                required 
                placeholder="••••••••" 
                style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", fontFamily: "inherit" }} 
              />
            </div>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                {adminToEdit ? "حفظ التغييرات" : "إضافة الإداري"}
              </button>
              {adminToEdit && (
                <Link href="/admins" style={{ flex: 1, padding: "0.75rem", textAlign: "center", textDecoration: "none", border: "1px solid #ccc", borderRadius: "8px", color: "#666" }}>
                  إلغاء
                </Link>
              )}
            </div>
          </form>
        </div>

        {/* Admins Table */}
        <div className="card">
          <h2 style={{ fontSize: "1.2rem", color: "var(--primary-deep-blue)", marginBottom: "1.5rem" }}>📋 قائمة الإداريين</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)", backgroundColor: "var(--surface)" }}>
                  <th style={{ padding: "0.75rem" }}>اسم المستخدم</th>
                  <th style={{ padding: "0.75rem" }}>تاريخ الإنشاء</th>
                  <th style={{ padding: "0.75rem" }}>الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin: any) => (
                  <tr key={admin.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "0.75rem", fontWeight: "bold" }}>{admin.username}</td>
                    <td style={{ padding: "0.75rem", fontSize: "0.85rem", color: "#666" }}>
                      {new Date(admin.createdAt).toLocaleDateString("ar-EG")}
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
                        <Link href={`/admins?editId=${admin.id}`} style={{ color: "var(--primary-deep-blue)", textDecoration: "none", fontSize: "0.9rem" }}>تعديل</Link>
                        {admin.username !== currentUser.username && (
                          <form action={deleteAdminAction.bind(null, admin.id)}>
                            <button type="submit" style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: "0.9rem", padding: 0, fontFamily: "inherit" }}>
                              حذف
                            </button>
                          </form>
                        )}
                        {admin.username === currentUser.username && (
                          <span style={{ fontSize: "0.85rem", color: "var(--accent-gold)" }}>أنت</span>
                        )}
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
