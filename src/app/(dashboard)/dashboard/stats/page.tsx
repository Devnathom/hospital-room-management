"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toBEYear, toCEYear, getAcademicYearOptions } from "@/lib/thai-date";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16", "#F97316"];
const monthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

export default function StatsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("year");
  // Store as CE year internally, display as BE
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const beYear = toBEYear(parseInt(year));

  const fetchStats = async () => {
    setLoading(true);
    const res = await fetch(`/api/stats?period=${period}&year=${year}&month=${month}`);
    const data = await res.json();
    if (data.success) setStats(data.data);
    setLoading(false);
  };

  useEffect(() => { fetchStats(); }, [period, year, month]);

  if (loading || !stats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  // Super admin sees only summary
  if (user?.role === "super_admin") {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-dark dark:text-white">สถิติภาพรวมระบบ</h1>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatBox label="โรงเรียนทั้งหมด" value={stats.totalSchools} />
          <StatBox label="ผู้ใช้ทั้งหมด" value={stats.totalUsers} />
          <StatBox label="การเข้าห้องพยาบาลทั้งหมด" value={stats.totalVisits} />
          <StatBox label="รอการอนุมัติ" value={stats.pendingSchools} />
        </div>
      </div>
    );
  }

  const visitChartData = (stats.visitsByPeriod || []).map((d: any) => ({
    name: period === "year" ? monthNames[d.label - 1] || d.label : `${d.label}`,
    จำนวน: d.count,
  }));

  const symptomChartData = (stats.symptomStats || []).map((d: any) => ({
    name: d.name || "ไม่ระบุ",
    value: d.count,
  }));

  const statusChartData = (stats.statusStats || []).map((d: any) => {
    const labels: Record<string, string> = { in_room: "อยู่ในห้อง", treated: "รักษาแล้ว", referred: "ส่งต่อ", sent_home: "ส่งกลับบ้าน" };
    return { name: labels[d.status] || d.status, value: d.count };
  });

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-dark dark:text-white">สถิติและรายงาน</h1>
        <div className="flex flex-wrap gap-2">
          {[
            { value: "day", label: "วันนี้" },
            { value: "month", label: "รายเดือน" },
            { value: "year", label: "รายปี" },
          ].map((p) => (
            <button key={p.value} onClick={() => setPeriod(p.value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${period === p.value ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"}`}>
              {p.label}
            </button>
          ))}
          {period !== "day" && (
            <select value={year} onChange={(e) => setYear(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white">
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>พ.ศ. {toBEYear(y)}</option>
              ))}
            </select>
          )}
          {period === "month" && (
            <select value={month} onChange={(e) => setMonth(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white">
              {monthNames.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        <StatBox label="นักเรียนทั้งหมด" value={stats.totalStudents} />
        <StatBox label="เข้าห้องทั้งหมด" value={stats.totalVisits} />
        <StatBox label="เข้าห้องวันนี้" value={stats.todayVisits} />
        <StatBox label="อยู่ในห้องขณะนี้" value={stats.inRoomCount} />
        <StatBox label="ห้องพยาบาล" value={stats.totalRooms} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Visit Trend */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-dark">
          <h2 className="mb-4 text-lg font-bold text-dark dark:text-white">
            จำนวนการเข้าห้องพยาบาล ({period === "day" ? "วันนี้" : period === "month" ? `${monthNames[parseInt(month)-1]} พ.ศ. ${beYear}` : `พ.ศ. ${beYear}`})
          </h2>
          {visitChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={visitChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="จำนวน" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-gray-400">ไม่มีข้อมูล</div>
          )}
        </div>

        {/* Symptom Pie */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-dark">
          <h2 className="mb-4 text-lg font-bold text-dark dark:text-white">สัดส่วนประเภทอาการ</h2>
          {symptomChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={symptomChartData} cx="50%" cy="50%" labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={100} fill="#8884d8" dataKey="value">
                  {symptomChartData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-gray-400">ไม่มีข้อมูล</div>
          )}
        </div>

        {/* Status Pie */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-dark">
          <h2 className="mb-4 text-lg font-bold text-dark dark:text-white">สถานะการรักษา</h2>
          {statusChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusChartData} cx="50%" cy="50%" labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={100} fill="#8884d8" dataKey="value">
                  {statusChartData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-gray-400">ไม่มีข้อมูล</div>
          )}
        </div>

        {/* Top Students */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-dark">
          <h2 className="mb-4 text-lg font-bold text-dark dark:text-white">นักเรียนที่เข้าห้องพยาบาลบ่อย</h2>
          {stats.topStudents && stats.topStudents.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.topStudents.map((s: any) => ({ name: s.full_name?.split(" ")[0] || "", จำนวนครั้ง: s.visit_count }))} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                <Tooltip />
                <Bar dataKey="จำนวนครั้ง" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-gray-400">ไม่มีข้อมูล</div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-dark">
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
