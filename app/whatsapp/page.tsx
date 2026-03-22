import { prisma } from "@/lib/prisma";
import { getSession, egyptDate } from "@/lib/auth";
import { redirect } from "next/navigation";
import { sendDailyRemindersAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function WhatsAppPage() {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const todayStr = new Date().toISOString().split("T")[0];
  const pendingToday = await prisma.visit.findMany({
    where: { 
      status: "PENDING",
      date: { gte: new Date(todayStr), lt: new Date(new Date(todayStr).getTime() + 86400000) }
    },
    include: { supervisor: true, school: true }
  });

  return (
    <div dir="rtl">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ color: "var(--primary-deep-blue)", margin: 0 }}>💬 مركز إشعارات الواتساب</h1>
          <p style={{ color: "#888" }}>إدارة غرب الزقازيق التعليمية — أ. محمد العسيلى</p>
        </div>
        
        <form action={sendDailyRemindersAction}>
          <button type="submit" className="btn-primary" style={{ background: "var(--danger)", border: "none" }}>
            🔔 توليد تذكيرات اليوم ({pendingToday.length})
          </button>
        </form>
      </div>

      <div className="card">
        <h2 style={{ fontSize: "1.2rem", marginBottom: "1.5rem" }}>📅 زيارات اليوم التي تطلب متابعة</h2>
        
        {pendingToday.length === 0 ? (
          <p style={{ textAlign: "center", padding: "3rem", color: "var(--success)", fontWeight: "bold" }}>
            ✅ تم تسجيل تقارير جميع زيارات اليوم! أو لا توجد زيارات مجدولة لليوم.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)", backgroundColor: "var(--surface)" }}>
                  <th style={{ padding: "1rem" }}>الموجه</th>
                  <th style={{ padding: "1rem" }}>المدرسة</th>
                  <th style={{ padding: "1rem" }}>الهاتف</th>
                  <th style={{ padding: "1rem" }}>الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {pendingToday.map(visit => {
                  const phone = visit.supervisor.phone?.replace(/^0/, "20");
                  const msg = `أ/ ${visit.supervisor.name}، يرجى تسجيل تقرير زيارتك اليوم لمدرسة ${visit.school.name} عبر النظام.`;
                  const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;

                  return (
                    <tr key={visit.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                      <td style={{ padding: "1rem", fontWeight: "bold" }}>أ/ {visit.supervisor.name}</td>
                      <td style={{ padding: "1rem" }}>{visit.school.name}</td>
                      <td style={{ padding: "1rem" }}>{visit.supervisor.phone}</td>
                      <td style={{ padding: "1rem" }}>
                        <a 
                          href={waLink} 
                          target="_blank" 
                          style={{ color: "var(--success)", fontWeight: "bold", textDecoration: "none", display: "flex", alignItems: "center", gap: "5px" }}
                        >
                          🟢 إرسال تذكير
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ marginTop: "2rem", padding: "1rem", borderRight: "4px solid var(--accent-gold)", background: "var(--surface)" }}>
        <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>🕒 إرشادات المتابعة:</h3>
        <p style={{ fontSize: "0.85rem", color: "#666" }}>
          يُنصح بإرسال التذكيرات في منتصف اليوم (الساعة 12 م) للموجهين الذين لم يقوموا برفع تقاريرهم بعد، وذلك لضمان المتابعة اللحظية من وكيل الإدارة.
        </p>
      </div>
    </div>
  );
}
