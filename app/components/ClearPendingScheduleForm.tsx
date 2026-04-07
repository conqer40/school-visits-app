"use client";

import React from "react";
import { clearPendingScheduleAction } from "../schedule/actions";

export default function ClearPendingScheduleForm() {
  return (
    <form 
      action={clearPendingScheduleAction}
      onSubmit={(e) => {
        if (!confirm("هل أنت متأكد من مسح جميع الزيارات المعلقة لهذا الشهر؟ لا يمكن التراجع عن هذه الخطوة.")) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="btn-primary"
        style={{ background: "transparent", border: "2px solid var(--danger)", color: "var(--danger)" }}
      >
        مسح المعلق
      </button>
    </form>
  );
}
