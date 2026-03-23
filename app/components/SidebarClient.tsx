"use client";

import { useState } from "react";
import Link from "next/link";
import { logoutAction } from "@/app/login/actions";
import Clock from "./Clock";

interface SidebarClientProps {
  user: any;
  isAdmin: boolean;
}

export default function SidebarClient({ user, isAdmin }: SidebarClientProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Header */}
      <header className="mobile-header no-print">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "35px", height: "35px", background: "var(--accent-gold)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "var(--primary-deep-blue)" }}>
            W
          </div>
          <span style={{ fontWeight: "bold", fontSize: "0.9rem" }}>نظام الزيارات</span>
        </div>
        <button 
          onClick={toggleSidebar}
          style={{ background: "none", border: "none", color: "white", fontSize: "1.5rem", cursor: "pointer" }}
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
      <aside className={`sidebar no-print ${isOpen ? "open" : ""}`} style={{ width: "280px" }}>
        <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "0.5rem" }}>
             <div style={{ width: "40px", height: "40px", background: "var(--accent-gold)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: "bold", color: "var(--primary-deep-blue)" }}>
              W
            </div>
            <div>
              <h2 style={{ fontSize: "1.1rem", margin: 0, color: "var(--accent-gold)" }}>نظام الزيارات</h2>
              <p style={{ fontSize: "0.7rem", margin: 0, opacity: 0.8 }}>إدارة غرب الزقازيق التعليمية</p>
            </div>
          </div>
          <Clock />
        </div>

        <div style={{ padding: "1rem", background: "rgba(0,0,0,0.2)", margin: "1rem", borderRadius: "12px" }}>
          <p style={{ fontSize: "0.8rem", margin: 0, opacity: 0.7 }}>مرحباً بك،</p>
          <p style={{ fontSize: "0.95rem", fontWeight: "bold", margin: "0.2rem 0 0" }}>
            {isAdmin ? "مدير النظام 👑" : `أ/ ${user?.supervisor?.name || user?.username}`}
          </p>
          {isAdmin && <p style={{ fontSize: "0.7rem", color: "var(--accent-gold)", marginTop: "0.2rem" }}>أ. محمد العسيلى</p>}
        </div>

        <nav style={{ flex: 1, padding: "1rem", overflowY: "auto" }}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {isAdmin ? (
              <>
                <li><Link href="/dashboard" onClick={closeSidebar} className="nav-link-item">🏠 لوحة التحكم</Link></li>
                <li><Link href="/schools" onClick={closeSidebar} className="nav-link-item">🏫 المدارس</Link></li>
                <li><Link href="/supervisors" onClick={closeSidebar} className="nav-link-item">👥 الموجهين</Link></li>
                <li><Link href="/specializations" onClick={closeSidebar} className="nav-link-item">📚 التخصصات</Link></li>
                <li><Link href="/schedule" onClick={closeSidebar} className="nav-link-item">📅 الجدول الشهري</Link></li>
                <li><Link href="/whatsapp" onClick={closeSidebar} className="nav-link-item">💬 الواتساب</Link></li>
                <li><Link href="/reports" onClick={closeSidebar} className="nav-link-item">📊 سجل النشاط</Link></li>
                <li><Link href="/admins" onClick={closeSidebar} className="nav-link-item">🛡️ إدارة الإداريين</Link></li>
                <li><Link href="/admins/backup" onClick={closeSidebar} className="nav-link-item">💾 النسخ الاحتياطي والضبط</Link></li>
                <li>
                  <Link href="/reports/advanced" onClick={closeSidebar} className="nav-link-item" style={{ color: "var(--accent-gold)", border: "1px solid rgba(245,176,65,0.3)", marginTop: "0.5rem" }}>
                    📋 خطط وتقارير الطباعة
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li><Link href="/my-schedule" onClick={closeSidebar} className="nav-link-item">📅 جدولي اليومي</Link></li>
                <li><Link href="/my-reports" onClick={closeSidebar} className="nav-link-item">📝 تقاريري السابقة</Link></li>
                <li><Link href="/my-schedule/settings" onClick={closeSidebar} className="nav-link-item">⚙️ إعدادات الحساب</Link></li>
              </>
            )}
          </ul>
        </nav>

        <div style={{ padding: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <form action={logoutAction}>
            <button type="submit" className="logout-btn">
              🚪 تسجيل الخروج
            </button>
          </form>
          <p style={{ textAlign: "center", fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", marginTop: "0.8rem" }}>
            تنفيذ وإشراف: أ. محمد العسيلى
          </p>
        </div>
      </aside>

      <style jsx>{`
        .nav-link-item {
          text-decoration: none;
          color: rgba(255,255,255,0.8);
          padding: 0.8rem 1rem;
          display: block;
          border-radius: 10px;
          transition: all 0.2s;
          font-size: 0.95rem;
        }
        .nav-link-item:hover {
          background: rgba(255,255,255,0.1);
          color: white;
          padding-right: 1.2rem;
        }
        .logout-btn {
          width: 100%;
          padding: 0.8rem;
          background: rgba(239, 68, 68, 0.1);
          color: #ff9999;
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 10px;
          cursor: pointer;
          font-family: inherit;
          font-weight: bold;
          transition: all 0.2s;
        }
        .logout-btn:hover {
          background: var(--danger);
          color: white;
        }
      `}</style>
    </>
  );
}
