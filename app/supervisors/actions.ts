"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addSupervisorAction(formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const region = formData.get("region") as string;
  const password = formData.get("password") as string || "123456";
  const specIdStr = formData.get("specializationId") as string;
  const specializationId = specIdStr ? parseInt(specIdStr) : null;
  const levels = formData.getAll("levels").join(",");
  const types = formData.getAll("types").join(",");

  const sup = await (prisma as any).supervisor.create({
    data: {
      name,
      phone,
      region,
      levels,
      types,
      specializationId,
      specialization: specIdStr ? undefined : "",
    },
  });

  // Create associated User record
  await (prisma as any).user.create({
    data: {
      username: phone,
      password,
      role: "SUPERVISOR",
      supervisorId: sup.id
    }
  });

  revalidatePath("/supervisors");
  revalidatePath("/");
}

export async function editSupervisorAction(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const region = formData.get("region") as string;
  const password = formData.get("password") as string;
  const specIdStr = formData.get("specializationId") as string;
  const specializationId = specIdStr ? parseInt(specIdStr) : null;
  const levels = formData.getAll("levels").join(",");
  const types = formData.getAll("types").join(",");

  await (prisma as any).supervisor.update({
    where: { id },
    data: { name, phone, region, levels, types, specializationId },
  });

  // Update associated User record if exists
  const existingUser = await (prisma as any).user.findUnique({ where: { supervisorId: id } });
  if (existingUser) {
    const updateData: any = { username: phone };
    if (password) updateData.password = password;
    await (prisma as any).user.update({ where: { id: existingUser.id }, data: updateData });
  } else {
    await (prisma as any).user.create({
      data: { username: phone, password: password || "123456", role: "SUPERVISOR", supervisorId: id }
    });
  }

  revalidatePath("/supervisors");
}

export async function deleteSupervisorAction(id: number) {
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
