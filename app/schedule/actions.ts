"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const p = prisma as any;

const dayNames = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

// Returns all working days (Sun–Thu + Sat, excludes Friday) in the given month/year
function getWorkingDays(year: number, month: number): Date[] {
  const days: Date[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    const day = date.getDay();
    // Exclude Friday (5). Include Saturday (6) up to Thursday (4).
    if (day !== 5) days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

function normalizeString(str: string): string {
  if (!str) return "";
  return str
    .trim()
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ");
}



/**
 * الخوارزمية v5.2:
 * - التحقق من التطابق في المرحلة والنوع بين الموجه والمدرسة.
 * - لا يتم تكرار زيارة المدرسة لنفس الموجه في نفس الشهر إلا بعد انتهاء قائمة المدارس المخصصة له.
 * - التحقق من أيام العمل المخصصة لكل مدرسة (workingDays).
 * - مدرسة واحدة كحد أقصى تزار في اليوم (من أي موجه).
 * - موجه واحد له زيارة واحدة كحد أقصى في اليوم.
 * - استثناء يوم اجتماع التخصص.
 */
export async function generateScheduleAction(formData?: FormData) {
  try {
    const supervisors = await p.supervisor.findMany({
      where: { isActive: true },
      include: { spec: true },
      orderBy: { id: "asc" },
    });
    if (supervisors.length === 0) return;

    const schools = await p.school.findMany({
      where: { status: "ACTIVE" },
      orderBy: [{ lastVisitDate: "asc" }, { totalVisits: "asc" }],
    });
    if (schools.length === 0) return;

    const schoolMap = new Map();
    for (const sc of schools) {
      schoolMap.set(sc.id, sc);
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const workingDays = getWorkingDays(year, month);

    const firstDay = new Date(year, month, 1, 0, 0, 0, 0);
    const lastDay = new Date(year, month + 1, 0, 23, 59, 59, 999);

    // Get all existing visits for this month //
    const existingVisits = await p.visit.findMany({
      where: { date: { gte: firstDay, lte: lastDay } },
    });

    const schoolsVisitedPerDay = new Map<string, Set<number>>();
    const visitedBySupThisMonth = new Map<number, Set<number>>();

    for (const v of existingVisits) {
      const dateKey = v.date.toISOString().slice(0, 10);
      if (!schoolsVisitedPerDay.has(dateKey)) schoolsVisitedPerDay.set(dateKey, new Set());
      schoolsVisitedPerDay.get(dateKey)!.add(v.schoolId);

      if (!visitedBySupThisMonth.has(v.supervisorId)) visitedBySupThisMonth.set(v.supervisorId, new Set());
      visitedBySupThisMonth.get(v.supervisorId)!.add(v.schoolId);
    }

    // Step 1: Pre-calculate compatible schools for each supervisor
    const compatibleSchoolsMap = new Map<number, number[]>();
    let compatibilityLogged = false;

    for (const sup of supervisors) {
      const supLevels = (sup.levels || "").split(",").map(normalizeString).filter(Boolean);
      const supTypes = (sup.types || "").split(",").map(normalizeString).filter(Boolean);
      
      const compSchools = [];
      for (const school of schools) {
        const schLevels = (school.levels || "").split(",").map(normalizeString).filter(Boolean);
        const schTypes = (school.types || "").split(",").map(normalizeString).filter(Boolean);

        const hasCommonLevel = supLevels.some((l: string) => schLevels.includes(l));
        const hasCommonType = supTypes.some((t: string) => schTypes.includes(t));

        if (hasCommonLevel && hasCommonType) {
          compSchools.push(school.id);
        }
      }
      compatibleSchoolsMap.set(sup.id, compSchools);
    }


    const newVisits: any[] = [];

    // Step 2: Iterate over each working day and assign ONE visit per supervisor
    for (const workDay of workingDays) {
      const dateKey = workDay.toISOString().slice(0, 10);
      const dayOfWeek = workDay.getDay();

      if (!schoolsVisitedPerDay.has(dateKey)) schoolsVisitedPerDay.set(dateKey, new Set());
      const usedSchoolsToday = schoolsVisitedPerDay.get(dateKey)!;

      for (const sup of supervisors) {
        const meetingDay = sup.spec?.meetingDay;
        if (meetingDay === dayOfWeek) continue; // Skip if it's specialization meeting day

        const hasVisitToday = existingVisits.some((v: any) => v.supervisorId === sup.id && v.date.toISOString().slice(0, 10) === dateKey) ||
                              newVisits.some((v: any) => v.supervisorId === sup.id && v.date.toISOString().slice(0, 10) === dateKey);
        if (hasVisitToday) continue;

        const compSchools = compatibleSchoolsMap.get(sup.id) || [];
        if (compSchools.length === 0) continue; 

        let visitedSet = visitedBySupThisMonth.get(sup.id);
        if (!visitedSet) {
          visitedSet = new Set();
          visitedBySupThisMonth.set(sup.id, visitedSet);
        }

        // Available schools to visit = compSchools - visitedSet
        let availableSchools = compSchools.filter(id => !visitedSet!.has(id));

        // If cycle is exhausted, reset the cycle (allow repeating schools for this supervisor)
        if (availableSchools.length === 0) {
          visitedSet.clear();
          availableSchools = [...compSchools];
        }

        // MUST be a working day for the school
        availableSchools = availableSchools.filter(id => {
          const sc = schoolMap.get(id);
          if (!sc) return false;
          // default behavior if missing workingDays -> assume works that day, but we initialized it in schema with strings
          const wDaysList = sc.workingDays || "السبت,الأحد,الإثنين,الثلاثاء,الأربعاء,الخميس";
          return wDaysList.includes(dayNames[dayOfWeek]);
        });

        // Find the first available school that hasn't been visited by ANYONE TODAY
        const schoolToVisit = availableSchools.find(id => !usedSchoolsToday.has(id));

        if (schoolToVisit) {
          newVisits.push({
            schoolId: schoolToVisit,
            supervisorId: sup.id,
            date: workDay,
            dayOfWeek: dayNames[dayOfWeek],
            status: "PENDING",
          });

          usedSchoolsToday.add(schoolToVisit);
          visitedSet.add(schoolToVisit);
        }
      }
    }

    if (newVisits.length > 0) {
      await p.visit.createMany({ data: newVisits });
      await p.log.create({
        data: {
          action: "GENERATE_SCHEDULE",
          details: `تم بنجاح! إنشاء ${newVisits.length} زيارة ذكية لهذا الشهر مع مراعاة المراحل والأنواع وأيام العمل.`,
        },
      });
    } else {
      const totalComp = Array.from(compatibleSchoolsMap.values()).reduce((acc, curr) => acc + curr.length, 0);
      let reason = "لا توجد زيارات صالحة للجدولة.";
      if (totalComp === 0) {
        reason = "فشل التوافق: لم يتم العثور على مدرسة واحدة تتوافق مع تخصصات الموجهين (راجع المراحل والأنواع).";
      } else if (existingVisits.length > 0) {
        reason = "الجدول ممتلئ بالفعل لهذا الشهر أو تم استهلاك جميع الاحتمالات المتاحة.";
      }
      
      await p.log.create({
        data: { action: "GENERATE_SCHEDULE", details: reason },
      });
    }


    revalidatePath("/schedule");
    revalidatePath("/");
  } catch (error: any) {
    console.error("Scheduler Error:", error);
  }
}

export async function updateVisitStatusAction(visitId: number, status: string) {
  try {
    const updated = await p.visit.update({
      where: { id: visitId },
      data: { status },
    });
    if (status === "COMPLETED") {
      await p.school.update({
        where: { id: updated.schoolId },
        data: { lastVisitDate: new Date(), totalVisits: { increment: 1 } },
      });
    }
    revalidatePath("/schedule");
    revalidatePath("/");
  } catch (e: any) {
    console.error("Update Visit Status Error:", e.message);
  }
}

export async function clearPendingScheduleAction() {
  try {
    const today = new Date();
    // Ensure we cover the full range of the current month
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    // First delete related reports for visits in this month
    const visitsThisMonth = await p.visit.findMany({
      where: { date: { gte: firstDay, lte: lastDay } },
      select: { id: true }
    });
    const visitIds = visitsThisMonth.map((v: any) => v.id);
    
    if (visitIds.length > 0) {
      await p.visitReport.deleteMany({
        where: { visitId: { in: visitIds } }
      });
    }

    const deleted = await p.visit.deleteMany({
      where: { date: { gte: firstDay, lte: lastDay } },
    });
    
    await p.log.create({
      data: { 
        action: "CLEAR_SCHEDULE", 
        details: `تم مسح الجدول الشهري كاملاً: ${deleted.count} زيارة للشهر (${today.getMonth() + 1}/${today.getFullYear()})` 
      },
    });
    
    revalidatePath("/schedule");
    revalidatePath("/");
  } catch (e: any) {
    console.error("Clear Schedule Error:", e.message);
    await p.log.create({
      data: { action: "CLEAR_SCHEDULE_ERROR", details: `فشل مسح الجدول: ${e.message}` }
    });
  }
}

export async function approveManualVisitAction(visitId: number) {
  try {
    await p.visit.update({
      where: { id: visitId },
      data: { adminApproval: "APPROVED", status: "PENDING" }
    });
    await p.log.create({
      data: { action: "APPROVE_MANUAL_VISIT", details: `تمت الموافقة على زيارة يدوية رقم ${visitId}` }
    });
    revalidatePath("/schedule");
    revalidatePath("/");
  } catch (e: any) {
    console.error("Approve Manual Visit Error:", e.message);
  }
}

export async function rejectManualVisitAction(visitId: number, reason: string) {
  try {
    await p.visit.update({
      where: { id: visitId },
      data: { adminApproval: "REJECTED", rejectionReason: reason, status: "MISSED" }
    });
    await p.log.create({
      data: { action: "REJECT_MANUAL_VISIT", details: `تم رفض زيارة يدوية رقم ${visitId}: ${reason}` }
    });
    revalidatePath("/schedule");
    revalidatePath("/");
  } catch (e: any) {
    console.error("Reject Manual Visit Error:", e.message);
  }
}

export async function editVisitAction(visitId: number, data: { schoolId?: number, supervisorId?: number, date?: string }) {
  try {
    const updateData: any = {};
    if (data.schoolId) updateData.schoolId = data.schoolId;
    if (data.supervisorId) updateData.supervisorId = data.supervisorId;
    if (data.date) {
      const newDate = new Date(data.date);
      if (isNaN(newDate.getTime())) throw new Error("التاريخ غير صالح");
      updateData.date = newDate;
      updateData.dayOfWeek = dayNames[newDate.getDay()];
    }

    const visit = await p.visit.findUnique({ where: { id: visitId } });
    if (!visit) return { error: "الزيارة غير موجودة" };

    await p.visit.update({
      where: { id: visitId },
      data: updateData
    });

    await p.log.create({
      data: { action: "EDIT_VISIT", details: `تم تعديل الزيارة رقم ${visitId}` }
    });

    revalidatePath("/schedule");
    revalidatePath("/my-schedule");
    revalidatePath("/reports");
    revalidatePath("/");
    return { success: true };
  } catch (e: any) {
    console.error("Edit Visit Action Error:", e.message);
    return { error: e.message || "حدث خطأ غير متوقع" };
  }
}

export async function approveExcuseAction(reportId: number) {
  try {
    const report = await p.visitReport.update({
      where: { id: reportId },
      data: { excuseStatus: "APPROVED" }
    });
    // Ensure visit status is EXCUSED
    await p.visit.update({
      where: { id: report.visitId },
      data: { status: "EXCUSED" }
    });
    await p.log.create({
      data: { action: "APPROVE_EXCUSE", details: `تمت الموافقة على اعتذار الموجه رقم ${report.supervisorId}` }
    });
    revalidatePath("/reports");
    revalidatePath("/schedule");
  } catch (e: any) {
    console.error("Approve Excuse Error:", e.message);
  }
}

export async function rejectExcuseAction(reportId: number) {
  try {
    const report = await p.visitReport.update({
      where: { id: reportId },
      data: { excuseStatus: "REJECTED" }
    });
    // If rejected, maybe it should revert to MISSED or PENDING? 
    // Usually rejected means they didn't have a valid reason, so MISSED is appropriate.
    await p.visit.update({
      where: { id: report.visitId },
      data: { status: "MISSED" }
    });
    await p.log.create({
      data: { action: "REJECT_EXCUSE", details: `تم رفض اعتذار الموجه رقم ${report.supervisorId}` }
    });
    revalidatePath("/reports");
    revalidatePath("/schedule");
  } catch (e: any) {
    console.error("Reject Excuse Error:", e.message);
  }
}

export async function adminAddManualVisitAction(formData: FormData) {
  try {
    const schoolId = parseInt(formData.get("schoolId") as string);
    const supervisorId = parseInt(formData.get("supervisorId") as string);
    const dateStr = formData.get("date") as string;
    const force = formData.get("force") === "true";
    
    const date = new Date(dateStr);
    const dayOfWeek = dayNames[date.getDay()];

    if (!force) {
       const existing = await p.visit.findFirst({
         where: { schoolId, date: { gte: new Date(date.setHours(0,0,0,0)), lt: new Date(date.setHours(23,59,59,999)) } }
       });
       if (existing) return { error: "DUPLICATE", message: "يوجد زيارة أخرى لهذه المدرسة في هذا التاريخ بالفعل." };
    }

    await p.visit.create({
      data: {
        schoolId,
        supervisorId,
        date,
        dayOfWeek,
        status: "PENDING",
        isManual: true,
        adminApproval: "APPROVED"
      }
    });

    revalidatePath("/schedule");
    revalidatePath("/my-schedule");
    revalidatePath("/");
    return { success: true };
  } catch (e: any) {
    console.error("Admin Add Manual Visit Error:", e.message);
    return { error: "ERROR", message: e.message };
  }
}

export async function checkDuplicateVisitAction(schoolId: number, dateStr: string, excludeId?: number) {
  try {
    const date = new Date(dateStr);
    const existing = await p.visit.findFirst({
      where: { 
        schoolId, 
        date: { gte: new Date(date.setHours(0,0,0,0)), lt: new Date(date.setHours(23,59,59,999)) },
        id: excludeId ? { not: excludeId } : undefined
      }
    });
    return !!existing;
  } catch (e) {
    return false;
  }
}

export async function deleteVisitAction(visitId: number) {
  try {
    await p.visit.delete({
      where: { id: visitId }
    });
    
    await p.log.create({
      data: { action: "DELETE_VISIT", details: `تم حذف الزيارة رقم ${visitId}` }
    });

    revalidatePath("/schedule");
    revalidatePath("/my-schedule");
    revalidatePath("/");
    return { success: true };
  } catch (e: any) {
    console.error("Delete Visit Error:", e.message);
    return { error: e.message || "حدث خطأ أثناء الحذف" };
  }
}

export async function bulkDeleteVisitsAction(visitIds: number[]) {
  try {
    const deleted = await p.visit.deleteMany({
      where: { id: { in: (visitIds as any).map((id: any) => parseInt(id)) } }
    });
    
    await p.log.create({
      data: { action: "BULK_DELETE_VISITS", details: `تم حذف ${deleted.count} زيارة بشكل جماعي.` }
    });

    revalidatePath("/schedule");
    revalidatePath("/my-schedule");
    revalidatePath("/");
    return { success: true, count: deleted.count };
  } catch (e: any) {
    console.error("Bulk Delete Visits Error:", e.message);
    return { error: e.message || "حدث خطأ أثناء الحذف الجماعي" };
  }
}





