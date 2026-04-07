import { prisma } from "@/lib/prisma";
import { generateScheduleAction } from "./actions";
import Link from "next/link";
import AdminManualVisitForm from "@/app/components/AdminManualVisitForm";
import VisitBulkTable from "@/app/components/VisitBulkTable";
import ClearPendingScheduleForm from "@/app/components/ClearPendingScheduleForm";
import SearchableSelect from "@/app/components/SearchableSelect";

export const dynamic = "force-dynamic";

export default async function SchedulePage({ searchParams }: { searchParams: Promise<{ day?: string, school?: string, supervisor?: string, exactDate?: string }> }) {
  const { day, school, supervisor, exactDate } = await searchParams;

  const whereClause: any = {};
  if (day) whereClause.dayOfWeek = day;
  if (school) whereClause.school = { name: { contains: school } };
  if (supervisor) whereClause.supervisorId = parseInt(supervisor);
  
  if (exactDate) {
    const [year, month, dayNum] = exactDate.split("-").map(Number);
    // Create local timezone bounds covering the whole selected local day
    const localDateStart = new Date(year, month - 1, dayNum);
    const localDateEnd = new Date(year, month - 1, dayNum + 1);
    whereClause.date = { gte: localDateStart, lt: localDateEnd };
  }

  const visits = await prisma.visit.findMany({
    where: whereClause,
    include: {
      school: true,
      supervisor: true,
      report: true
    },
    orderBy: { date: "asc" },
  });

  const serializedVisits = JSON.parse(JSON.stringify(visits));

  const allSchools = await prisma.school.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" } });
  const allSupervisors = await prisma.supervisor.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });

  const serializedSchools = JSON.parse(JSON.stringify(allSchools));
  const serializedSupervisors = JSON.parse(JSON.stringify(allSupervisors));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
        <h1 style={{ color: "var(--primary-deep-blue)", margin: 0 }}>📅 الجدول الشهري المعتمد</h1>
        
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <ClearPendingScheduleForm />
          
          <form action={generateScheduleAction}>
            <button type="submit" className="btn-primary">
              توليد جدول ذكي للشهر
            </button>
          </form>
        </div>
      </div>

      <AdminManualVisitForm 
        schools={serializedSchools} 
        supervisors={serializedSupervisors} 
      />

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ marginTop: 0, marginBottom: "1rem", color: "var(--primary-deep-blue)", fontSize: "1rem" }}>🔍 تصفية الجدول</h3>
        <form style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          <input type="date" name="exactDate" defaultValue={exactDate || ""} style={{ padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--border)", fontFamily: "inherit" }} title="اختر تاريخ محدد" />
          <select name="day" defaultValue={day || ""} style={{ padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--border)", fontFamily: "inherit" }}>
            <option value="">كل الأيام</option>
            {["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <SearchableSelect
            name="school"
            defaultValue={school || ""}
            placeholder="كل المدارس"
            options={[{ value: "", label: "كل المدارس" }, ...serializedSchools.map((s: any) => ({ value: s.name, label: s.name }))]}
            style={{ flex: 1, minWidth: "140px", padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--border)" }}
          />
          <SearchableSelect
            name="supervisor"
            defaultValue={supervisor || ""}
            placeholder="كل الموجهين"
            options={[{ value: "", label: "كل الموجهين" }, ...serializedSupervisors.map((sup: any) => ({ value: String(sup.id), label: sup.name }))]}
            style={{ flex: 1, minWidth: "140px", padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--border)" }}
          />
          <button type="submit" className="btn-primary" style={{ padding: "0.6rem 1.2rem" }}>بحث</button>
          <Link href="/schedule" style={{ padding: "0.6rem 1rem", textDecoration: "none", color: "#666", border: "1px solid #ccc", borderRadius: "6px", background: "#f5f5f5" }}>
            مسح الفلاتر
          </Link>
        </form>
      </div>

      {serializedVisits.length === 0 ? (
        <div className="card" style={{ padding: "3rem", textAlign: "center", color: "var(--border-dark)" }}>
          {(!day && !school && !supervisor && !exactDate) ? (
            <>
              <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>الجدول فارغ</p>
              <p>اضغط على "توليد جدول ذكي" لتوزيع المدارس على الموجهين تلقائياً</p>
            </>
          ) : (
            <p style={{ fontWeight: "bold", color: "var(--danger)" }}>لا توجد زيارات مطابقة للبحث!</p>
          )}
        </div>
      ) : (
        <VisitBulkTable 
          visits={serializedVisits} 
          allSchools={serializedSchools} 
          allSupervisors={serializedSupervisors} 
        />
      )}
    </div>
  );
}
