export default function SettingsPage() {
  return (
    <div>
      <h1 style={{ marginBottom: "2rem", color: "var(--primary-deep-blue)" }}>إعدادات النظام المشتركة</h1>
      
      <div className="card" style={{ maxWidth: "600px" }}>
        <h2 style={{ marginBottom: "1.5rem", color: "var(--secondary-dark-navy)", fontSize: "1.2rem" }}>إعدادات توزيع الخوارزمية (النسخة الاحترافية)</h2>
        
        <form style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>الحد الأقصى لزيارات الموجه في اليوم:</label>
            <input type="number" defaultValue={2} style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--border-dark)" }} disabled />
            <small style={{ color: "var(--border-dark)", marginTop: "0.25rem", display: "block" }}>*هذه الميزة مغلقة في النسخة الحالية لتوزيع تلقائي متوازن*</small>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>أيام العمل المستبعدة:</label>
            <div style={{ display: "flex", gap: "1rem" }}>
              <label><input type="checkbox" defaultChecked disabled /> الجمعة</label>
              <label><input type="checkbox" defaultChecked disabled /> السبت</label>
            </div>
            <small style={{ color: "var(--border-dark)", marginTop: "0.25rem", display: "block" }}>*الجمعة والسبت مستبعدان مسبقاً من الخوارزمية*</small>
          </div>

          <div style={{ marginTop: "1rem" }}>
            <button type="button" className="btn-primary" disabled style={{ background: "var(--border-dark)" }}>حفظ الإعدادات</button>
          </div>
        </form>
      </div>
    </div>
  );
}
