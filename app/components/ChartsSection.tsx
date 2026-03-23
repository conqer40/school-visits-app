"use client";

import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from "recharts";

interface AnalyticsData {
  supervisorVisits: { name: string; completed: number; pending: number; excused: number }[];
  statusBreakdown: { name: string; value: number; color: string }[];
  dailyData: { date: string; reports: number; excuses: number }[];
  specializationData: { name: string; count: number }[];
}

export default function ChartsSection() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"status" | "supervisors" | "daily" | "specs">("status");

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", opacity: 0.6 }}>
        ⏳ جاري تحميل الإحصاءات...
      </div>
    );
  }

  if (!data) return null;

  const tabs = [
    { key: "status", label: "📊 توزيع الزيارات" },
    { key: "supervisors", label: "👥 أداء الموجهين" },
    { key: "daily", label: "📈 النشاط اليومي" },
    { key: "specs", label: "📚 التخصصات" },
  ] as const;

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2 style={{ color: "var(--primary-deep-blue)", marginBottom: "1.5rem", fontSize: "1.3rem" }}>
        📊 تحليلات بصرية
      </h2>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: "bold",
              fontSize: "0.85rem",
              transition: "all 0.2s",
              background: activeTab === tab.key ? "var(--primary-deep-blue)" : "var(--surface)",
              color: activeTab === tab.key ? "white" : "var(--text-dark)",
              boxShadow: activeTab === tab.key ? "0 4px 12px rgba(10,38,71,0.3)" : "none",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: "1.5rem" }}>
        {/* Status Pie Chart */}
        {activeTab === "status" && (
          <div>
            <h3 style={{ marginBottom: "1rem", color: "#555" }}>توزيع حالات الزيارات</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.statusBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {data.statusBreakdown.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Supervisor Bar Chart */}
        {activeTab === "supervisors" && (
          <div>
            <h3 style={{ marginBottom: "1rem", color: "#555" }}>أداء الموجهين (أعلى 10)</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data.supervisorVisits} margin={{ top: 5, right: 10, bottom: 60, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" interval={0} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" name="منجزة" fill="#22c55e" />
                <Bar dataKey="pending" name="معلقة" fill="#f59e0b" />
                <Bar dataKey="excused" name="باعتذار" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Daily Line Chart */}
        {activeTab === "daily" && (
          <div>
            <h3 style={{ marginBottom: "1rem", color: "#555" }}>النشاط اليومي (آخر 14 يوم)</h3>
            {data.dailyData.length === 0 ? (
              <p style={{ textAlign: "center", color: "#999", padding: "2rem" }}>لا توجد بيانات كافية</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="reports" name="تقارير" stroke="#0a2647" strokeWidth={2} dot={true} />
                  <Line type="monotone" dataKey="excuses" name="اعتذارات" stroke="#ef4444" strokeWidth={2} dot={true} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {/* Specializations Bar */}
        {activeTab === "specs" && (
          <div>
            <h3 style={{ marginBottom: "1rem", color: "#555" }}>توزيع الموجهين على التخصصات</h3>
            {data.specializationData.length === 0 ? (
              <p style={{ textAlign: "center", color: "#999", padding: "2rem" }}>لا توجد تخصصات</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.specializationData} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="count" name="عدد الموجهين" fill="#0a2647" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
