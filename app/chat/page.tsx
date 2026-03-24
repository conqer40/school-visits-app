import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ChatRoom from "./ChatRoom";

export const dynamic = "force-dynamic";

export default async function ChatPage({ searchParams }: { searchParams: Promise<{ spec?: string }> }) {
  const user = await getSession();
  if (!user) redirect("/login");

  const { spec } = await searchParams;
  const isAdmin = user.role === "ADMIN";
  const p = prisma as any;

  // 1. Fetch Specializations (for filter dropdown for Admin)
  const specializationsRaw = await p.specialization.findMany({ orderBy: { name: "asc" } });
  const specializations = JSON.parse(JSON.stringify(specializationsRaw));
  
  let allowedSpecIds: number[] = [];
  let isBanned = false;

  if (isAdmin) {
    allowedSpecIds = specializations.map((s: any) => s.id);
  } else {
    // Supervisor capabilities
    const supRaw = await p.supervisor.findUnique({ where: { id: user.supervisorId } });
    if (!supRaw || !supRaw.specializationId) {
      return (
        <div className="card text-center" style={{ margin: "2rem auto", maxWidth: "600px", color: "var(--danger)" }}>
          <h2 style={{ marginBottom: "1rem" }}>⚠️ عذراً، لا يمكنك دخول الدردشة!</h2>
          <p>حسابك غير مرتبط بتخصص تعليمي محدد. الرجاء مراجعة الإدارة.</p>
        </div>
      );
    }
    if (supRaw.isBannedFromChat) {
      isBanned = true;
      return (
        <div className="card text-center" style={{ margin: "2rem auto", maxWidth: "600px", color: "var(--danger)" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>⛔</div>
          <h2 style={{ marginBottom: "1rem" }}>تم حظرك من المشاركة في غرف الدردشة</h2>
          <p>لقد تم تقييد حسابك من الوصول للدردشات بواسطة الإدارة المدرسية.</p>
        </div>
      );
    }
    allowedSpecIds = [supRaw.specializationId];
  }

  // 3. Current active filters
  const selectedSpecId = spec ? parseInt(spec) : (allowedSpecIds[0] || specializations[0]?.id || 0);
  const currentSpecName = specializations.find((s:any) => s.id === selectedSpecId)?.name || "غير محدد";

  // Initial fetched messages
  const rawMessages = await p.chatMessage.findMany({
    where: { specializationId: selectedSpecId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      author: {
        select: { id: true, name: true, region: true, isBannedFromChat: true }
      }
    }
  });
  
  const initialMessages = JSON.parse(JSON.stringify(rawMessages.reverse()));

  return (
    <div dir="rtl" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)", maxHeight: "1000px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ color: "var(--secondary-dark-navy)", margin: 0, fontSize: "1.6rem", fontWeight: "900" }}>💬 غرفة دردشة التوجيه</h1>
          <p style={{ color: "var(--accent-primary)", fontSize: "0.9rem", margin: "0.3rem 0 0", fontWeight: "600" }}>
            التواصل المباشر لموجهي مادة ({currentSpecName})
          </p>
        </div>
      </div>

      <ChatRoom 
        initialMessages={initialMessages} 
        user={{ ...user, supervisorId: user.supervisorId || 0 }} 
        isAdmin={isAdmin} 
        specializations={specializations}
        allowedSpecIds={allowedSpecIds}
        selectedSpecId={selectedSpecId}
      />
    </div>
  );
}
