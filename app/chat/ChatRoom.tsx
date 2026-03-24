"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { sendChatMessageAction, deleteChatMessageAction, getChatMessagesAction } from "./actions";

export default function ChatRoom({ 
  initialMessages, user, isAdmin, specializations, allowedSpecIds, selectedSpecId 
}: any) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Polling for new messages every 3 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const newMessages = await getChatMessagesAction(selectedSpecId);
        if (JSON.stringify(newMessages) !== JSON.stringify(messages)) {
          setMessages(newMessages);
        }
      } catch (error) {
        console.error("Failed to fetch messages", error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedSpecId, messages]);

  const handleFilterChange = (value: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set("spec", value);
    router.push(url.toString());
  };

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.append("specializationId", selectedSpecId.toString());
    
    // Optimistic update
    const content = formData.get("content")?.toString() || "";
    const optimisticMessage = {
      id: Date.now(), // temporary
      content,
      specializationId: selectedSpecId,
      authorId: user.supervisorId,
      createdAt: new Date().toISOString(),
      author: {
        id: user.supervisorId,
        name: user.username,
        region: "غرب الزقازيق",
        isBannedFromChat: false
      }
    };
    
    setMessages((prev: any) => [...prev, optimisticMessage]);
    (e.target as HTMLFormElement).reset();

    try {
      await sendChatMessageAction(formData);
      // Actual fetch will happen on next poll or we can trigger it immediately
      const newMessages = await getChatMessagesAction(selectedSpecId);
      setMessages(newMessages);
    } catch (error: any) {
      alert(error.message || "حدث خطأ أثناء الإرسال");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذه الرسالة؟")) return;
    
    setMessages((prev: any) => prev.filter((m: any) => m.id !== id));
    await deleteChatMessageAction(id);
  };

  return (
    <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0", overflow: "hidden", background: "rgba(255,255,255,0.9)", border: "1px solid var(--border)" }}>
      
      {/* Chat Header Filters */}
      <div style={{ padding: "1rem 1.5rem", background: "var(--primary-deep-blue)", display: "flex", gap: "1rem", alignItems: "center" }}>
        {(isAdmin || allowedSpecIds.length > 1) ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", maxWidth: "400px" }}>
            <label style={{ color: "white", fontWeight: "bold", whiteSpace: "nowrap" }}>تغيير الغرفة:</label>
            <select 
              value={selectedSpecId} 
              onChange={(e) => handleFilterChange(e.target.value)}
              style={{ padding: "0.5rem", borderRadius: "8px", width: "100%", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", fontWeight: "bold" }}
            >
              {specializations.filter((s:any) => isAdmin || allowedSpecIds.includes(s.id)).map((s:any) => (
                <option key={s.id} value={s.id} style={{ color: "black" }}>{s.name}</option>
              ))}
            </select>
          </div>
        ) : (
           <div style={{ color: "var(--accent-gold)", fontWeight: "bold", fontSize: "1.1rem" }}>
             📍 التخصص: {specializations.find((s:any) => s.id === selectedSpecId)?.name}
           </div>
        )}
      </div>

      {/* Chat Messages Area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", background: "rgba(37,99,235,0.02)" }}>
        {messages.length === 0 ? (
          <div style={{ margin: "auto", textAlign: "center", color: "gray", opacity: 0.7 }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
            <h3>لا توجد رسائل في هذه الغرفة حتى الآن</h3>
            <p>كن أول من يبدأ النقاش!</p>
          </div>
        ) : (
          messages.map((msg: any) => {
            const isMine = isAdmin ? (msg.authorId === null) : (msg.authorId === user.supervisorId);
            const timeString = new Date(msg.createdAt).toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit' });
            const canDelete = isAdmin || isMine;

            return (
              <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: isMine ? "flex-start" : "flex-end", maxWidth: "80%", alignSelf: isMine ? "flex-start" : "flex-end" }}>
                {!isMine && (
                  <span style={{ fontSize: "0.75rem", color: msg.authorId === null ? "var(--danger)" : "gray", marginBottom: "4px", padding: "0 10px", fontWeight: msg.authorId === null ? "bold" : "normal" }}>
                    {msg.authorId === null ? "🛡️ مدير النظام" : msg.author?.name} {msg.author?.isBannedFromChat ? "🚫(محظور)" : ""}
                  </span>
                )}
                
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexDirection: isMine ? "row" : "row-reverse" }}>
                  <div style={{ 
                    padding: "0.8rem 1.2rem", 
                    borderRadius: "16px", 
                    background: isMine ? "var(--primary-deep-blue)" : (msg.authorId === null ? "rgba(239,68,68,0.1)" : "white"),
                    color: isMine ? "white" : "var(--secondary-dark-navy)",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                    border: isMine ? "none" : (msg.authorId === null ? "1px solid var(--danger)" : "1px solid var(--border)"),
                    borderBottomRightRadius: isMine ? "4px" : "16px",
                    borderBottomLeftRadius: isMine ? "16px" : "4px",
                    position: "relative"
                  }}>
                    <div style={{ fontSize: "1rem", lineHeight: "1.5", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      {msg.content}
                    </div>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "5px", gap: "15px" }}>
                      {canDelete && (
                        <button onClick={() => handleDelete(msg.id)} style={{ background: "none", border: "none", color: isMine ? "rgba(255,255,255,0.5)" : "rgba(239,68,68,0.5)", cursor: "pointer", fontSize: "0.75rem", padding: 0 }}>
                          حذف
                        </button>
                      )}
                      <span style={{ fontSize: "0.65rem", color: isMine ? "rgba(255,255,255,0.7)" : "#94a3b8", alignSelf: "flex-end" }}>
                        {timeString}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Area */}
      <div style={{ padding: "1.2rem 1.5rem", background: "white", borderTop: "1px solid var(--border)" }}>
        <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "10px" }}>
          <input 
            type="text" 
            name="content"
            placeholder={isAdmin ? "اكتب رسالة كمدير للنظام..." : "اكتب رسالتك للمناقشة..."} 
            required 
            style={{ flex: 1, padding: "1rem 1.5rem", borderRadius: "30px", border: "1px solid #e2e8f0", background: "rgba(0,0,0,0.02)", fontSize: "1rem", fontFamily: "inherit" }}
            autoComplete="off"
          />
          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{ 
              width: "55px", height: "55px", borderRadius: "50%", background: isSubmitting ? "gray" : (isAdmin ? "var(--danger)" : "var(--accent-primary)"), 
              color: "white", display: "flex", alignItems: "center", justifyContent: "center", 
              border: "none", cursor: isSubmitting ? "not-allowed" : "pointer", fontSize: "1.5rem",
              boxShadow: isSubmitting ? "none" : "0 4px 15px rgba(37,99,235,0.3)", transition: "all 0.2s"
            }}
          >
            {isAdmin ? "🛡️" : "🚀"}
          </button>
        </form>
      </div>
    </div>
  );
}
