"use client";

import { useTransition } from "react";
import { deleteSupervisorAction } from "../app/supervisors/actions_server";

export default function DeleteSupervisorButton({ supervisorId }: { supervisorId: number }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (confirm("هل أنت متأكد من حذف هذا الموجه؟")) {
          const formData = new FormData();
          formData.append("supervisorId", supervisorId.toString());
          startTransition(async () => {
            await deleteSupervisorAction(formData);
          });
        }
      }}
      disabled={isPending}
      style={{
        background: "none",
        border: "none",
        color: "var(--danger)",
        cursor: "pointer",
        fontSize: "0.9rem",
        padding: 0,
        fontFamily: "inherit",
        opacity: isPending ? 0.6 : 1
      }}
    >
      {isPending ? "حذف..." : "حذف"}
    </button>
  );
}
