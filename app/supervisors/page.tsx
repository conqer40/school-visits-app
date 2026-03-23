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

  const [supervisors, specializations] = await Promise.all([
    p.supervisor.findMany({
      orderBy: { name: "asc" },
      include: { user: true, spec: true },
    }),
    p.specialization.findMany({ orderBy: { name: "asc" } }),
  ]);

  const editId = editIdRaw ? parseInt(editIdRaw) : null;

  return (
    <SupervisorsClientPage 
      initialSupervisors={supervisors} 
      specializations={specializations}
      editId={editId}
    />
  );
}
