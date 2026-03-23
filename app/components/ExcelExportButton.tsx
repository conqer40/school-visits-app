"use client";

interface ExcelExportButtonProps {
  type: "reports" | "schools" | "supervisors";
  label?: string;
}

export default function ExcelExportButton({ type, label }: ExcelExportButtonProps) {
  const labels: Record<string, string> = {
    reports: "تصدير التقارير Excel",
    schools: "تصدير المدارس Excel",
    supervisors: "تصدير الموجهين Excel",
  };

  const handleDownload = () => {
    const url = `/api/export-excel?type=${type}`;
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}_export.xlsx`;
    a.click();
  };

  return (
    <button
      onClick={handleDownload}
      style={{
        background: "#217346",
        color: "white",
        border: "none",
        padding: "0.6rem 1.2rem",
        borderRadius: "8px",
        cursor: "pointer",
        fontFamily: "inherit",
        fontWeight: "bold",
        fontSize: "0.9rem",
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        transition: "background 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#1a5c38")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "#217346")}
      title={labels[type]}
    >
      📊 {label || labels[type]}
    </button>
  );
}
