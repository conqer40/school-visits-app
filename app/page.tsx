import Link from "next/link";
import { egyptDate } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const [supervisorsCount, schoolsCount, visitsCount] = await Promise.all([
    (prisma as any).supervisor.count({ where: { isActive: true } }),
    (prisma as any).school.count({ where: { status: "ACTIVE" } }),
    (prisma as any).visit.count(),
  ]);

  return (
    <div dir="rtl" style={{
      minHeight: "100vh",
      background: "var(--background-light)",
      color: "var(--foreground)",
      fontFamily: "var(--font-cairo)",
      display: "flex",
      flexDirection: "column",
      overflowX: "hidden"
    }}>
      {/* Dynamic Background Elements */}
      <div style={{ position: "fixed", top: "-10%", right: "-5%", width: "40vw", height: "40vw", background: "radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)", borderRadius: "50%", zIndex: 0 }}></div>
      <div style={{ position: "fixed", bottom: "-10%", left: "-5%", width: "50vw", height: "50vw", background: "radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)", borderRadius: "50%", zIndex: 0 }}></div>

      {/* Navbar */}
      <nav style={{
        padding: "1rem 5%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "rgba(255,255,255,0.8)",
        backdropFilter: "var(--glass-blur)",
        WebkitBackdropFilter: "var(--glass-blur)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        borderBottom: "1px solid rgba(0,0,0,0.05)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.02)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", zIndex: 1 }}>
          <div style={{ width: "45px", height: "45px", background: "linear-gradient(135deg, var(--accent-gold), #fcd34d)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", fontWeight: "900", color: "var(--primary-deep-blue)", boxShadow: "0 4px 10px rgba(245, 158, 11, 0.3)" }}>
            W
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.2rem", color: "var(--primary-deep-blue)", fontWeight: "900", letterSpacing: "0.5px" }}>إدارة غرب الزقازيق</h1>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--accent-primary)", fontWeight: "600" }}>نظام الزيارات المدرسية الذكي</p>
          </div>
        </div>
        <Link href="/login" className="btn-primary" style={{ position: "relative", zIndex: 1, padding: "0.7rem 1.8rem", borderRadius: "20px", fontSize: "0.95rem" }}>
          تسجيل الدخول <span style={{ fontSize: "1.1rem" }}>👤</span>
        </Link>
      </nav>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1 }}>
        
        {/* Hero Section */}
        <section className="animate-fade-in" style={{ padding: "6rem 5% 4rem", textAlign: "center", maxWidth: "1000px" }}>
          <div style={{ display: "inline-block", padding: "0.5rem 1.2rem", background: "rgba(37,99,235,0.1)", color: "var(--accent-primary)", borderRadius: "30px", fontSize: "0.9rem", fontWeight: "800", marginBottom: "1.5rem", border: "1px solid rgba(37,99,235,0.2)" }}>
            ✨ الإصدار المطور 2.0 (Premium Edition)
          </div>
          <h2 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", marginBottom: "1.5rem", fontWeight: "900", lineHeight: "1.3", color: "var(--primary-deep-blue)" }}>
            مستقبل الإدارة المدرسية <br/>
            <span style={{ background: "linear-gradient(135deg, var(--accent-primary), var(--accent-cyan))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>يبدأ من هنا</span>
          </h2>
          <p style={{ fontSize: "1.15rem", lineHeight: "1.8", color: "var(--secondary-dark-navy)", opacity: 0.8, marginBottom: "3rem", margin: "0 auto 3rem", maxWidth: "800px" }}>
            النظام الرقمي الأول من نوعه لإدارة وتوزيع زيارات الموجهين آلياً، بناء مجتمعات مهنية متخصصة، 
            وإصدار تقارير تحليلية دقيقة تضمن التغطية الشاملة لجميع المؤسسات التعليمية تحت إشراف وكيل الإدارة.
          </p>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/login" className="btn-primary" style={{ padding: "1rem 2.5rem", fontSize: "1.1rem", borderRadius: "30px", boxShadow: "0 8px 20px rgba(37,99,235,0.3)" }}>
              البدء الآن 🚀
            </Link>
            <a href="#features" className="btn-secondary" style={{ padding: "1rem 2.5rem", fontSize: "1.1rem", borderRadius: "30px", background: "white" }}>
              اكتشف المميزات 🔍
            </a>
          </div>
        </section>

        {/* Live Statistics */}
        <section style={{ width: "100%", padding: "2rem 5%", background: "linear-gradient(180deg, transparent, rgba(37,99,235,0.03))" }}>
          <div className="grid-responsive" style={{ maxWidth: "1100px", margin: "0 auto", gap: "2rem", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
            {[
              { label: "مدرسة مسجلة", count: schoolsCount, icon: "🏫", color: "var(--accent-primary)" },
              { label: "موجه نشط", count: supervisorsCount, icon: "👥", color: "var(--accent-gold)" },
              { label: "زيارة موثقة", count: visitsCount, icon: "📝", color: "var(--success)" },
            ].map((stat, i) => (
              <div key={i} className="card" style={{ textAlign: "center", padding: "2rem 1.5rem", borderTop: `4px solid ${stat.color}` }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{stat.icon}</div>
                <h3 style={{ fontSize: "2.5rem", fontWeight: "900", color: "var(--primary-deep-blue)", margin: "0.5rem 0" }}>+{stat.count}</h3>
                <p style={{ color: "gray", fontWeight: "bold", fontSize: "1rem", margin: 0 }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" style={{ width: "100%", padding: "5rem 5%", maxWidth: "1200px" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{ fontSize: "2.5rem", fontWeight: "900", color: "var(--primary-deep-blue)", marginBottom: "1rem" }}>لماذا نظام الزيارات الذكي؟</h2>
            <div style={{ width: "80px", height: "4px", background: "var(--accent-gold)", margin: "0 auto", borderRadius: "2px" }}></div>
          </div>

          <div className="grid-responsive" style={{ gap: "2rem" }}>
            {[
              { icon: "⚡", title: "توزيع ذكي وعادل", desc: "خوارزمية متطورة توزع الموجهين على المدارس شهرياً دون تكرار مع الموازنة التامة للأعباء ومراعاة الأولويات." },
              { icon: "🤝", title: "مجتمع الموجهين", desc: "منصة تواصل داخلية (تشبه الشبكات الاجتماعية) تتيح للموجهين تبادل الخبرات، نشر التعاميم، والمناقشة حسب التخصص." },
              { icon: "📱", title: "تنبيهات الواتساب", desc: "إرسال آلي للجداول، حسابات الدخول، وتنبيهات الزيارات اليومية وتأخيرات المدارس عبر رسائل الواتساب." },
              { icon: "📊", title: "تقارير وتحليلات استراتيجية", desc: "لوحة تحكم كاملة لقياس أداء الموجهين، نسب تغطية المدارس، وإصدار تقارير مجمعة قابلة للطباعة الرسمية بنقرة زر." },
            ].map((feature, i) => (
              <div key={i} className="card" style={{ padding: "2rem", transition: "all 0.3s" }}>
                <div style={{ width: "60px", height: "60px", background: "rgba(37,99,235,0.08)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", marginBottom: "1.5rem" }}>
                  {feature.icon}
                </div>
                <h3 style={{ color: "var(--secondary-dark-navy)", marginBottom: "1rem", fontSize: "1.3rem", fontWeight: "800" }}>{feature.title}</h3>
                <p style={{ fontSize: "1rem", color: "gray", lineHeight: "1.7" }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer style={{
        marginTop: "auto",
        padding: "3rem 5% 2rem",
        background: "var(--primary-deep-blue)",
        color: "white",
        textAlign: "center",
        zIndex: 1
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ width: "50px", height: "50px", background: "var(--accent-gold)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: "900", color: "var(--primary-deep-blue)", margin: "0 auto 1.5rem" }}>
            W
          </div>
          <p style={{ margin: "0 0 1rem", fontSize: "1.1rem", fontWeight: "700" }}>
            إدارة غرب الزقازيق التعليمية — وزارة التربية والتعليم
          </p>
          <p style={{ margin: "0 0 1.5rem", fontSize: "0.9rem", color: "rgba(255,255,255,0.6)", lineHeight: "1.6" }}>
            تنفيذ وإشراف: الأستاذ محمد العسيلى - وكيل الإدارة<br/>
            نظام متكامل لضمان التميز الإداري والعدالة في التوزيع، ولتوفير أداة قوية لمتابعة العملية التعليمية.
          </p>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", margin: "2rem auto 1.5rem", width: "50%" }}></div>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--accent-gold)" }}>
            {egyptDate(new Date())} © جميع الحقوق محفوظة
          </p>
        </div>
      </footer>
    </div>
  );
}

