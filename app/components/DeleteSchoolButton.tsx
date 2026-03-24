"use client";

import { useTransition } from "react";
import { deleteSchoolAction } from "@/app/schools/actions";

export default function DeleteSchoolButton({ schoolId }: { schoolId: number }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (confirm("هل أنت متأكد من حذف هذه المدرسة؟")) {
          const formData = new FormData();
          formData.append("schoolId", schoolId.toString());
          startTransition(async () => {
            await deleteSchoolAction(formData);
          });
        }
      }}
      disabled={isPending}
      style={{
        background: "rgba(239, 68, 68, 0.1)",
        border: "1px solid rgba(239, 68, 68, 0.2)",
        color: "#ef4444",
        cursor: "pointer",
        fontSize: "0.85rem",
        padding: "4px 12px",
        borderRadius: "6px",
        fontFamily: "inherit",
        opacity: isPending ? 0.6 : 1
      }}
    >
      {isPending ? "جاري الحذف..." : "حذف"}
    </button>
  );
}
