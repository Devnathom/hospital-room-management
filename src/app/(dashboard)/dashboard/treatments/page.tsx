"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { Plus, Heart, Trash2 } from "lucide-react";

export default function TreatmentsPage() {
  const { user } = useAuth();
  const [treatments, setTreatments] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    visitId: "", studentId: "", treatmentType: "", treatmentDetail: "",
    medicationGiven: "", followUpRequired: false, followUpDate: "", notes: "",
  });

  const fetchAll = async () => {
    const [tRes, vRes] = await Promise.all([
      fetch("/api/treatments"), fetch("/api/visits"),
    ]);
    const [tData, vData] = await Promise.all([tRes.json(), vRes.json()]);
    if (tData.success) setTreatments(tData.data);
    if (vData.success) setVisits(vData.data.filter((v: any) => v.status === "in_room" || v.status === "treated"));
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("ยืนยันการลบบันทึกการรักษานี้?")) return;
    await fetch(`/api/treatments?id=${id}`, { method: "DELETE" });
    fetchAll();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedVisit = visits.find((v) => v.id === parseInt(form.visitId));
    const res = await fetch("/api/treatments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, studentId: selectedVisit?.student_id }),
    });
    const data = await res.json();
    if (data.success) {
      setShowForm(false);
      setForm({ visitId: "", studentId: "", treatmentType: "", treatmentDetail: "", medicationGiven: "", followUpRequired: false, followUpDate: "", notes: "" });
      fetchAll();
    } else {
      alert(data.error);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark dark:text-white">บันทึกการรักษา</h1>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700">
          <Plus className="h-4 w-4" /> บันทึกการรักษา
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-bold dark:text-white">บันทึกการรักษา</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-gray-300">เลือกรายการเข้าห้องพยาบาล *</label>
                <select value={form.visitId} onChange={(e) => setForm({ ...form, visitId: e.target.value })} required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                  <option value="">เลือก...</option>
                  {visits.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.visit_date?.split("T")[0]} - {v.student_name} ({v.symptoms?.substring(0, 30)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-gray-300">ประเภทการรักษา *</label>
                <select value={form.treatmentType} onChange={(e) => setForm({ ...form, treatmentType: e.target.value })} required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                  <option value="">เลือก...</option>
                  <option value="ปฐมพยาบาล">ปฐมพยาบาล</option>
                  <option value="ให้ยา">ให้ยา</option>
                  <option value="ทำแผล">ทำแผล</option>
                  <option value="ประคบเย็น">ประคบเย็น</option>
                  <option value="ประคบร้อน">ประคบร้อน</option>
                  <option value="วัดไข้/สังเกตอาการ">วัดไข้/สังเกตอาการ</option>
                  <option value="ส่งต่อแพทย์">ส่งต่อแพทย์</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-gray-300">รายละเอียดการรักษา</label>
                <textarea value={form.treatmentDetail} onChange={(e) => setForm({ ...form, treatmentDetail: e.target.value })} rows={3}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-gray-300">ยาที่ให้</label>
                <input value={form.medicationGiven} onChange={(e) => setForm({ ...form, medicationGiven: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="followUp" checked={form.followUpRequired}
                  onChange={(e) => setForm({ ...form, followUpRequired: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300" />
                <label htmlFor="followUp" className="text-sm font-medium dark:text-gray-300">ต้องติดตามอาการ</label>
              </div>
              {form.followUpRequired && (
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-gray-300">วันนัดติดตาม</label>
                  <input type="date" value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-gray-300">หมายเหตุ</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 rounded-lg bg-blue-600 py-2.5 font-medium text-white hover:bg-blue-700">บันทึก</button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 rounded-lg border border-gray-300 py-2.5 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">ยกเลิก</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-dark">
        {loading ? (
          <div className="flex h-32 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" /></div>
        ) : treatments.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center text-gray-500">
            <Heart className="mb-2 h-10 w-10" /><p>ยังไม่มีข้อมูลการรักษา</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">วันที่เข้า</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">นักเรียน</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">ห้องเรียน</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">อาการ</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">ประเภทการรักษา</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">ยา</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">ผู้รักษา</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">ติดตาม</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">ลบ</th>
                </tr>
              </thead>
              <tbody>
                {treatments.map((t) => (
                  <tr key={t.id} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{t.visit_date?.split("T")[0]}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{t.student_name}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{t.class_name || "-"}</td>
                    <td className="max-w-[150px] truncate px-4 py-3 text-gray-600 dark:text-gray-400">{t.symptoms}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{t.treatment_type}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{t.medication_given || "-"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{t.treated_by_name}</td>
                    <td className="px-4 py-3">
                      {t.follow_up_required ? (
                        <span className="inline-flex rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">
                          {t.follow_up_date?.split("T")[0] || "ต้องติดตาม"}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDelete(t.id)} className="rounded p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <Trash2 className="h-4 w-4" />
                      </button>
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
