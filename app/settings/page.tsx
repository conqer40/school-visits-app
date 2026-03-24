import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { updateSystemSettingsAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") redirect("/login");

  let settings = await (prisma as any).systemSetting.findUnique({ where: { id: 1 } });
  
  if (!settings) {
    settings = await (prisma as any).systemSetting.create({
      data: {
        id: 1,
        designerName: "محمد الحاوي",
        designerPhone: "+201022104948",
        managerName: "أ. محمد العسيلى",
        siteName: "نظام إدارة الزيارات المدرسية"
      }
    });
  }

  return (
    <div dir="rtl" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
        <h1 style={{ color: "var(--primary-deep-blue)", margin: 0 }}>⚙️ الإعدادات العامة للنظام</h1>
      </div>

      <div className="card">
        <h2 style={{ fontSize: "1.2rem", color: "var(--primary-deep-blue)", marginBottom: "1.5rem", borderBottom: "1px solid #eee", paddingBottom: "0.5rem" }}>
          بيانات الموقع والتواصل
        </h2>
        
        <form action={updateSystemSettingsAction} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.95rem", fontWeight: "bold", color: "#444" }}>اسم النظام / البوابة:</label>
            <input 
              name="siteName" 
              defaultValue={settings.siteName} 
              required 
              style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border)", fontFamily: "inherit" }} 
            />
          </div>
          
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.95rem", fontWeight: "bold", color: "#444" }}>اسم مدير النظام / وكيل الإدارة:</label>
            <input 
              name="managerName" 
              defaultValue={settings.managerName} 
              required 
              style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border)", fontFamily: "inherit" }} 
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
               <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.95rem", fontWeight: "bold", color: "#444" }}>اسم المبرمج / المصمم:</label>
               <input 
                 name="designerName" 
                 defaultValue={settings.designerName} 
                 required 
                 style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border)", fontFamily: "inherit" }} 
               />
            </div>
            <div>
               <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.95rem", fontWeight: "bold", color: "#444" }}>رقم تواصل المبرمج:</label>
               <input 
                 name="designerPhone" 
                 defaultValue={settings.designerPhone} 
                 required 
                 style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border)", fontFamily: "inherit", direction: "ltr", textAlign: "right" }} 
               />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: "1rem", padding: "1rem", fontSize: "1.1rem" }}>
            💾 حفظ الإعدادات
          </button>
        </form>
      </div>
    </div>
  );
}
