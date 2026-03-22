import Link from "next/link";
import { egyptDate } from "@/lib/auth";

export default function LandingPage() {
  return (
    <div dir="rtl" style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, var(--secondary-dark-navy) 0%, var(--primary-deep-blue) 100%)",
      color: "white",
      fontFamily: "inherit",
      display: "flex",
      flexDirection: "column"
    }}>
      {/* Navbar */}
      <nav style={{
        padding: "1.5rem 5%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "rgba(0,0,0,0.1)",
        backdropFilter: "blur(10px)",
        position: "sticky",
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: "40px", height: "40px", background: "var(--accent-gold)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: "bold", color: "var(--primary-deep-blue)" }}>
            W
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.1rem", color: "var(--accent-gold)" }}>إدارة غرب الزقازيق التعليمية</h1>
            <p style={{ margin: 0, fontSize: "0.75rem", opacity: 0.8 }}>نظام الزيارات المدرسية الذكي</p>
          </div>
        </div>
        <Link href="/login" className="btn-primary" style={{ textDecoration: "none", background: "var(--accent-gold)", color: "var(--primary-deep-blue)", fontWeight: "bold" }}>
          تسجيل الدخول
        </Link>
      </nav>

      {/* Hero Section */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "4rem 5%" }}>
        <h2 style={{ fontSize: "3rem", marginBottom: "1.5rem", fontWeight: "900", lineHeight: "1.2" }}>
          مرحباً بكم في منصة إدارة <span style={{ color: "var(--accent-gold)" }}>الزيارات الذكية</span>
        </h2>
        <p style={{ fontSize: "1.2rem", maxWidth: "800px", lineHeight: "1.8", opacity: 0.9, marginBottom: "3rem" }}>
          النظام الأول من نوعه لإدارة وتوزيع زيارات الموجهين على مدارس إدارة غرب الزقازيق التعليمية بشكل آلي وعادل، 
          مما يضمن تغطية كاملة وشاملة لجميع المؤسسات التعليمية تحت إشراف وكيل الإدارة.
        </p>

        <div style={{ display: "flex", gap: "1.5rem" }}>
          <Link href="/login" className="hero-btn">
            ابدأ الاستخدام الآن
          </Link>
        </div>

        {/* Features Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "2rem",
          width: "100%",
          maxWidth: "1100px",
          marginTop: "5rem"
        }}>
          <div style={{ background: "rgba(255,255,255,0.05)", padding: "2rem", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.1)", textAlign: "right" }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⚡</div>
            <h3 style={{ color: "var(--accent-gold)", marginBottom: "0.5rem" }}>توزيع ذكي وآلي</h3>
            <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.7)" }}>خوارزمية متطورة توزع 65 موجهاً على 130 مدرسة شهرياً دون تكرار أو ظلم، مع مراعاة أولويات الزيارة.</p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.05)", padding: "2rem", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.1)", textAlign: "right" }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>📱</div>
            <h3 style={{ color: "var(--accent-gold)", marginBottom: "0.5rem" }}>مركز متابعة الواتساب</h3>
            <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.7)" }}>إرسال الجداول والحسابات والتنبيهات اليومية بضغطة زر واحدة لضمان التواصل اللحظي مع الميدان.</p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.05)", padding: "2rem", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.1)", textAlign: "right" }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>📈</div>
            <h3 style={{ color: "var(--accent-gold)", marginBottom: "0.5rem" }}>تقارير وتحليلات</h3>
            <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.7)" }}>نظام تقارير يومي وأسبوعي وشهري مفصل وقابل للطباعة، يعطي رؤية كاملة لوكيل الإدارة عن سير العمل.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: "2rem 5%",
        textAlign: "center",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(0,0,0,0.2)"
      }}>
        <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.8 }}>
          تنفيذ وإشراف: الأستاذ محمد العسيلى — وكيل إدارة غرب الزقازيق التعليمية
        </p>
        <p style={{ margin: "0.5rem 0 0", fontSize: "0.75rem", opacity: 0.5 }}>
          تم تطوير النظام لضمان التميز الإداري والعدالة في توزيع المهام الميدانية.
        </p>
        <p style={{ marginTop: "1rem", fontSize: "0.8rem", color: "var(--accent-gold)" }}>
          {egyptDate(new Date())}
        </p>
      </footer>
    </div>
  );
}
