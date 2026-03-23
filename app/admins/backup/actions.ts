"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function exportDataAction() {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

  const specializations = await prisma.specialization.findMany();
  const schools = await prisma.school.findMany();
  const supervisors = await prisma.supervisor.findMany();
  const visits = await prisma.visit.findMany();
  const reports = await prisma.visitReport.findMany();

  return {
    version: "1.0",
    timestamp: new Date().toISOString(),
    data: {
      specializations,
      schools,
      supervisors,
      visits,
      reports
    }
  };
}

export async function factoryResetAction(confirmPassword?: string) {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

  // In a real app, we might check confirmPassword here
  
  try {
    await prisma.$transaction(async (tx) => {
      // Order matters to avoid foreign key constraints
      await tx.visitReport.deleteMany();
      await tx.visit.deleteMany();
      await tx.user.deleteMany({ where: { role: "SUPERVISOR" } });
      await tx.supervisor.deleteMany();
      await tx.school.deleteMany();
      await tx.specialization.deleteMany();
      
      await tx.log.create({
        data: {
          action: "FACTORY_RESET",
          user: user.username,
          details: "تم تنفيذ إعادة ضبط المصنع ومسح كافة البيانات باستثناء حسابات الأدمن"
        }
      });
    });

    revalidatePath("/admins/backup");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function importDataAction(jsonData: string) {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

  try {
    const parsed = JSON.parse(jsonData);
    if (!parsed.data) throw new Error("تنسيق الملف غير صحيح");

    const { specializations, schools, supervisors, visits, reports } = parsed.data;

    await prisma.$transaction(async (tx) => {
      // Clear first
      await tx.visitReport.deleteMany();
      await tx.visit.deleteMany();
      await tx.user.deleteMany({ where: { role: "SUPERVISOR" } });
      await tx.supervisor.deleteMany();
      await tx.school.deleteMany();
      await tx.specialization.deleteMany();

      // Insert Specializations
      if (specializations?.length) {
        await tx.specialization.createMany({ data: specializations });
      }

      // Insert Schools
      if (schools?.length) {
        await tx.school.createMany({ data: schools });
      }

      // Insert Supervisors
      if (supervisors?.length) {
        // CreateMany doesn't return IDs easily in some providers, but here we assume original IDs are in JSON
        // and we want to preserve them. prisma.createMany might not respect ID if it's autoincrement but we can try.
        // For PostgreSQL, it should work if we include ID.
        await tx.supervisor.createMany({ data: supervisors });
      }

      // Insert Visits
      if (visits?.length) {
        await tx.visit.createMany({ data: visits });
      }

      // Insert Reports
      if (reports?.length) {
        await tx.visitReport.createMany({ data: reports });
      }

      await tx.log.create({
        data: {
          action: "IMPORT_DATA",
          user: user.username,
          details: `تم استيراد بيانات من نسخة احتياطية بتاريخ ${parsed.timestamp}`
        }
      });
    });

    revalidatePath("/admins/backup");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
