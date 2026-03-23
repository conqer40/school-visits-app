"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteSchoolAction(formData: FormData) {
  const idRaw = formData.get("schoolId") as string;
  const id = parseInt(idRaw);
  if (!id) return;
  
  // 1. Delete associated visit reports first
  await (prisma as any).visitReport.deleteMany({
    where: { visit: { schoolId: id } }
  });
  // 2. Delete associated visits
  await (prisma as any).visit.deleteMany({ where: { schoolId: id } });
  // 3. Delete school
  await (prisma as any).school.delete({ where: { id } });
  
  revalidatePath("/schools");
  revalidatePath("/");
}
