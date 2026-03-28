"use client";
import { useState } from "react";
import { approveManualVisitAction, rejectManualVisitAction, editVisitAction, deleteVisitAction } from "@/app/schedule/actions";

export default function VisitAdminActions({ visit, schools, supervisors }: any) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [reason, setReason] = useState("");

  const handleEdit = async (formData: FormData) => {
    try {
      const schoolId = parseInt(formData.get("schoolId") as string);
      const supervisorId = parseInt(formData.get("supervisorId") as string);
      const dateStr = formData.get("date") as string;
      
      // Duplicate check
      const { checkDuplicateVisitAction } = await import("@/app/schedule/actions");
      const isDup = await checkDuplicateVisitAction(schoolId, dateStr, visit.id);
      
      if (isDup) {
        if (!confirm("⚠️ تنبيه: توجد زيارة أخرى لهذه المدرسة في نفس التاريخ. هل تريد الاستمرار في حفظ التعديل على أي حال؟")) {
          return;
        }
      }

      await editVisitAction(visit.id, { schoolId, supervisorId, date: dateStr });
      setIsEditOpen(false);
    } catch (e: any) {
      console.error(e);
      alert("⚠️ فشل الحفظ: " + (e.message || "خطأ غير متوقع"));
    }
  };

  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
      {/* Manual Approval Logic */}
      {visit.isManual && visit.adminApproval === "PENDING" && (
        <>
          <button 
            onClick={() => approveManualVisitAction(visit.id)}
            style={{ padding: "0.4rem 0.8rem", background: "var(--success)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}
          >
            ✅ موافقة
          </button>
          <button 
            onClick={() => setIsRejectOpen(true)}
            style={{ padding: "0.4rem 0.8rem", background: "var(--danger)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}
          >
            ❌ رفض
          </button>
        </>
      )}

      {/* Edit Button */}
      <button 
        onClick={() => setIsEditOpen(true)}
        style={{ padding: "0.4rem 0.8rem", background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}
      >
        ✏️ تعديل
      </button>

      {/* Delete Button */}
      <button 
        onClick={async () => {
          if (confirm("⚠️ هل أنت متأكد من رغبتك في حذف هذه الزيارة نهائياً؟")) {
             try {
               await deleteVisitAction(visit.id);
             } catch (e) {
               alert("❌ فشل الحذف.");
             }
          }
        }}
        style={{ padding: "0.4rem 0.8rem", background: "white", color: "var(--danger)", border: "1px solid var(--danger)", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}
      >
        🗑️ حذف
      </button>

      {/* Rejection Modal */}
      {isRejectOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 10000 }}>
          <div style={{ background: "white", padding: "1.5rem", borderRadius: "8px", width: "90%", maxWidth: "400px" }}>
            <h3 style={{ marginTop: 0 }}>سبب الرفض</h3>
            <textarea 
              value={reason} 
              onChange={(e) => setReason(e.target.value)}
              placeholder="اكتب سبب الرفض هنا..."
              style={{ width: "100%", height: "100px", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc", marginBottom: "1rem", fontFamily: "inherit" }}
            />
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button onClick={() => setIsRejectOpen(false)} style={{ padding: "0.5rem 1rem", background: "#eee", border: "none", borderRadius: "4px", cursor: "pointer" }}>إلغاء</button>
              <button onClick={() => { rejectManualVisitAction(visit.id, reason); setIsRejectOpen(false); }} style={{ padding: "0.5rem 1rem", background: "var(--danger)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>تأكيد الرفض</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 10000 }}>
          <div style={{ background: "white", padding: "2rem", borderRadius: "12px", width: "95%", maxWidth: "500px" }}>
            <h3 style={{ marginTop: 0, color: "var(--primary-deep-blue)" }}>✏️ تعديل بيانات الزيارة</h3>
            <form action={handleEdit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.9rem" }}>المدرسة:</label>
                <select name="schoolId" defaultValue={visit.schoolId} style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #ccc" }}>
                  {schools.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.9rem" }}>الموجه:</label>
                <select name="supervisorId" defaultValue={visit.supervisorId} style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #ccc" }}>
                  {supervisors.map((sup: any) => <option key={sup.id} value={sup.id}>{sup.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.9rem" }}>التاريخ:</label>
                <input type="date" name="date" defaultValue={new Date(visit.date).toISOString().split('T')[0]} style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #ccc" }} />
              </div>
              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "1rem" }}>
                <button type="button" onClick={() => setIsEditOpen(false)} style={{ padding: "0.6rem 1.2rem", background: "#eee", border: "none", borderRadius: "6px", cursor: "pointer" }}>إلغاء</button>
                <button type="submit" className="btn-primary" style={{ padding: "0.6rem 1.5rem" }}>حفظ التعديلات</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
