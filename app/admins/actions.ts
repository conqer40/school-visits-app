"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addAdminAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) return;

  await (prisma as any).user.create({
    data: {
      username,
      password,
      role: "ADMIN"
    }
  });

  revalidatePath("/admins");
}

export async function editAdminAction(id: number, formData: FormData) {
  const password = formData.get("password") as string;
  if (!password) return;

  await (prisma as any).user.update({
    where: { id },
    data: { password }
  });

  revalidatePath("/admins");
}

export async function deleteAdminAction(id: number) {
  // Prevent deleting the main admin if possible or just allow for now
  await (prisma as any).user.delete({ where: { id } });
  revalidatePath("/admins");
}
