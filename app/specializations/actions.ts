"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const p = prisma as any;

export async function addSpecializationAction(formData: FormData) {
  const name = formData.get("name") as string;
  const meetingDayStr = formData.get("meetingDay") as string;
  const meetingDay = meetingDayStr !== "" ? parseInt(meetingDayStr) : null;

  await p.specialization.create({ data: { name, meetingDay } });
  revalidatePath("/specializations");
  revalidatePath("/supervisors");
}

export async function editSpecializationAction(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const meetingDayStr = formData.get("meetingDay") as string;
  const meetingDay = meetingDayStr !== "" ? parseInt(meetingDayStr) : null;

  await p.specialization.update({ where: { id }, data: { name, meetingDay } });
  revalidatePath("/specializations");
  revalidatePath("/supervisors");
}

export async function deleteSpecializationAction(id: number) {
  await p.specialization.delete({ where: { id } });
  revalidatePath("/specializations");
}
