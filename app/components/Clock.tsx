"use client";

import { useState, useEffect } from "react";

export default function Clock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      background: "rgba(255,255,255,0.1)",
      padding: "1rem",
      borderRadius: "12px",
      textAlign: "center",
      border: "1px solid rgba(255,255,255,0.2)",
      marginTop: "1rem",
      minHeight: "75px" // Reserve space to prevent layout shift
    }}>
      {time ? (
        <>
          <div style={{ fontSize: "0.75rem", opacity: 0.8, marginBottom: "0.3rem" }}>
            {time.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--accent-gold)", letterSpacing: "1px", direction: "ltr" }}>
            {time.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </>
      ) : null}
    </div>
  );
}
