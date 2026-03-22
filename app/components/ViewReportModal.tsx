"use client";
import { useState } from "react";

export default function ViewReportModal({ reportText, excuseReason, isExcuse, supervisorName, schoolName, date }: any) {
  const [isOpen, setIsOpen] = useState(false);

  if (!reportText && !excuseReason) return <span style={{ color: "#aaa", fontSize: "0.8rem", padding: "0.4rem" }}>لا يوجد تقرير</span>;

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        style={{ 
          padding: "0.4rem 0.8rem", 
          fontSize: "0.8rem", 
          border: "1px solid var(--primary-deep-blue)", 
          color: "var(--primary-deep-blue)", 
          background: "transparent", 
          cursor: "pointer", 
          borderRadius: "4px",
          fontWeight: "bold"
        }}
      >
        👁️ عرض التقرير
      </button>

      {isOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.6)", display: "flex",
          justifyContent: "center", alignItems: "center", zIndex: 9999
        }}>
          <div style={{
            background: "white", width: "90%", maxWidth: "550px",
            borderRadius: "16px", padding: "2rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            position: "relative",
            animation: "fadeIn 0.2s ease-out"
          }}>
            <button onClick={() => setIsOpen(false)} style={{
              position: "absolute", top: "20px", left: "20px",
              background: "transparent", border: "none", fontSize: "1.5rem",
              cursor: "pointer", color: "#999", transition: "0.2s"
            }} onMouseOver={(e) => e.currentTarget.style.color = "red"} onMouseOut={(e) => e.currentTarget.style.color = "#999"}>✖</button>
            
            <h3 style={{ margin: "0 0 1.5rem 0", color: isExcuse ? "var(--danger)" : "var(--primary-deep-blue)", fontSize: "1.3rem", borderBottom: "2px solid #eee", paddingBottom: "1rem" }}>
              {isExcuse ? "🚫 تقرير اعتذار الموجه" : "📋 التقرير الفني للزيارة"}
            </h3>
            
            <div style={{ fontSize: "0.95rem", color: "#666", marginBottom: "1.5rem", background: "#f8f9fa", padding: "1rem", borderRadius: "8px" }}>
              <p style={{ margin: "0 0 0.5rem 0" }}><strong>👨‍🏫 الموجه:</strong> {supervisorName}</p>
              <p style={{ margin: "0 0 0.5rem 0" }}><strong>🏫 المدرسة:</strong> {schoolName}</p>
              <p style={{ margin: 0 }}><strong>📅 التاريخ:</strong> {date}</p>
            </div>
            
            <div>
              <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1rem", color: "#444" }}>التفاصيل والملاحظات:</h4>
              <div style={{ 
                background: isExcuse ? "#fff0f0" : "#fff", 
                padding: "1rem", 
                borderRadius: "8px", 
                minHeight: "120px", 
                lineHeight: "1.8",
                border: "1px solid " + (isExcuse ? "#ffcaca" : "#ddd"),
                color: "#111",
                fontSize: "1rem"
              }}>
                {isExcuse ? (
                   <p style={{ color: "var(--danger)", margin: 0, fontWeight: "bold" }}>السبب: {excuseReason}</p>
                ) : (
                   <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{reportText}</p>
                )}
              </div>
            </div>
            
            <div style={{ marginTop: "2rem", textAlign: "left" }}>
              <button 
                 onClick={() => setIsOpen(false)}
                 className="btn-primary" 
                 style={{ padding: "0.6rem 2rem", background: "var(--primary-deep-blue)", border: "none" }}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
