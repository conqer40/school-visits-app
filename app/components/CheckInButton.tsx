"use client";
import { useState } from "react";
import { checkInVisitAction } from "@/app/my-schedule/actions";

export default function CheckInButton({ visitId }: { visitId: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckIn = () => {
    setLoading(true);
    setError(null);
    if (!navigator.geolocation) {
      setError("متصفحك لا يدعم تحديد الموقع (GPS).");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
           await checkInVisitAction(visitId, pos.coords.latitude, pos.coords.longitude);
           // Page refresh and UI update is handled by Next.js Server Action
        } catch (e: any) {
           setError(e.message || "حدث خطأ أثناء الإرسال");
           setLoading(false);
        }
      },
      (err) => {
        setError(`يرجى السماح بالوصول للموقع. (${err.message})`);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div style={{ textAlign: "left" }}>
       <button onClick={handleCheckIn} disabled={loading} className="btn-primary" style={{ background: "var(--success)", border: "none" }}>
         {loading ? "جاري التحديد..." : "📍 تسجيل حضور بالمدرسة"}
       </button>
       {error && <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.5rem", textAlign: "right", fontWeight: "bold" }}>{error}</p>}
    </div>
  );
}
