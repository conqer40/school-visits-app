"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteSupervisorAction(formData: FormData) {
  const idRaw = formData.get("supervisorId") as string;
  const id = parseInt(idRaw);
  if (!id) return;
  
  // 1. Delete associated reports
  await (prisma as any).visitReport.deleteMany({ where: { supervisorId: id } });
  // 2. Delete associated visits
  await (prisma as any).visit.deleteMany({ where: { supervisorId: id } });
  // 3. Delete associated user
  await (prisma as any).user.deleteMany({ where: { supervisorId: id } });
  // 4. Delete supervisor
  await (prisma as any).supervisor.delete({ where: { id } });
  
  revalidatePath("/supervisors");
  revalidatePath("/");
}
