"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function checkInVisitAction(visitId: number, lat: number, lng: number) {
  const user = await getSession();
  if (!user || user.role !== "SUPERVISOR") throw new Error("Unauthorized");
  
  await (prisma as any).visit.update({
    where: { id: visitId, supervisorId: user.supervisorId! },
    data: {
      checkInTime: new Date(),
      checkInLat: lat,
      checkInLng: lng
    }
  });

  revalidatePath("/my-schedule");
  revalidatePath("/schedule");
}


export async function submitVisitReportAction(visitId: number, formData: FormData) {
  const user = await getSession();
  if (!user || user.role !== "SUPERVISOR") throw new Error("Unauthorized");

  const reportText = formData.get("reportText") as string;
  const isExcuse = formData.get("isExcuse") === "on";
  const excuseReason = formData.get("excuseReason") as string;

  await (prisma as any).visitReport.create({
    data: {
      visitId,
      supervisorId: user.supervisorId!,
      reportText,
      isExcuse,
      excuseReason: isExcuse ? excuseReason : null,
    },
  });


  await (prisma as any).visit.update({
    where: { id: visitId },
    data: { 
      status: isExcuse ? "EXCUSED" : "COMPLETED",
      notes: reportText 
    },
  });

  if (!isExcuse) {
    const visit = await (prisma as any).visit.findUnique({ where: { id: visitId } });
    if (visit) {
      await (prisma as any).school.update({
        where: { id: visit.schoolId },
        data: { 
          lastVisitDate: new Date(),
          totalVisits: { increment: 1 } 
        }
      });
    }
  }

  revalidatePath("/my-schedule");
  revalidatePath("/");
  redirect("/my-schedule");
}
export async function updatePasswordAction(formData: FormData) {
  const user = await getSession();
  if (!user || user.role !== "SUPERVISOR") throw new Error("Unauthorized");

  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (newPassword !== confirmPassword) {
    // In a real app we'd return an error to the UI
    return;
  }

  await (prisma as any).user.update({
    where: { id: user.id },
    data: { password: newPassword }
  });

  revalidatePath("/my-schedule/settings");
  redirect("/my-schedule");
}
