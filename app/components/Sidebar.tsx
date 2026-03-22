import { getSession } from "@/lib/auth";
import { logoutAction } from "@/app/login/actions";
import Clock from "./Clock";
import Link from "next/link";

export default async function Sidebar() {
  const user = await getSession();
  if (!user) return null;

  const isAdmin = user.role === "ADMIN";

  const adminLinks = [
    { href: "/", label: "🏠 الرئيسية" },
    { href: "/schools", label: "🏫 إدارة المدارس" },
    { href: "/supervisors", label: "👥 إدارة الموجهين" },
    { href: "/schedule", label: "📅 الجدول الشهري" },
    { href: "/reports", label: "📊 التقارير" },
    { href: "/whatsapp", label: "💬 رسائل واتساب" },
    { href: "/settings", label: "⚙️ الإعدادات" },
  ];

  const supervisorLinks = [
    { href: "/my-schedule", label: "📅 جدولي" },
    { href: "/my-reports", label: "📝 تقاريري" },
  ];

  const links = isAdmin ? adminLinks : supervisorLinks;

  return (
    <aside className="sidebar no-print" style={{
      width: "280px",
      background: "var(--primary-deep-blue)",
      color: "white",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      position: "sticky",
      top: 0,
      boxShadow: "4px 0 10px rgba(0,0,0,0.1)"
    }}>
      <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <h2 style={{ fontSize: "1.2rem", margin: 0, color: "var(--accent-gold)" }}>نظام الزيارات</h2>
        <p style={{ fontSize: "0.8rem", margin: "0.4rem 0 0", opacity: 0.8 }}>إدارة غرب الزقازيق التعليمية</p>
        <Clock />
      </div>

      <div style={{ padding: "1rem", background: "rgba(0,0,0,0.2)", margin: "1rem", borderRadius: "12px" }}>
        <p style={{ fontSize: "0.85rem", margin: 0, opacity: 0.7 }}>مرحباً بك،</p>
        <p style={{ fontSize: "1rem", fontWeight: "bold", margin: "0.2rem 0 0" }}>
          {isAdmin ? "👑 مدير النظام" : `👤 ${(user as any).supervisor?.name || user.username}`}
        </p>
        {isAdmin && <p style={{ fontSize: "0.75rem", color: "var(--accent-gold)", marginTop: "0.2rem" }}>أ. محمد العسيلى</p>}
      </div>
      <nav style={{ flex: 1, padding: "1rem" }} className="sidebar-nav-container">
        <ul className="sidebar-nav-list" style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {isAdmin ? (
            <>
              <li><Link href="/dashboard" style={{ textDecoration: "none", color: "white", padding: "0.8rem", display: "block", borderRadius: "8px" }} className="nav-link">🏠 لوحة التحكم</Link></li>
              <li><Link href="/schools" style={{ textDecoration: "none", color: "white", padding: "0.8rem", display: "block", borderRadius: "8px" }} className="nav-link">🏫 المدارس</Link></li>
              <li><Link href="/supervisors" style={{ textDecoration: "none", color: "white", padding: "0.8rem", display: "block", borderRadius: "8px" }} className="nav-link">👥 الموجهين</Link></li>
              <li><Link href="/specializations" style={{ textDecoration: "none", color: "white", padding: "0.8rem", display: "block", borderRadius: "8px" }} className="nav-link">📚 التخصصات</Link></li>
              <li><Link href="/schedule" style={{ textDecoration: "none", color: "white", padding: "0.8rem", display: "block", borderRadius: "8px" }} className="nav-link">📅 الجدول الشهري</Link></li>
              <li><Link href="/whatsapp" style={{ textDecoration: "none", color: "white", padding: "0.8rem", display: "block", borderRadius: "8px" }} className="nav-link">💬 الواتساب</Link></li>
              <li><Link href="/reports" style={{ textDecoration: "none", color: "white", padding: "0.8rem", display: "block", borderRadius: "8px" }} className="nav-link">📊 سجل النشاط</Link></li>
              <li><Link href="/admins" style={{ textDecoration: "none", color: "white", padding: "0.8rem", display: "block", borderRadius: "8px" }} className="nav-link">🛡️ إدارة الإداريين</Link></li>
              <li><Link href="/reports/advanced" style={{ textDecoration: "none", color: "var(--accent-gold)", padding: "0.8rem", display: "block", borderRadius: "8px", fontWeight: "bold", border: "1px solid var(--accent-gold)" }} className="nav-link">📋 خطط وتقارير الطباعة</Link></li>
            </>
          ) : (
            <>
              <li><Link href="/my-schedule" style={{ textDecoration: "none", color: "white", padding: "0.8rem", display: "block", borderRadius: "8px" }} className="nav-link">📅 جدولي اليومي</Link></li>
              <li><Link href="/my-reports" style={{ textDecoration: "none", color: "white", padding: "0.8rem", display: "block", borderRadius: "8px" }} className="nav-link">📝 تقاريري السابقة</Link></li>
            </>
          )}
        </ul>
      </nav>
      <div style={{ padding: "1rem", borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: "auto" }}>
        <form action={logoutAction}>
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "0.7rem",
              background: "rgba(255,255,255,0.1)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: "0.9rem",
            }}
          >
            🚪 تسجيل الخروج
          </button>
        </form>
        <p style={{ textAlign: "center", fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", marginTop: "0.5rem" }}>
          تنفيذ: أ. محمد العسيلى
        </p>
      </div>
    </aside>
  );
}
