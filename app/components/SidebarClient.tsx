"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/login/actions";
import Clock from "./Clock";

interface SidebarClientProps {
  user: any;
  isAdmin: boolean;
  settings?: any;
}

export default function SidebarClient({ user, isAdmin, settings }: SidebarClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  // Close sidebar on route change on mobile
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinks: { href: string; icon: string; label: string; badge?: string }[] = isAdmin ? [
    { href: "/dashboard", icon: "🏠", label: "لوحة التحكم" },
    { href: "/schools", icon: "🏫", label: "المدارس" },
    { href: "/supervisors", icon: "👥", label: "الموجهين" },
    { href: "/specializations", icon: "📚", label: "التخصصات" },
    { href: "/schedule", icon: "📅", label: "الجدول الشهري" },
    { href: "/chat", icon: "💬", label: "غرف الدردشة", badge: "جديد" },
    { href: "/community", icon: "🤝", label: "مجتمع الموجهين" },
    {href: "/whatsapp", icon: "📱", label: "الواتساب" },
    { href: "/admins/broadcast", icon: "📢", label: "الرسائل الجماعية", badge: "جديد" },
    { href: "/reports", icon: "📊", label: "سجل النشاط" },
    { href: "/settings", icon: "⚙️", label: "إعدادات النظام" },
    { href: "/admins", icon: "🛡️", label: "إدارة الإداريين" },
    { href: "/admins/backup", icon: "💾", label: "النظام والضبط" },
  ] : [
    { href: "/my-schedule", icon: "📅", label: "جدولي اليومي" },
    { href: "/my-reports", icon: "📝", label: "تقاريري السابقة" },
    { href: "/chat", icon: "💬", label: "غرف الدردشة", badge: "جديد" },
    { href: "/community", icon: "🤝", label: "مجتمع الموجهين" },
    { href: "/my-schedule/settings", icon: "⚙️", label: "إعدادات الحساب" },
  ];

  return (
    <>
      {/* Mobile Header */}
      <header className="mobile-header no-print">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "35px", height: "35px", background: "linear-gradient(135deg, var(--accent-gold), #fcd34d)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", color: "var(--primary-deep-blue)", boxShadow: "0 2px 5px rgba(245, 158, 11, 0.3)" }}>
            W
          </div>
          <span style={{ fontWeight: "800", fontSize: "1rem", letterSpacing: "0.5px" }}>نظام الزيارات</span>
        </div>
        <button 
          onClick={toggleSidebar}
          style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", width: "40px", height: "40px", color: "white", fontSize: "1.2rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </header>

      {/* Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${isOpen ? "active" : ""}`} 
        onClick={closeSidebar}
      ></div>

      {/* Sidebar */}
      <aside className={`sidebar no-print ${isOpen ? "open" : ""}`} style={{ width: "var(--sidebar-width)", display: "flex", flexDirection: "column" }}>
        {/* Brand & Clock */}
        <div style={{ padding: "1.8rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem" }}>
             <div style={{ width: "45px", height: "45px", background: "linear-gradient(135deg, var(--accent-gold), #f97316)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: "800", color: "var(--primary-deep-blue)", boxShadow: "0 4px 10px rgba(245, 158, 11, 0.4)" }}>
              🎓
            </div>
            <div>
              <h2 style={{ fontSize: "1.2rem", margin: 0, color: "white", fontWeight: "800", letterSpacing: "0.5px" }}>نظام الزيارات</h2>
              <p style={{ fontSize: "0.75rem", margin: 0, color: "var(--accent-cyan)", fontWeight: "600" }}>إدارة غرب الزقازيق التعليمية</p>
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.05)", padding: "0.8rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)" }}>
             <Clock />
          </div>
        </div>

        {/* User Card */}
        <div style={{ padding: "1.2rem", background: "linear-gradient(135deg, rgba(37,99,235,0.1), rgba(0,0,0,0.2))", margin: "1.2rem 1.2rem 0.5rem", borderRadius: "16px", border: "1px solid rgba(37,99,235,0.2)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-10px", right: "-10px", width: "40px", height: "40px", background: "var(--accent-primary)", borderRadius: "50%", opacity: "0.2", filter: "blur(10px)" }}></div>
          <p style={{ fontSize: "0.8rem", margin: 0, color: "rgba(255,255,255,0.6)", fontWeight: "600" }}>مرحباً بك،</p>
          <p style={{ fontSize: "1rem", fontWeight: "800", margin: "0.3rem 0 0", color: "white" }}>
            {isAdmin ? "مدير النظام 👑" : `أ/ ${user?.supervisor?.name || user?.username}`}
          </p>
          {isAdmin && <p style={{ fontSize: "0.75rem", color: "var(--accent-gold)", marginTop: "0.4rem", fontWeight: "700" }}>المشرف العام</p>}
        </div>

        {/* Navigation Links */}
        <nav style={{ flex: 1, padding: "1rem 0", overflowY: "auto", overflowX: "hidden" }}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.2rem" }}>
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link 
                  href={link.href}
                  className={`nav-link ${pathname === link.href ? "active" : ""}`}
                  onClick={closeSidebar} // Added onClick to close sidebar on mobile
                >
                  <span style={{ fontSize: "1.2rem", width: "30px", textAlign: "center" }}>{link.icon}</span>
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="pulse-badge" style={{
                      background: "var(--accent-gold)", color: "var(--primary-deep-blue)", padding: "2px 6px", 
                      borderRadius: "10px", fontSize: "0.6rem", fontWeight: "bold", marginLeft: "auto",
                      animation: "pulse 2s infinite"
                    }}>{link.badge}</span>
                  )}
                </Link>
              </li>
            ))}
            {isAdmin && (
               <li style={{ marginTop: "1rem", padding: "0 1rem" }}>
                 <Link 
                    href="/reports/advanced" 
                    className={`nav-link ${pathname === "/reports/advanced" ? "active" : ""}`}
                    style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(0,0,0,0.2))", border: "1px solid rgba(245,158,11,0.3)", color: "var(--accent-gold)", margin: "0" }}
                  >
                    <span style={{ fontSize: "1.2rem", width: "30px", textAlign: "center" }}>📋</span>
                    <span>خطط وتقارير الطباعة</span>
                 </Link>
               </li>
            )}
          </ul>
        </nav>

        {/* Footer & Logout */}
        <div style={{ padding: "1.5rem", background: "rgba(0,0,0,0.2)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <form action={logoutAction}>
            <button type="submit" className="logout-btn">
              <span style={{ fontSize: "1.1rem" }}>🚪</span> تسجيل الخروج
            </button>
          </form>
          
          <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
            <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.80rem", color: "rgba(255,255,255,0.7)", fontWeight: "bold" }}>
              تحت إشراف وكيل الإدارة:<br/>
              <span style={{ color: "var(--accent-gold)", fontSize: "0.9rem" }}>{settings?.managerName || "أ. محمد العسيلى"}</span>
            </p>
            <p style={{ margin: 0, fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", display: "flex", flexDirection: "column", gap: "2px" }}>
              <span>تصميم وتطوير {settings?.designerName || "م. محمد الحاوي"}</span>
              <span style={{ direction: "ltr", display: "inline-block" }}>📞 {settings?.designerPhone || "+201022104948"}</span>
            </p>
          </div>
        </div>
      </aside>

      <style jsx>{`
        .logout-btn {
          width: 100%;
          padding: 0.8rem;
          background: rgba(239, 68, 68, 0.1);
          color: #fca5a5;
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 12px;
          cursor: pointer;
          font-family: inherit;
          font-weight: 700;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .logout-btn:hover {
          background: var(--danger);
          color: white;
          border-color: var(--danger);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }
      `}</style>
    </>
  );
}
