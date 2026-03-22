import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { updatePasswordAction } from "../actions";

export default async function SettingsPage() {
  const user = await getSession();
  if (!user || user.role !== "SUPERVISOR") redirect("/login");

  return (
    <div dir="rtl" style={{ maxWidth: "500px", margin: "0 auto" }}>
      <h1 style={{ color: "var(--primary-deep-blue)", marginBottom: "2rem" }}>⚙️ إعدادات الحساب</h1>
      
      <div className="card">
        <h2 style={{ fontSize: "1.1rem", marginBottom: "1.5rem" }}>🔒 تغيير كلمة المرور</h2>
        <form action={updatePasswordAction} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>كلمة المرور الجديدة:</label>
            <input 
              type="password" 
              name="newPassword" 
              required 
              style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border)", fontFamily: "inherit" }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>تأكيد كلمة المرور:</label>
            <input 
              type="password" 
              name="confirmPassword" 
              required 
              style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border)", fontFamily: "inherit" }}
            />
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: "0.5rem" }}>
            حفظ التغييرات
          </button>
        </form>
      </div>
    </div>
  );
}
