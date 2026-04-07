"use client";

import React from "react";
import { clearPendingScheduleAction } from "../schedule/actions";

export default function ClearPendingScheduleForm() {
  return (
    <form 
      action={clearPendingScheduleAction}
      onSubmit={(e) => {
        if (!confirm("⚠️ تحذير: هل أنت متأكد من مسح الجدول الشهري كاملاً؟\n\nسيتم حذف جميع الزيارات (المعلقة والمكتملة والملغية) لهذا الشهر.\n\nلا يمكن التراجع عن هذه الخطوة.")) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="btn-primary"
        style={{ background: "transparent", border: "2px solid var(--danger)", color: "var(--danger)" }}
      >
        🗑️ مسح الجدول كاملاً
      </button>
    </form>
  );
}
