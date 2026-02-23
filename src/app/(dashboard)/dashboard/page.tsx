"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { Users, Building, ClipboardPlus, Heart, Activity, DoorOpen, Server, Database, Cpu, MemoryStick, RefreshCw, CheckCircle, Clock, Globe } from "lucide-react";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [sysInfo, setSysInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === "super_admin") {
        fetch("/api/system-info")
          .then((r) => r.json())
          .then((d) => { if (d.success) setSysInfo(d.data); })
          .catch(() => {})
          .finally(() => setLoading(false));
      } else {
        fetch("/api/stats")
          .then((r) => r.json())
          .then((d) => { if (d.success) setStats(d.data); })
          .catch(() => {})
          .finally(() => setLoading(false));
      }
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user]);

  if (authLoading || loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  // Super Admin Dashboard
  if (user.role === "super_admin") {
    const s = sysInfo;
    const memPct = s?.memory?.usagePercent ?? 0;
    const memColor = memPct > 85 ? "red" : memPct > 65 ? "orange" : "green";

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-dark dark:text-white">ภาพรวมระบบ</h1>
            <p className="mt-1 text-sm text-gray-500">
              {s ? new Date(s.timestamp).toLocaleString("th-TH") : "กำลังโหลด..."}
            </p>
          </div>
          <button
            onClick={() => { setLoading(true); fetch("/api/system-info").then(r=>r.json()).then(d=>{ if(d.success) setSysInfo(d.data); }).finally(()=>setLoading(false)); }}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <RefreshCw className="h-4 w-4" /> รีเฟรช
          </button>
        </div>

        {/* Stats Cards - Schools & Users */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard icon={Building} label="โรงเรียนทั้งหมด" value={s?.stats.schools.total ?? "-"} color="blue" />
          <StatCard icon={CheckCircle} label="อนุมัติแล้ว" value={s?.stats.schools.approved ?? "-"} color="green" />
          <StatCard icon={Clock} label="รอการอนุมัติ" value={s?.stats.schools.pending ?? "-"} color="orange" />
          <StatCard icon={Users} label="ผู้ใช้ทั้งหมด" value={s?.stats.users.total ?? "-"} color="purple" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Server Info */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-dark">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20">
                <Server className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="font-bold text-dark dark:text-white">ข้อมูล Server</h2>
            </div>
            <div className="space-y-3">
              <InfoRow label="Node.js" value={s?.server.nodeVersion ?? "-"} />
              <InfoRow label="Platform" value={`${s?.server.platform ?? "-"} (${s?.server.arch ?? "-"})`} />
              <InfoRow label="Hostname" value={s?.server.hostname ?? "-"} />
              <InfoRow label="Environment" value={s?.server.environment ?? "-"} badge />
              <InfoRow label="Uptime" value={s?.server.uptimeFormatted ?? "-"} />
            </div>
          </div>

          {/* Database Info */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-dark">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-purple-50 p-2 dark:bg-purple-900/20">
                <Database className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="font-bold text-dark dark:text-white">ฐานข้อมูล</h2>
            </div>
            <div className="space-y-3">
              <InfoRow label="MySQL Version" value={s?.database.version ?? "-"} />
              <InfoRow label="Host" value={`${s?.database.host ?? "-"}:${s?.database.port ?? "-"}`} />
              <InfoRow label="Database" value={s?.database.name ?? "-"} />
              <InfoRow label="ขนาด DB" value={s ? `${s.database.sizeMB} MB` : "-"} />
              <InfoRow label="การใช้ห้องรวมทุกโรงเรียน" value={s?.stats.totalVisits?.toLocaleString() ?? "-"} />
            </div>
          </div>

          {/* Memory */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-dark">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-green-50 p-2 dark:bg-green-900/20">
                <MemoryStick className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="font-bold text-dark dark:text-white">หน่วยความจำ (RAM)</h2>
            </div>
            {s && (
              <>
                <div className="mb-3">
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-gray-500">ใช้งาน / ทั้งหมด</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {s.memory.usedMB} MB / {s.memory.totalMB} MB
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                    <div
                      className={`h-full rounded-full transition-all ${memColor === "red" ? "bg-red-500" : memColor === "orange" ? "bg-orange-500" : "bg-green-500"}`}
                      style={{ width: `${memPct}%` }}
                    />
                  </div>
                  <p className="mt-1 text-right text-xs text-gray-400">{memPct}% ถูกใช้งาน</p>
                </div>
                <div className="space-y-2">
                  <InfoRow label="RAM ว่าง" value={`${s.memory.freeMB} MB`} />
                  <InfoRow label="Process Heap" value={`${s.memory.processHeapMB} / ${s.memory.processHeapTotalMB} MB`} />
                </div>
              </>
            )}
          </div>

          {/* Users breakdown */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-dark">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-indigo-50 p-2 dark:bg-indigo-900/20">
                <Globe className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="font-bold text-dark dark:text-white">สรุปผู้ใช้งาน</h2>
            </div>
            <div className="space-y-3">
              <InfoRow label="ผู้ใช้ทั้งหมด" value={s?.stats.users.total ?? "-"} />
              <InfoRow label="ใช้งานอยู่" value={s?.stats.users.active ?? "-"} />
              <InfoRow label="ถูกระงับ" value={s?.stats.users.inactive ?? "-"} />
              <div className="mt-2 border-t border-gray-100 pt-3 dark:border-gray-700" />
              <InfoRow label="โรงเรียนที่ถูกปฏิเสธ" value={s?.stats.schools.rejected ?? "-"} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // School Dashboard
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-dark dark:text-white">แดชบอร์ด</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={Users} label="นักเรียนทั้งหมด" value={stats?.totalStudents || 0} color="blue" />
        <StatCard icon={ClipboardPlus} label="การใช้ห้องทั้งหมด" value={stats?.totalVisits || 0} color="green" />
        <StatCard icon={Heart} label="เข้าห้องวันนี้" value={stats?.todayVisits || 0} color="red" />
        <StatCard icon={Activity} label="อยู่ในห้องขณะนี้" value={stats?.inRoomCount || 0} color="orange" />
        <StatCard icon={DoorOpen} label="ห้องพยาบาล" value={stats?.totalRooms || 0} color="purple" />
      </div>

      {/* Quick Stats */}
      {stats?.symptomStats && stats.symptomStats.length > 0 && (
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-dark">
          <h2 className="mb-4 text-lg font-bold text-dark dark:text-white">อาการที่พบบ่อย (ปีนี้)</h2>
          <div className="space-y-3">
            {stats.symptomStats.slice(0, 5).map((s: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">{s.name || "ไม่ระบุ"}</span>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: `${Math.min(100, (s.count / (stats.symptomStats[0]?.count || 1)) * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{s.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Students */}
      {stats?.topStudents && stats.topStudents.length > 0 && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-dark">
          <h2 className="mb-4 text-lg font-bold text-dark dark:text-white">นักเรียนที่เข้าห้องพยาบาลบ่อย (ปีนี้)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <th className="pb-3 text-left font-semibold text-gray-700 dark:text-gray-300">#</th>
                  <th className="pb-3 text-left font-semibold text-gray-700 dark:text-gray-300">ชื่อ-นามสกุล</th>
                  <th className="pb-3 text-left font-semibold text-gray-700 dark:text-gray-300">ห้องเรียน</th>
                  <th className="pb-3 text-right font-semibold text-gray-700 dark:text-gray-300">จำนวนครั้ง</th>
                </tr>
              </thead>
              <tbody>
                {stats.topStudents.map((s: any, i: number) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-2.5 text-gray-600 dark:text-gray-400">{i + 1}</td>
                    <td className="py-2.5 font-medium text-gray-900 dark:text-white">{s.full_name}</td>
                    <td className="py-2.5 text-gray-600 dark:text-gray-400">{s.class_name || "-"}</td>
                    <td className="py-2.5 text-right font-semibold text-blue-600">{s.visit_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, badge }: { label: string; value: string | number; badge?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      {badge ? (
        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
          {value}
        </span>
      ) : (
        <span className="font-medium text-gray-900 dark:text-white">{value}</span>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number | string; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    red: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
    orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-dark">
      <div className="flex items-center gap-4">
        <div className={`rounded-xl p-3 ${colorClasses[color] || colorClasses.blue}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}
