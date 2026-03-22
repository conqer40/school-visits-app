"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
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
        setError(data.error || "حدث خطأ أثناء تسجيل الدخول");
        setLoading(false);
        return;
      }

      // Success - navigate to the redirect path
      router.push(data.redirect);
      router.refresh();
    } catch (err) {
      setError("فشل الاتصال بالخادم. تأكد من اتصالك بالشبكة.");
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, var(--secondary-dark-navy) 0%, var(--primary-deep-blue) 100%)",
      fontFamily: "inherit",
      padding: "1rem",
    }}>
      <div style={{
        background: "white",
        borderRadius: "16px",
        padding: "3rem",
        width: "100%",
        maxWidth: "420px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        textAlign: "center"
      }}>
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ 
            width: "70px", 
            height: "70px", 
            background: "var(--accent-gold)", 
            borderRadius: "50%", 
            margin: "0 auto 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2rem"
          }}>
            🔐
          </div>
          <h1 style={{ color: "var(--primary-deep-blue)", fontSize: "1.7rem", marginBottom: "0.5rem", fontWeight: "900" }}>
            دخول النظام الآمن
          </h1>
          <p style={{ color: "var(--accent-gold)", fontWeight: "bold", fontSize: "1.1rem", margin: "0.5rem 0" }}>
            إدارة غرب الزقازيق التعليمية
          </p>
          <div style={{ height: "2px", width: "50px", background: "var(--accent-gold)", margin: "1rem auto" }}></div>
        </div>

        {error && (
          <div style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: "0.8rem",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            fontSize: "0.9rem",
            border: "1px solid #fecaca"
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <div style={{ textAlign: "right" }}>
            <label style={{ fontSize: "0.85rem", color: "#666", display: "block", marginBottom: "0.4rem" }}>اسم المستخدم (رقم الهاتف):</label>
            <input
              name="username"
              placeholder="012XXXXXXXX"
              required
              style={{
                width: "100%",
                padding: "1rem",
                borderRadius: "12px",
                border: "2px solid #eee",
                fontSize: "1rem",
                fontFamily: "inherit",
                textAlign: "left",
                direction: "ltr",
                outline: "none",
                transition: "all 0.3s"
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--accent-gold)"}
              onBlur={(e) => e.target.style.borderColor = "#eee"}
            />
          </div>

          <div style={{ textAlign: "right" }}>
            <label style={{ fontSize: "0.85rem", color: "#666", display: "block", marginBottom: "0.4rem" }}>كلمة المرور:</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              required
              style={{
                width: "100%",
                padding: "1rem",
                borderRadius: "12px",
                border: "2px solid #eee",
                fontSize: "1rem",
                fontFamily: "inherit",
                textAlign: "left",
                direction: "ltr",
                outline: "none",
                transition: "all 0.3s"
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--accent-gold)"}
              onBlur={(e) => e.target.style.borderColor = "#eee"}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "1rem",
              borderRadius: "12px",
              border: "none",
              background: loading 
                ? "#aaa" 
                : "linear-gradient(135deg, var(--primary-deep-blue), var(--secondary-dark-navy))",
              color: "white",
              fontSize: "1.1rem",
              fontWeight: "bold",
              fontFamily: "inherit",
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "1rem",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              transition: "transform 0.2s"
            }}
          >
            {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول للنظام"}
          </button>
        </form>

        <div style={{ marginTop: "2.5rem", paddingTop: "1.5rem", borderTop: "1px solid #f0f0f0" }}>
          <p style={{ fontSize: "0.85rem", color: "#777", margin: 0 }}>
            بإدارة وتوجيه: <strong style={{ color: "var(--primary-deep-blue)" }}>أ. محمد العسيلى</strong>
          </p>
          <p style={{ fontSize: "0.75rem", color: "#999", marginTop: "0.3rem" }}>وكيل إدارة غرب الزقازيق التعليمية</p>
        </div>
      </div>
    </div>
  );
}
