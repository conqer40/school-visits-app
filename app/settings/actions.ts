"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateSystemSettingsAction(formData: FormData) {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

  const siteName = formData.get("siteName")?.toString();
  const managerName = formData.get("managerName")?.toString();
  const designerName = formData.get("designerName")?.toString();
  const designerPhone = formData.get("designerPhone")?.toString();

  if (!siteName || !managerName || !designerName || !designerPhone) return;

  await (prisma as any).systemSetting.upsert({
    where: { id: 1 },
    update: { siteName, managerName, designerName, designerPhone },
    create: { id: 1, siteName, managerName, designerName, designerPhone }
  });

  revalidatePath("/");
  revalidatePath("/settings");
}
