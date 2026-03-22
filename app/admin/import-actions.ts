"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function importSchoolsCSVAction(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) return;

  const text = await file.text();
  const lines = text.split("\n").filter(line => line.trim() !== "");
  
  // Skip header if present (assume: Name, Admin, Level)
  const startIndex = lines[0].includes("اسم") || lines[0].includes("Name") ? 1 : 0;

  const schools = [];
  for (let i = startIndex; i < lines.length; i++) {
    const [name, admin, level] = lines[i].split(",").map(s => s.trim());
    if (name) {
      schools.push({
        name,
        administration: admin || "غرب الزقازيق التعليمية",
        level: level || "ثانوي",
      });
    }
  }

  if (schools.length > 0) {
    await (prisma as any).school.createMany({ data: schools });
  }

  revalidatePath("/schools");
}

export async function importSupervisorsCSVAction(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) return;

  const text = await file.text();
  const lines = text.split("\n").filter(line => line.trim() !== "");
  
  // Assume: Name, Phone, Specialization, Region
  const startIndex = lines[0].includes("اسم") ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const [name, phone, spec, region] = lines[i].split(",").map(s => s.trim());
    if (name && phone) {
      const sup = await (prisma as any).supervisor.create({
        data: { name, phone, specialization: spec || "عام", region: region || "غرب الزقازيق" },
      });
      
      // Create user
      await (prisma as any).user.create({
        data: {
          username: phone,
          password: phone, // Default password is phone
          role: "SUPERVISOR",
          supervisorId: sup.id
        }
      });
    }
  }

  revalidatePath("/supervisors");
}
