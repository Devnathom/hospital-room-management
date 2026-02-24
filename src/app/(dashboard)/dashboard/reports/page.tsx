"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { FileText, Loader2, Printer } from "lucide-react";
import ThaiDatePicker from "@/components/ThaiDatePicker";
import { formatThaiDate } from "@/lib/thai-date";

const statusLabels: Record<string, string> = {
  in_room: "อยู่ในห้อง",
  treated: "รักษาแล้ว",
  referred: "ส่งต่อ",
  sent_home: "ส่งกลับบ้าน",
};

export default function ReportsPage() {
  const { user } = useAuth();
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1);
    return d.toISOString().split("T")[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split("T")[0]);

  const fetchVisits = async () => {
    setLoading(true);
    const res = await fetch(`/api/visits?date_from=${dateFrom}&date_to=${dateTo}`);
    const data = await res.json();
    if (data.success) setVisits(data.data);
    setLoading(false);
  };

  useEffect(() => { fetchVisits(); }, [dateFrom, dateTo]);

  const openPDF = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/reports/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateFrom, dateTo }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "เกิดข้อผิดพลาดในการสร้าง PDF");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการสร้าง PDF");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-dark dark:text-white">ส่งออกรายงาน</h1>
        <button onClick={openPDF} disabled={exporting || visits.length === 0}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50">
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
          {exporting ? "กำลังสร้าง..." : "ดูตัวอย่าง / พิมพ์ PDF"}
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-end gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-dark">
        <ThaiDatePicker label="จากวันที่" value={dateFrom} onChange={setDateFrom} />
        <ThaiDatePicker label="ถึงวันที่" value={dateTo} onChange={setDateTo} />
        <div className="text-sm text-gray-500">
          พบ <span className="font-semibold text-blue-600">{visits.length}</span> รายการ
        </div>
      </div>

      {/* Table Preview */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-dark">
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : visits.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center text-gray-500">
            <FileText className="mb-2 h-10 w-10" /><p>ไม่มีข้อมูลในช่วงเวลาที่เลือก</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  {["#","วันที่","เวลา","นักเรียน","ห้องเรียน","ห้องพยาบาล","อาการ","การรักษา","ยา","สถานะ","ผู้ดูแล"].map(h => (
                    <th key={h} className="px-3 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visits.map((v, i) => (
                  <tr key={v.id} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="px-3 py-2.5 text-gray-500">{i + 1}</td>
                    <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400 text-xs whitespace-nowrap">{formatThaiDate(v.visit_date?.split("T")[0], true)}</td>
                    <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{v.visit_time}</td>
                    <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-white">{v.student_name}</td>
                    <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{v.class_name || "-"}</td>
                    <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{v.room_name}</td>
                    <td className="max-w-[150px] truncate px-3 py-2.5 text-gray-600 dark:text-gray-400">{v.symptoms}</td>
                    <td className="max-w-[120px] truncate px-3 py-2.5 text-gray-600 dark:text-gray-400">{v.treatment || "-"}</td>
                    <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{v.medication || "-"}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        v.status === "treated" ? "bg-green-100 text-green-700" :
                        v.status === "in_room"  ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-700"}`}>
                        {statusLabels[v.status] || v.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{v.staff_name}</td>
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
