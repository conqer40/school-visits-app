"use client";

export default function PrintButton() {
  return (
    <button 
      type="button" 
      onClick={() => window.print()} 
      className="btn-primary no-print"
      style={{ background: "var(--success)", border: "none", padding: "0.6rem" }}
    >
      🖨️ طباعة / تصدير PDF
    </button>
  );
}
