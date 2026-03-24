"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm({ settings }: { settings: any }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "تأكد من صحة رقم الهاتف وكلمة المرور");
        setLoading(false);
        return;
      }

      router.push(data.redirect);
      router.refresh();
    } catch (err) {
      setError("فشل الاتصال بخادم النظام. يرجى المحاولة لاحقاً.");
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f4f6f9",
      backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23e2e8f0\" fill-opacity=\"0.4\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{
        background: "white",
        width: "100%",
        maxWidth: "450px",
        borderRadius: "12px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
        overflow: "hidden",
        border: "1px solid #e2e8f0"
      }}>
        
        {/* Top Header representing Government/Official Vibe */}
        <div style={{ background: "#1e3a8a", padding: "10px", textAlign: "center", color: "white", borderBottom: "4px solid #bfa15f" }}>
           <div style={{ fontSize: "0.85rem", fontWeight: "bold" }}>جمهورية مصر العربية</div>
           <div style={{ fontSize: "1rem", fontWeight: "900", letterSpacing: "1px" }}>{settings?.siteName || "وزارة التربية والتعليم والتعليم الفني"}</div>
        </div>

        <div style={{ padding: "2.5rem 2rem 1.5rem", textAlign: "center" }}>
          {/* Official Logo */}
          <div style={{ marginBottom: "1.5rem" }}>
            <img src="/moe-logo.png" alt="شعار الوزارة" style={{ width: "110px", height: "auto", margin: "0 auto", objectFit: "contain" }} onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="45" fill="%23f1f5f9" stroke="%23cbd5e1" stroke-width="2"/><text x="50" y="55" font-size="14" text-anchor="middle" fill="%2364748b">الشعار هنا</text></svg>' }} />
          </div>
          
          <h1 style={{ color: "#0f172a", fontSize: "1.5rem", marginBottom: "0.5rem", fontWeight: "800" }}>
            بوابة نظام الزيارات المدرسية
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.95rem", margin: "0 0 1.5rem 0", fontWeight: "600" }}>
            إدارة غرب الزقازيق التعليمية — قسم التوجيه المالي والإداري
          </p>

          {error && (
            <div style={{
              background: "#fef2f2",
              color: "#b91c1c",
              padding: "0.8rem",
              borderRadius: "6px",
              marginBottom: "1.5rem",
              fontSize: "0.9rem",
              border: "1px solid #fecaca",
              fontWeight: "600"
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <div style={{ textAlign: "right" }}>
              <label style={{ fontSize: "0.9rem", color: "#334155", display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>رقم الجوال (اسم المستخدم):</label>
              <input
                name="username"
                placeholder="أدخل رقم الهاتف المسجل..."
                required
                style={{
                  width: "100%", padding: "0.9rem", borderRadius: "6px", border: "1px solid #cbd5e1",
                  fontSize: "1rem", fontFamily: "inherit", textAlign: "left", direction: "ltr", outline: "none",
                  transition: "border-color 0.2s", background: "#f8fafc"
                }}
                onFocus={(e) => { e.target.style.borderColor = "#1e3a8a"; e.target.style.background = "white"; }}
                onBlur={(e) => { e.target.style.borderColor = "#cbd5e1"; e.target.style.background = "#f8fafc"; }}
              />
            </div>

            <div style={{ textAlign: "right" }}>
              <label style={{ fontSize: "0.9rem", color: "#334155", display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>كلمة المرور:</label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                required
                style={{
                  width: "100%", padding: "0.9rem", borderRadius: "6px", border: "1px solid #cbd5e1",
                  fontSize: "1rem", fontFamily: "inherit", textAlign: "left", direction: "ltr", outline: "none",
                  transition: "border-color 0.2s", background: "#f8fafc"
                }}
                onFocus={(e) => { e.target.style.borderColor = "#1e3a8a"; e.target.style.background = "white"; }}
                onBlur={(e) => { e.target.style.borderColor = "#cbd5e1"; e.target.style.background = "#f8fafc"; }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "0.9rem", borderRadius: "6px", border: "none",
                background: loading ? "#94a3b8" : "#1e3a8a", color: "white", fontSize: "1.05rem",
                fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer",
                marginTop: "0.5rem", transition: "background 0.2s"
              }}
            >
              {loading ? "جاري المصادقة..." : "تسجيل الدخول"}
            </button>
          </form>
        </div>

        {/* Copyright Footer inside card */}
        <div style={{ background: "#f8fafc", padding: "1.2rem", borderTop: "1px solid #e2e8f0", textAlign: "center" }}>
          <p style={{ fontSize: "0.85rem", color: "#475569", margin: "0 0 0.4rem 0", fontWeight: "bold" }}>
            تحت إشراف وكيل الإدارة: <span style={{ color: "#1e3a8a" }}>{settings?.managerName || "أ. محمد العسيلى"}</span>
          </p>
          <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: "5px" }}>
            <span>{" "} تصميم وتطوير {settings?.designerName || "م. محمد الحاوي"}</span>
            <span style={{ direction: "ltr", display: "inline-block", background: "#e2e8f0", padding: "2px 6px", borderRadius: "4px" }}>📞 {settings?.designerPhone || "+201022104948"}</span>
          </p>
        </div>

      </div>
    </div>
  );
}
