import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import CommunityFeed from "./CommunityFeed";

export const dynamic = "force-dynamic";

export default async function CommunityPage({ searchParams }: { searchParams: Promise<{ spec?: string, level?: string }> }) {
  const user = await getSession();
  if (!user) redirect("/login");

  const { spec, level } = await searchParams;

  const isAdmin = user.role === "ADMIN";
  const p = prisma as any;

  // 1. Fetch Specializations (for filter dropdown)
  const specializationsRaw = await p.specialization.findMany({ orderBy: { name: "asc" } });
  const specializations = JSON.parse(JSON.stringify(specializationsRaw));
  
  // 2. Determine allowed Specs & Levels for this user
  let allowedSpecIds: number[] = [];
  let allowedLevels: string[] = [];

  if (isAdmin) {
    allowedSpecIds = specializations.map((s: any) => s.id);
    allowedLevels = ["رياض أطفال", "ابتدائي", "إعدادي", "ثانوي عام", "ثانوي فني", "تربية خاصة", "الكل"];
  } else {
    // Supervisor capabilities
    const supRaw = await p.supervisor.findUnique({ where: { id: user.supervisorId } });
    if (!supRaw || !supRaw.specializationId) {
      return (
        <div className="card text-center" style={{ margin: "2rem auto", maxWidth: "600px", color: "var(--danger)" }}>
          <h2 style={{ marginBottom: "1rem" }}>⚠️ عذراً، لا يمكنك دخول المجتمع!</h2>
          <p>حسابك غير مرتبط بتخصص تعليمي محدد. الرجاء مراجعة الإدارة.</p>
        </div>
      );
    }
    allowedSpecIds = [supRaw.specializationId];
    allowedLevels = supRaw.levels.split(",").map((l: string) => l.trim()).filter(Boolean);
  }

  // 3. Current active filters
  const selectedSpecId = spec ? parseInt(spec) : (allowedSpecIds[0] || 0);
  const selectedLevel = level || (allowedLevels[0] || "");

  // 4. Fetch Posts
  const postsRaw = await p.post.findMany({
    where: {
      specializationId: selectedSpecId,
      level: selectedLevel,
    },
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: { id: true, name: true, region: true },
      },
      spec: true,
      likes: true,
      comments: {
        include: {
          author: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: "asc" }
      }
    }
  });

  // VERY IMPORTANT: Serialize Prisma Data and handle NULL authors for Admin posts
  const safePosts = JSON.parse(JSON.stringify(postsRaw)).map((post: any) => ({
    ...post,
    author: post.author || { name: "مدير النظام", region: "البوابة الرسمية" },
    comments: (post.comments || []).map((comment: any) => ({
      ...comment,
      author: comment.author || { name: "مدير النظام" }
    }))
  }));

  return (
    <div dir="rtl">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ color: "var(--secondary-dark-navy)", margin: 0, fontSize: "1.8rem", fontWeight: "800" }}>🤝 مجتمع الموجهين</h1>
          <p style={{ color: "var(--accent-primary)", fontSize: "0.9rem", margin: "0.3rem 0 0", fontWeight: "600" }}>
            التواصل والنقاشات المهنية بين موجهي نفس التخصص والمرحلة
          </p>
        </div>
      </div>

      <CommunityFeed 
        posts={safePosts} 
        user={{ ...user, supervisorId: user.supervisorId }} 
        isAdmin={isAdmin} 
        specializations={specializations}
        allowedSpecIds={allowedSpecIds}
        allowedLevels={allowedLevels}
        selectedSpecId={selectedSpecId}
        selectedLevel={selectedLevel}
      />
    </div>
  );
}
