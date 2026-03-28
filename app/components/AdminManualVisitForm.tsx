"use client";
import { useState } from "react";
import { adminAddManualVisitAction, checkDuplicateVisitAction } from "@/app/schedule/actions";

export default function AdminManualVisitForm({ schools, supervisors }: any) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      const schoolId = parseInt(formData.get("schoolId") as string);
      const dateStr = formData.get("date") as string;

      // Check for duplicates
      const isDup = await checkDuplicateVisitAction(schoolId, dateStr);
      if (isDup) {
        if (!confirm("⚠️ تنبيه: توجد زيارة أخرى لهذه المدرسة في نفس التاريخ. هل تريد الاستمرار في إضافة هذه الزيارة على أي حال؟")) {
          setLoading(false);
          return;
        }
      }

      // Re-append force if confirmed
      formData.set("force", "true");
      const res = await adminAddManualVisitAction(formData);
      
      if (res?.error) {
        alert("❌ خطأ: " + res.message);
      } else {
        // Form resets automatically on successful server action if it was a real form action,
        // but since we're calling it manually, we might need to reset or the page revalidation will handle it.
        (document.getElementById("adminAddVisitForm") as HTMLFormElement)?.reset();
      }
    } catch (e) {
      alert("❌ حدث خطأ غير متوقع.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card" style={{ marginBottom: "2rem", borderRight: "4px solid var(--primary-deep-blue)" }}>
      <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>➕ إضافة زيارة يدوية (مباشرة)</h2>
      <form id="adminAddVisitForm" action={handleSubmit} style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ flex: 1, minWidth: "200px" }}>
          <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.4rem", color: "#666" }}>المدرسة:</label>
          <select name="schoolId" required style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--border)" }}>
            <option value="">-- اختر مدرسة --</option>
            {schools.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: "200px" }}>
          <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.4rem", color: "#666" }}>الموجه:</label>
          <select name="supervisorId" required style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--border)" }}>
            <option value="">-- اختر موجه --</option>
            {supervisors.map((sup: any) => (
              <option key={sup.id} value={sup.id}>{sup.name}</option>
            ))}
          </select>
        </div>
        <div style={{ width: "160px" }}>
          <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.4rem", color: "#666" }}>التاريخ:</label>
          <input type="date" name="date" required style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--border)" }} />
        </div>
        <button type="submit" disabled={loading} className="btn-primary" style={{ padding: "0.7rem 1.5rem", opacity: loading ? 0.7 : 1 }}>
          {loading ? "جاري الإضافة..." : "إضافة الزيارة"}
        </button>
      </form>
    </section>
  );
}
