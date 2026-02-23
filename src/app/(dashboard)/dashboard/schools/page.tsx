"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { Building, CheckCircle2, XCircle, Ban, Clock } from "lucide-react";

const statusLabels: Record<string, string> = {
  pending: "รออนุมัติ",
  approved: "อนุมัติแล้ว",
  rejected: "ปฏิเสธ",
  suspended: "ระงับ",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  approved: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  suspended: "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400",
};

export default function SchoolsPage() {
  const { user } = useAuth();
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const fetchSchools = async () => {
    const url = filter ? `/api/schools?status=${filter}` : "/api/schools";
    const res = await fetch(url);
    const data = await res.json();
    if (data.success) setSchools(data.data);
    setLoading(false);
  };

  useEffect(() => { fetchSchools(); }, [filter]);

  const updateStatus = async (id: number, status: string) => {
    const confirmMsg = status === "approved" ? "ยืนยันการอนุมัติโรงเรียน?" : `ยืนยันการเปลี่ยนสถานะเป็น "${statusLabels[status]}"?`;
    if (!confirm(confirmMsg)) return;

    await fetch("/api/schools", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchSchools();
  };

  if (user?.role !== "super_admin") {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-gray-500">
        <Building className="mb-2 h-10 w-10" />
        <p>เฉพาะ Super Admin เท่านั้นที่เข้าถึงได้</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-dark dark:text-white">จัดการโรงเรียน</h1>
        <div className="flex gap-2">
          {["", "pending", "approved", "rejected", "suspended"].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${filter === s ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"}`}>
              {s ? statusLabels[s] : "ทั้งหมด"}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-dark">
        {loading ? (
          <div className="flex h-32 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" /></div>
        ) : schools.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center text-gray-500">
            <Building className="mb-2 h-10 w-10" /><p>ไม่มีข้อมูลโรงเรียน</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">#</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">ชื่อโรงเรียน</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">อีเมล</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">โทร</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">สถานะ</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">วันที่สมัคร</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {schools.map((s, i) => (
                  <tr key={s.id} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{s.name}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.email || "-"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.phone || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[s.status] || ""}`}>
                        {statusLabels[s.status] || s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{new Date(s.created_at).toLocaleDateString("th-TH")}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {s.status === "pending" && (
                          <>
                            <button onClick={() => updateStatus(s.id, "approved")} title="อนุมัติ"
                              className="rounded p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20">
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                            <button onClick={() => updateStatus(s.id, "rejected")} title="ปฏิเสธ"
                              className="rounded p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {s.status === "approved" && (
                          <button onClick={() => updateStatus(s.id, "suspended")} title="ระงับ"
                            className="rounded p-1.5 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20">
                            <Ban className="h-4 w-4" />
                          </button>
                        )}
                        {(s.status === "suspended" || s.status === "rejected") && (
                          <button onClick={() => updateStatus(s.id, "approved")} title="เปิดใช้งาน"
                            className="rounded p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20">
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
