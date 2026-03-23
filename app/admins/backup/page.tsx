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
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6 text-primary">النسخ الاحتياطي وإعادة الضبط</h1>

      {message && (
        <div className={`p-4 mb-6 rounded-lg ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="card-glass p-6 rounded-xl hover-glow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500 text-2xl">📥</div>
            <div>
              <h2 className="text-xl font-semibold">تصدير نسخة احتياطية</h2>
              <p className="text-sm opacity-70 italic">تحميل كافة بيانات السيستم في ملف واحد</p>
            </div>
          </div>
          <button
            onClick={handleExport}
            disabled={loading}
            className="w-full btn-primary py-3 rounded-lg font-bold disabled:opacity-50"
          >
            {loading ? "جاري التجهيز..." : "تحميل النسخة الاحتياطية (JSON)"}
          </button>
        </div>

        {/* Import Card */}
        <div className="card-glass p-6 rounded-xl hover-glow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-500/10 rounded-lg text-green-500 text-2xl">📤</div>
            <div>
              <h2 className="text-xl font-semibold">استعادة نسخة احتياطية</h2>
              <p className="text-sm opacity-70 italic">رفع ملف JSON محفوظ سابقاً لاسترجاع البيانات</p>
            </div>
          </div>
          <label className="block w-full cursor-pointer bg-white/5 border-2 border-dashed border-white/20 hover:border-primary/50 text-center py-3 rounded-lg font-bold transition-all">
            {loading ? "جاري الاستعادة..." : "اختر ملف النسخة الاحتياطية"}
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={loading}
              className="hidden"
            />
          </label>
        </div>

        {/* Factory Reset Card */}
        <div className="card-glass p-6 rounded-xl hover-glow border-red-500/30 md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-500/10 rounded-lg text-red-500 text-2xl">⚠️</div>
            <div>
              <h2 className="text-xl font-semibold text-red-500">إعادة ضبط المصنع</h2>
              <p className="text-sm opacity-70 italic">مسح شامل لكافة البيانات (مدارس، موجهين، زيارات، تقارير) مع الإبقاء على حسابات الأدمن</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
          >
            {loading ? "جاري حذف البيانات..." : "تنفيذ إعادة ضبط المصنع"}
          </button>
        </div>
      </div>
    </div>
  );
}
