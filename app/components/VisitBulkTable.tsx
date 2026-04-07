"use client";

import React, { useState } from "react";
import { bulkDeleteVisitsAction, updateVisitStatusAction } from "../schedule/actions";
import { useRouter } from "next/navigation";
import ViewReportModal from "./ViewReportModal";
import VisitAdminActions from "./VisitAdminActions";

interface VisitBulkTableProps {
  visits: any[];
  allSchools: any[];
  allSupervisors: any[];
}

export default function VisitBulkTable({ visits, allSchools, allSupervisors }: VisitBulkTableProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const router = useRouter();

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === visits.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(visits.map(v => v.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`هل أنت متأكد من حذف ${selectedIds.length} زيارة مختارة؟ لا يمكن التراجع عن هذه الخطوة.`)) {
      return;
    }
    
    const result = await bulkDeleteVisitsAction(selectedIds);
    if (result.success) {
      setSelectedIds([]);
      router.refresh();
    } else {
      alert("حدث خطأ أثناء الحذف الجماعي: " + result.error);
    }
  };

  return (
    <div className="table-container" style={{ position: "relative" }}>
      {selectedIds.length > 0 && (
        <div style={{
          position: "sticky",
          top: "0",
          zIndex: 10,
          background: "#fff",
          padding: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
          borderRadius: "8px",
          marginBottom: "1rem",
          border: "1px solid var(--primary-deep-blue)"
        }}>
          <div style={{ fontWeight: "bold", color: "var(--primary-deep-blue)" }}>
            تم اختيار {selectedIds.length} زيارة
          </div>
          <button 
            onClick={handleBulkDelete}
            className="btn-primary" 
            style={{ background: "var(--danger)", color: "white", padding: "0.5rem 1.5rem" }}
          >
            🗑️ حذف المختار
          </button>
        </div>
      )}

      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid var(--border)", backgroundColor: "var(--surface)" }}>
            <th style={{ padding: "1rem" }}>
              <input 
                type="checkbox" 
                onChange={toggleSelectAll} 
                checked={visits.length > 0 && selectedIds.length === visits.length}
                style={{ cursor: "pointer", width: "18px", height: "18px" }}
              />
            </th>
            <th style={{ padding: "1rem" }}>#</th>
            <th style={{ padding: "1rem" }}>التاريخ</th>
            <th style={{ padding: "1rem" }}>اليوم</th>
            <th style={{ padding: "1rem" }}>المدرسة</th>
            <th style={{ padding: "1rem" }}>الموجه</th>
            <th style={{ padding: "1rem" }}>الحالة</th>
            <th style={{ padding: "1rem" }}>تحديث الحالة</th>
          </tr>
        </thead>
        <tbody>
          {visits.map((visit: any, i: number) => (
            <tr
              key={visit.id}
              style={{ 
                borderBottom: "1px solid var(--border-light)",
                backgroundColor: selectedIds.includes(visit.id) ? "#f0f7ff" : "transparent",
                transition: "background-color 0.2s"
              }}
            >
              <td style={{ padding: "1rem" }}>
                <input 
                  type="checkbox" 
                  checked={selectedIds.includes(visit.id)}
                  onChange={() => toggleSelect(visit.id)}
                  style={{ cursor: "pointer", width: "18px", height: "18px" }}
                />
              </td>
              <td style={{ padding: "1rem" }}>{i + 1}</td>
              <td style={{ padding: "1rem", fontWeight: "bold" }}>
                {new Date(visit.date).toLocaleDateString("ar-EG")}
              </td>
              <td style={{ padding: "1rem" }}>{visit.dayOfWeek}</td>
              <td style={{ padding: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ color: "var(--primary-deep-blue)", fontWeight: "bold" }}>{visit.school.name}</span>
                  {visit.school.googleMapsUrl && (
                    <a 
                      href={visit.school.googleMapsUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      title="عرض الموقع على الخريطة"
                      style={{ textDecoration: "none", fontSize: "1.1rem" }}
                    >
                      📍
                    </a>
                  )}
                </div>
              </td>
              <td style={{ padding: "1rem" }}>
                {visit.supervisor.name}
              </td>
              <td style={{ padding: "1rem" }}>
                <span
                  style={{
                    background: visit.status === "COMPLETED" ? "var(--success)" : visit.status === "MISSED" ? "var(--danger)" : "var(--accent-gold)",
                    color: visit.status === "PENDING" ? "var(--primary-deep-blue)" : "white",
                    padding: "0.25rem 0.75rem",
                    borderRadius: "15px",
                    fontSize: "0.85em",
                    fontWeight: "bold"
                  }}
                >
                  {visit.status === "PENDING" ? "معلقة" : visit.status === "COMPLETED" ? "مكتملة" : "ملغية"}
                </span>
                {visit.isManual && (
                  <div style={{ marginTop: "5.4px" }}>
                    <span style={{ fontSize: "0.7rem", padding: "2px 6px", borderRadius: "10px", background: visit.adminApproval === "PENDING" ? "#fef3c7" : visit.adminApproval === "APPROVED" ? "#dcfce7" : "#fee2e2", color: visit.adminApproval === "PENDING" ? "#92400e" : visit.adminApproval === "APPROVED" ? "#166534" : "#991b1b", border: "1px solid currentColor" }}>
                       {visit.adminApproval === "PENDING" ? "طلب يدوي - قيد الانتظار" : visit.adminApproval === "APPROVED" ? "طلب يدوي - مقبول" : "طلب يدوي - مرفوض"}
                    </span>
                  </div>
                )}
                {visit.checkInLat && visit.checkInLng && (
                  <div style={{ marginTop: "0.5rem" }}>
                    <a href={`https://maps.google.com/?q=${visit.checkInLat},${visit.checkInLng}`} target="_blank" style={{ fontSize: "0.75rem", color: "var(--primary-deep-blue)", fontWeight: "bold", textDecoration: "none", background: "#eef2f5", padding: "4px 8px", borderRadius: "12px", border: "1px solid var(--border)" }}>
                      📍 موقع الحضور
                    </a>
                  </div>
                )}
              </td>
              <td style={{ padding: "1rem" }}>
                {(visit.status === "COMPLETED" || visit.status === "EXCUSED") ? (
                  <ViewReportModal 
                     reportText={visit.report?.reportText} 
                     isExcuse={visit.report?.isExcuse}
                     excuseReason={visit.report?.excuseReason}
                     supervisorName={visit.supervisor.name}
                     schoolName={visit.school.name}
                     date={new Date(visit.date).toLocaleDateString("ar-EG")}
                  />
                ) : visit.status === "PENDING" && (
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                     <VisitAdminActions 
                        visit={visit} 
                        schools={allSchools} 
                        supervisors={allSupervisors} 
                     />
                     
                     <button 
                        onClick={async () => { 
                          await updateVisitStatusAction(visit.id, "COMPLETED"); 
                          router.refresh(); 
                        }}
                        style={{ padding: "0.4rem 0.8rem", background: "var(--success)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontFamily: "inherit", fontSize: "0.8rem" }}
                     >
                       إنجاز
                     </button>
                     <button 
                        onClick={async () => { 
                          await updateVisitStatusAction(visit.id, "MISSED"); 
                          router.refresh(); 
                        }}
                        style={{ padding: "0.4rem 0.8rem", background: "var(--danger)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontFamily: "inherit", fontSize: "0.8rem" }}
                     >
                       إلغاء
                     </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
