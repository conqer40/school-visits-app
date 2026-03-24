import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import SchoolsClientPage from "./SchoolsClientPage";

export const dynamic = "force-dynamic";

export default async function SchoolsPage({ searchParams }: { searchParams: Promise<{ editId?: string }> }) {
  const { editId: editIdRaw } = await searchParams;
  const user = await getSession();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const rawSchools = await (prisma as any).school.findMany({
    orderBy: { name: "asc" },
  });
  
  // CRITICAL FIX: Strip Date objects and other Prisma artifacts to prevent Vercel 500 error
  const schools = JSON.parse(JSON.stringify(rawSchools));

  const editId = editIdRaw ? parseInt(editIdRaw) : null;

  return (
    <SchoolsClientPage 
      initialSchools={schools} 
      editId={editId}
      userRole={user.role}
    />
  );
}

