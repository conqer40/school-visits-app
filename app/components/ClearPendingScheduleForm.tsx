"use client";

import React, { useState } from "react";
import { clearPendingScheduleAction } from "../schedule/actions";
import { useRouter } from "next/navigation";

export default function ClearPendingScheduleForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClear = async () => {
    if (!confirm("⚠️ تحذير: هل أنت متأكد من مسح الجدول الشهري كاملاً؟\n\nسيتم حذف جميع الزيارات (المعلقة والمكتملة والملغية) لهذا الشهر.\n\nلا يمكن التراجع عن هذه الخطوة.")) {
      return;
    }
    setLoading(true);
    try {
      await clearPendingScheduleAction();
      router.refresh();
    } catch (e) {
      alert("حدث خطأ أثناء مسح الجدول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClear}
      disabled={loading}
      className="btn-primary"
      style={{ background: "transparent", border: "2px solid var(--danger)", color: "var(--danger)", opacity: loading ? 0.6 : 1 }}
    >
      {loading ? "جاري المسح..." : "🗑️ مسح الجدول كاملاً"}
    </button>
  );
}
