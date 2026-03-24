"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BroadcastClient({ 
  initialRecipients, specializations, activeTarget, activeSpec, activeLevel 
}: any) {
  const router = useRouter();
  const [message, setMessage] = useState("الزملاء الأعزاء، يرجى العلم أنه ...");
  const [sendingAll, setSendingAll] = useState(false);

  const handleFilterChange = (key: string, value: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    router.push(url.toString());
  };

  const getWaLink = (r: any) => {
    const phone = r.phone?.replace(/^0/, "20") || "";
    let finalMsg = message;
    
    // Auto-generate schedule if requested
    if (message.includes("[الجدول]")) {
      const scheduleText = r.visits?.map((v: any) => 
        `- يوم ${new Date(v.date).toLocaleDateString("ar-EG", { weekday: 'long' })} (${new Date(v.date).toLocaleDateString("ar-EG")}): أ/ ${v.supervisor.name}`
      ).join("\n") || "لا توجد زيارات مجدولة لهذا الشهر حتى الآن.";
      
      finalMsg = message.replace("[الجدول]", `\n📌 جدول زيارات شهر ${new Date().getMonth() + 1}:\n${scheduleText}`);
    }

    if (r.type === "PRINCIPAL") {
      finalMsg = `أ/ مدير مدرسة ${r.schoolName || ""}\n${finalMsg}`;
    } else {
      finalMsg = `أ/ ${r.name}\n${finalMsg}`;
    }

    return `https://wa.me/${phone}?text=${encodeURIComponent(finalMsg)}`;
  };

  const handleSendAll = async () => {
    if (!confirm(`هل أنت متأكد من فتح ${initialRecipients.length} محادثة واتساب؟ قد يقوم المتصفح بحظر النوافذ المنبثقة.`)) return;
    
    setSendingAll(true);
    for (const r of initialRecipients) {
      window.open(getWaLink(r), "_blank");
      // Small delay to prevent browser crash/block
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    setSendingAll(false);
  };

  return (
    <div className="grid-responsive" style={{ gridTemplateColumns: "1fr 2fr" }}>
      {/* Filters Sidebar */}
      <div className="card">
        <h3 style={{ marginBottom: "1.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>🎯 تخصيص المستلمين</h3>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>الفئة المستهدفة:</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
               <button 
                  onClick={() => handleFilterChange("target", "supervisors")}
                  style={{ padding: "0.6rem", borderRadius: "8px", border: "1px solid var(--border)", background: activeTarget === "supervisors" ? "var(--primary-deep-blue)" : "white", color: activeTarget === "supervisors" ? "white" : "black", cursor: "pointer", fontWeight: "bold" }}
               >👥 الموجهين</button>
               <button 
                  onClick={() => handleFilterChange("target", "principals")}
                  style={{ padding: "0.6rem", borderRadius: "8px", border: "1px solid var(--border)", background: activeTarget === "principals" ? "var(--primary-deep-blue)" : "white", color: activeTarget === "principals" ? "white" : "black", cursor: "pointer", fontWeight: "bold" }}
               >🏫 المدراء</button>
            </div>
          </div>

          {activeTarget === "supervisors" && (
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>التخصص:</label>
              <select 
                value={activeSpec || "all"} 
                onChange={(e) => handleFilterChange("spec", e.target.value)}
                style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border)" }}
              >
                <option value="all">كل التخصصات</option>
                {specializations.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>المرحلة:</label>
            <select 
              value={activeLevel || "all"} 
              onChange={(e) => handleFilterChange("level", e.target.value)}
              style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border)" }}
            >
              <option value="all">كل المراحل</option>
              <option value="ابتدائي">ابتدائي</option>
              <option value="إعدادي">إعدادي</option>
              <option value="ثانوي">ثانوي</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: "2rem", padding: "1rem", background: "rgba(37,99,235,0.05)", borderRadius: "12px", border: "1px dashed var(--accent-primary)" }}>
           <h4 style={{ margin: "0 0 0.5rem 0", color: "var(--primary-deep-blue)" }}>💡 نصائح:</h4>
           <ul style={{ fontSize: "0.8rem", paddingRight: "1.2rem", color: "#444" }}>
              <li>استخدم <code style={{ color: "var(--danger)" }}>[الجدول]</code> في الرسالة ليتم استبداله بجدول الزيارات الحقيقي للمدرسة.</li>
              <li>سيتم فتح نافذة جديدة لكل مستلم عند الضغط على "إرسال للكل".</li>
           </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h3 style={{ margin: 0 }}>👥 المستهدفون ({initialRecipients.length})</h3>
          <button 
            onClick={handleSendAll}
            disabled={sendingAll || initialRecipients.length === 0}
            className="btn-primary" 
            style={{ background: "var(--success)", border: "none", display: "flex", alignItems: "center", gap: "8px" }}
          >
            {sendingAll ? "🔄 جاري الفتح..." : "🚀 إرسال للكل دفعة واحدة"}
          </button>
        </div>

        {/* Message Input */}
        <div style={{ marginBottom: "1.5rem", padding: "1.2rem", background: "var(--primary-deep-blue)", borderRadius: "16px", color: "white", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
            <h4 style={{ margin: 0 }}>✍️ صياغة الرسالة الجماعية</h4>
            <div style={{ display: "flex", gap: "5px" }}>
               <button onClick={() => setMessage("الزملاء الأعزاء، نذكركم بضرورة تسجيل التقارير يومياً...")} style={{ padding: "4px 8px", fontSize: "0.7rem", borderRadius: "5px", border: "1px solid rgba(255,255,255,0.3)", background: "rgba(0,0,0,0.2)", color: "white", cursor: "pointer" }}>تذكير تقارير</button>
               {activeTarget === "principals" && (
                 <button onClick={() => setMessage("تحية طيبة، مرفق لسيادتكم جدول زيارات الموجهين لمدرستكم الموقرة لهذا الشهر: [الجدول]")} style={{ padding: "4px 8px", fontSize: "0.7rem", borderRadius: "5px", border: "1px solid rgba(255,255,255,0.3)", background: "rgba(0,0,0,0.2)", color: "white", cursor: "pointer" }}>إرسال الجدول</button>
               )}
            </div>
          </div>
          <textarea 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "none", color: "black", fontFamily: "inherit", fontSize: "0.95rem" }}
          ></textarea>
        </div>

        {/* Recipients List */}
        <div style={{ maxHeight: "500px", overflowY: "auto", border: "1px solid var(--border)", borderRadius: "12px", background: "rgba(0,0,0,0.01)" }}>
          {initialRecipients.length === 0 ? (
            <p style={{ textAlign: "center", padding: "3rem", color: "gray" }}>لا يوجد مستلمون يطابقون الفلاتر المحددة.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right" }}>
              <thead style={{ position: "sticky", top: 0, background: "var(--surface)", zIndex: 10 }}>
                <tr style={{ borderBottom: "2px solid var(--border)" }}>
                  <th style={{ padding: "1rem" }}>الاسم</th>
                  <th style={{ padding: "1rem" }}>{activeTarget === "supervisors" ? "التخصص" : "المدرسة"}</th>
                  <th style={{ padding: "1rem" }}>الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {initialRecipients.map((r: any) => (
                  <tr key={r.id} style={{ borderBottom: "1px solid var(--border-light)", transition: "background 0.2s" }}>
                    <td style={{ padding: "0.8rem 1rem", fontWeight: "bold" }}>
                       {r.type === "PRINCIPAL" ? `أ/ ${r.name}` : `أ/ ${r.name}`}
                    </td>
                    <td style={{ padding: "0.8rem 1rem", fontSize: "0.85rem", color: "#666" }}>
                       {r.type === "PRINCIPAL" ? r.schoolName : (r.spec?.name || "عام")}
                    </td>
                    <td style={{ padding: "0.8rem 1rem" }}>
                       <a 
                        href={getWaLink(r)} 
                        target="_blank" 
                        style={{ color: "var(--success)", fontWeight: "bold", textDecoration: "none", fontSize: "0.85rem" }}
                       >
                         🟢 واتساب
                       </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
