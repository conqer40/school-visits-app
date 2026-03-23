"use client";

import { useState } from "react";
import { exportDataAction, importDataAction, factoryResetAction } from "./actions";

export default function BackupPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleExport = async () => {
    setLoading(true);
    try {
      const result = await exportDataAction();
      const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      setMessage({ type: "success", text: "تم تصدير النسخة الاحتياطية بنجاح" });
    } catch (error) {
      setMessage({ type: "error", text: "فشل تصدير البيانات" });
    }
    setLoading(false);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm("تحذير: استعادة النسخة سيؤدي لمسح كافة البيانات الحالية واستبدالها بالنسخة المرفوعة. هل تريد الاستمرار؟")) {
      e.target.value = "";
      return;
    }

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        const result = await importDataAction(text);
        if (result.success) {
          setMessage({ type: "success", text: "تم استعادة البيانات بنجاح" });
        } else {
          setMessage({ type: "error", text: result.error || "فشل استيراد البيانات" });
        }
        setLoading(false);
      };
      reader.readAsText(file);
    } catch (error) {
      setMessage({ type: "error", text: "خطأ في قراءة الملف" });
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("⚠️ تحذير شديد الخطورة: هل أنت متأكد من رغبتك في إعادة ضبط المصنع؟ سيتم مسح كافة المدارس والموجهين والزيارات والتقارير نهائياً. (سيتم الاحتفاظ بحسابات الأدمن فقط)")) {
      return;
    }

    if (!confirm("هل أنت متأكد حقاً؟ لا يمكن التراجع عن هذا الإجراء.")) {
      return;
    }

    setLoading(true);
    try {
      const result = await factoryResetAction();
      if (result.success) {
        setMessage({ type: "success", text: "تمت إعادة ضبط المصنع بنجاح" });
      } else {
        setMessage({ type: "error", text: result.error || "فشل إجراء إعادة الضبط" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "حدث خطأ غير متوقع" });
    }
    setLoading(false);
  };

  return (
    <div dir="rtl" style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem", textAlign: "center" }}>
        <h1 style={{ color: "var(--primary-deep-blue)", fontSize: "2rem", marginBottom: "0.5rem" }}>⚙️ صيانة النظام والبيانات</h1>
        <p style={{ color: "#666" }}>إدارة النسخ الاحتياطي، استعادة البيانات، وإعادة ضبط المصنع</p>
      </div>

      {message && (
        <div style={{
          padding: "1rem 1.5rem",
          borderRadius: "12px",
          marginBottom: "2rem",
          backgroundColor: message.type === "success" ? "#e8f5e9" : "#ffebee",
          color: message.type === "success" ? "#2e7d32" : "#c62828",
          border: `1px solid ${message.type === "success" ? "#a5d6a7" : "#ef9a9a"}`,
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontWeight: "bold",
          animation: "fadeIn 0.3s ease-out"
        }}>
          {message.type === "success" ? "✅" : "❌"} {message.text}
        </div>
      )}

      <div className="grid-responsive" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
        
        {/* Export Card */}
        <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", transition: "transform 0.2s" }}>
          <div>
            <div style={{ width: "50px", height: "50px", background: "#e3f2fd", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", marginBottom: "1rem" }}>📥</div>
            <h2 style={{ fontSize: "1.25rem", color: "var(--primary-deep-blue)", marginBottom: "0.5rem" }}>تصدير نسخة احتياطية</h2>
            <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "1.5rem", lineHeight: "1.5" }}>تحميل كافة بيانات النظام (المدار، الموجهين، الزيارات، التقارير) في ملف JSON آمن للحتفاظ به.</p>
          </div>
          <button
            onClick={handleExport}
            disabled={loading}
            className="btn-primary"
            style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", fontWeight: "bold" }}
          >
            {loading ? "جاري التجميع..." : "تحميل النسخة الاحتياطية"}
          </button>
        </div>

        {/* Import Card */}
        <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ width: "50px", height: "50px", background: "#e8f5e9", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", marginBottom: "1rem" }}>📤</div>
            <h2 style={{ fontSize: "1.25rem", color: "var(--primary-deep-blue)", marginBottom: "0.5rem" }}>استعادة نسخة احتياطية</h2>
            <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "1.5rem", lineHeight: "1.5" }}>استرجاع بياناتك من ملف محفوظ سابقاً. <span style={{ color: "#c62828", fontWeight: "bold" }}>تنبيه: سيمسح البيانات الحالية!</span></p>
          </div>
          <label style={{ 
            display: "block", 
            textAlign: "center", 
            padding: "0.8rem", 
            background: "white", 
            border: "2px dashed var(--primary-deep-blue)", 
            color: "var(--primary-deep-blue)", 
            borderRadius: "8px", 
            cursor: "pointer", 
            fontWeight: "bold",
            transition: "all 0.2s"
          }} 
          onMouseOver={(e) => e.currentTarget.style.background = "#f0f7ff"}
          onMouseOut={(e) => e.currentTarget.style.background = "white"}
          >
            {loading ? "جاري الاستعادة..." : "اختر ملف واسترجع البيانات"}
            <input type="file" accept=".json" onChange={handleImport} disabled={loading} style={{ display: "none" }} />
          </label>
        </div>

        {/* Reset Card */}
        <div className="card" style={{ gridColumn: "1 / -1", border: "1px solid #ffcdd2", background: "#fff9f9" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "1.5rem", flexWrap: "wrap" }}>
            <div style={{ width: "60px", height: "60px", background: "#ffebee", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", flexShrink: 0 }}>⚠️</div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: "1.25rem", color: "#c62828", marginBottom: "0.5rem" }}>إعادة ضبط المصنع (حذف شامل)</h2>
              <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "1.5rem", lineHeight: "1.6" }}>
                هذا الإجراء سيقوم بحذف كافة (المدارس، الموجهين، جداول العمل، الزيارات، التقارير) نهائياً.
                <br />
                <strong style={{ color: "#c62828" }}>حسابات مديري النظام (الأدمن) لن تتأثر بهذا الحذف.</strong>
              </p>
              <button
                onClick={handleReset}
                disabled={loading}
                style={{ 
                  background: "#c62828", 
                  color: "white", 
                  padding: "0.8rem 2rem", 
                  border: "none", 
                  borderRadius: "8px", 
                  fontWeight: "bold", 
                  cursor: "pointer",
                  opacity: loading ? 0.5 : 1
                }}
              >
                {loading ? "جاري الحذف..." : "تنفيذ إعادة ضبط المصنع الآن"}
              </button>
            </div>
          </div>
        </div>

      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
