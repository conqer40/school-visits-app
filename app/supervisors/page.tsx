import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import SupervisorsClientPage from "./SupervisorsClientPage";

export const dynamic = "force-dynamic";

export default async function SupervisorsPage({ searchParams }: { searchParams: Promise<{ editId?: string }> }) {
  const { editId: editIdRaw } = await searchParams;
  const user = await getSession();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const p = prisma as any;

  const [rawSupervisors, rawSpecializations] = await Promise.all([
    p.supervisor.findMany({
      orderBy: { name: "asc" },
      include: { user: true, spec: true },
    }),
    p.specialization.findMany({ orderBy: { name: "asc" } }),
  ]);

  // CRITICAL FIX: Strip Date objects and other Prisma artifacts to prevent Vercel 500 error
  const supervisors = JSON.parse(JSON.stringify(rawSupervisors));
  const specializations = JSON.parse(JSON.stringify(rawSpecializations));

  const editId = editIdRaw ? parseInt(editIdRaw) : null;

  return (
    <SupervisorsClientPage 
      initialSupervisors={supervisors} 
      specializations={specializations}
      editId={editId}
    />
  );
}
