"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const p = prisma as any;

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

const dayNames = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

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

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

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
    for (const sup of supervisors) {
      const supLevels = (sup.levels || "").split(",").filter(Boolean);
      const supTypes = (sup.types || "").split(",").filter(Boolean);
      
      const compSchools = [];
      for (const school of schools) {
        const schLevels = (school.levels || "").split(",").filter(Boolean);
        const schTypes = (school.types || "").split(",").filter(Boolean);

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
          details: `تم إنشاء ${newVisits.length} زيارة ذكية بشروط المرحلة، النوع وأيام عمل المدرسة`,
        },
      });
    } else {
      await p.log.create({
        data: { action: "GENERATE_SCHEDULE", details: "لم يتم العثور على زيارات صالحة للجدولة (الجدول ممتلئ أو لا يوجد توافق)" },
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
  } catch (e) {}
}

export async function clearPendingScheduleAction() {
  try {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    await p.visit.deleteMany({
      where: { status: "PENDING", date: { gte: firstDay, lte: lastDay } },
    });
    await p.log.create({
      data: { action: "CLEAR_SCHEDULE", details: "تم مسح جدول الزيارات المعلقة للشهر الحالي" },
    });
    revalidatePath("/schedule");
    revalidatePath("/");
  } catch (e: any) {}
}

