"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addSchoolAction(formData: FormData) {
  const name = formData.get("name") as string;
  const admin = formData.get("admin") as string;
  const shift = formData.get("shift") as string || "صباحي";
  const levels = formData.getAll("levels").join(",");
  const types = formData.getAll("types").join(",");
  
  // Default string if none provided = fall back to default from schema
  let workingDaysArray = formData.getAll("workingDays");
  let workingDays = workingDaysArray.length > 0 ? workingDaysArray.join(",") : "السبت,الأحد,الإثنين,الثلاثاء,الأربعاء,الخميس";

  const principalName = formData.get("principalName") as string;
  const principalPhone = formData.get("principalPhone") as string;
  const googleMapsUrl = formData.get("googleMapsUrl") as string;

  await (prisma as any).school.create({
    data: { 
      name, 
      administration: admin, 
      levels, 
      types, 
      shift, 
      workingDays,
      principalName,
      principalPhone,
      googleMapsUrl
    },
  });

  revalidatePath("/schools");
  revalidatePath("/");
}

export async function editSchoolAction(formData: FormData) {
  const idRaw = formData.get("schoolId") as string;
  const id = parseInt(idRaw);
  const name = formData.get("name") as string;
  const admin = formData.get("admin") as string;
  const principalName = formData.get("principalName") as string;
  const principalPhone = formData.get("principalPhone") as string;
  const googleMapsUrl = formData.get("googleMapsUrl") as string;
  const shift = formData.get("shift") as string || "صباحي";
  const levels = formData.getAll("levels").join(",");
  const types = formData.getAll("types").join(",");

  let workingDaysArray = formData.getAll("workingDays");
  let workingDays = workingDaysArray.length > 0 ? workingDaysArray.join(",") : "السبت,الأحد,الإثنين,الثلاثاء,الأربعاء,الخميس";

  await (prisma as any).school.update({
    where: { id },
    data: { 
      name, 
      administration: admin, 
      levels, 
      types, 
      shift, 
      workingDays,
      principalName,
      principalPhone,
      googleMapsUrl
    },
  });

  revalidatePath("/schools");
}

export async function deleteSchoolAction(formData: FormData) {
  const idRaw = formData.get("schoolId") as string;
  const id = parseInt(idRaw);
  // 1. Delete associated visit reports first
  await (prisma as any).visitReport.deleteMany({
    where: { visit: { schoolId: id } }
  });
  // 2. Delete associated visits
  await (prisma as any).visit.deleteMany({ where: { schoolId: id } });
  // 3. Delete school
  await (prisma as any).school.delete({ where: { id } });
  revalidatePath("/schools");
}
