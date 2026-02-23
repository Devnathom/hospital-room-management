"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { Plus, ClipboardPlus, Eye, Trash2, Search } from "lucide-react";
import ThaiDatePicker from "@/components/ThaiDatePicker";
import { formatThaiDate, getCurrentAcademicYear, getAcademicYearOptions } from "@/lib/thai-date";

const statusLabels: Record<string, string> = {
  in_room: "อยู่ในห้อง",
  treated: "รักษาแล้ว",
  referred: "ส่งต่อ",
  sent_home: "ส่งกลับบ้าน",
};

const statusColors: Record<string, string> = {
  in_room: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  treated: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  referred: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  sent_home: "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400",
};

export default function VisitsPage() {
  const { user } = useAuth();
  const [visits, setVisits] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [filterYear, setFilterYear] = useState(getCurrentAcademicYear());
  const [studentSearch, setStudentSearch] = useState("");
  const [form, setForm] = useState({
    healthRoomId: "", studentId: "", visitDate: new Date().toISOString().split("T")[0],
    visitTime: new Date().toTimeString().slice(0, 5), symptomCategoryId: "", symptoms: "",
    temperature: "", bloodPressure: "", treatment: "", medication: "", notes: "",
  });

  const fetchAll = async () => {
    const params = new URLSearchParams();
    if (filterYear) params.set("academic_year", filterYear);
    const [vRes, rRes, sRes, cRes] = await Promise.all([
      fetch(`/api/visits?${params}`), fetch("/api/rooms"), fetch("/api/students"), fetch("/api/symptom-categories"),
    ]);
    const [vData, rData, sData, cData] = await Promise.all([vRes.json(), rRes.json(), sRes.json(), cRes.json()]);
    if (vData.success) setVisits(vData.data);
    if (rData.success) setRooms(rData.data);
    if (sData.success) setStudents(sData.data);
    if (cData.success) setCategories(cData.data);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [filterYear]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) {
      setShowForm(false);
      setForm({ healthRoomId: "", studentId: "", visitDate: new Date().toISOString().split("T")[0], visitTime: new Date().toTimeString().slice(0, 5), symptomCategoryId: "", symptoms: "", temperature: "", bloodPressure: "", treatment: "", medication: "", notes: "" });
      fetchAll();
    } else {
      alert(data.error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("ยืนยันการลบรายการนี้? (จะลบบันทึกการรักษาที่เกี่ยวข้องด้วย)")) return;
    await fetch(`/api/visits?id=${id}`, { method: "DELETE" });
    fetchAll();
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    const leaveTime = status !== "in_room" ? new Date().toTimeString().slice(0, 5) : null;
    await fetch("/api/visits", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, leaveTime }),
    });
    fetchAll();
  };

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-dark dark:text-white">บันทึกการใช้ห้องพยาบาล</h1>
        <div className="flex flex-wrap gap-2">
          <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
            <option value="">ทุกปีการศึกษา</option>
            {getAcademicYearOptions().map((y) => <option key={y} value={y}>ปีการศึกษา {y}</option>)}
          </select>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
            <Plus className="h-4 w-4" /> บันทึกใหม่
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-bold dark:text-white">บันทึกการเข้าใช้ห้องพยาบาล</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-gray-300">ห้องพยาบาล *</label>
                  <select value={form.healthRoomId} onChange={(e) => setForm({ ...form, healthRoomId: e.target.value })} required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                    <option value="">เลือกห้อง</option>
                    {rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-gray-300">นักเรียน *</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      value={studentSearch}
                      onChange={(e) => { setStudentSearch(e.target.value); setForm({ ...form, studentId: "" }); }}
                      placeholder="พิมพ์ชื่อ หรือ ห้อง เช่น ป.1"
                      className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  {studentSearch && !form.studentId && (
                    <div className="mt-1 max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700">
                      {students.filter(s => { const q = studentSearch.toLowerCase(); return s.full_name?.toLowerCase().includes(q) || s.class_name?.toLowerCase().includes(q) || s.grade_level?.toLowerCase().includes(q) || s.student_code?.includes(studentSearch); }).slice(0, 20).map((s) => (
                        <button key={s.id} type="button" onClick={() => { setForm({ ...form, studentId: String(s.id) }); setStudentSearch(`${s.full_name} (${s.class_name || "-"})`); }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-blue-50 dark:hover:bg-gray-600">
                          <span className="font-medium dark:text-white">{s.full_name}</span>
                          <span className="text-xs text-gray-500">{s.class_name || ""} {s.grade_level || ""}</span>
                        </button>
                      ))}
                      {students.filter(s => { const q = studentSearch.toLowerCase(); return s.full_name?.toLowerCase().includes(q) || s.class_name?.toLowerCase().includes(q) || s.grade_level?.toLowerCase().includes(q) || s.student_code?.includes(studentSearch); }).length === 0 && (
                        <p className="px-3 py-2 text-sm text-gray-500">ไม่พบนักเรียน</p>
                      )}
                    </div>
                  )}
                  {form.studentId && <input type="hidden" name="studentId" value={form.studentId} required />}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <ThaiDatePicker label="วันที่ *" value={form.visitDate} onChange={(v) => setForm({ ...form, visitDate: v })} required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-gray-300">เวลา *</label>
                  <input type="time" value={form.visitTime} onChange={(e) => setForm({ ...form, visitTime: e.target.value })} required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-gray-300">ประเภทอาการ</label>
                  <select value={form.symptomCategoryId} onChange={(e) => setForm({ ...form, symptomCategoryId: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                    <option value="">เลือกประเภท</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-gray-300">อาการ *</label>
                <textarea value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} required rows={2}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="อธิบายอาการ..." />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-gray-300">อุณหภูมิ (°C)</label>
                  <input type="number" step="0.1" value={form.temperature} onChange={(e) => setForm({ ...form, temperature: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="37.0" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-gray-300">ความดันโลหิต</label>
                  <input value={form.bloodPressure} onChange={(e) => setForm({ ...form, bloodPressure: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="120/80" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-gray-300">การรักษาเบื้องต้น</label>
                <textarea value={form.treatment} onChange={(e) => setForm({ ...form, treatment: e.target.value })} rows={2}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-gray-300">ยาที่ให้</label>
                <input value={form.medication} onChange={(e) => setForm({ ...form, medication: e.target.value })}
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

      {/* Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-bold dark:text-white">รายละเอียดการเข้าใช้ห้อง</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">นักเรียน:</span><span className="font-medium dark:text-white">{showDetail.student_name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">ห้องเรียน:</span><span className="dark:text-gray-300">{showDetail.class_name || "-"}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">ห้องพยาบาล:</span><span className="dark:text-gray-300">{showDetail.room_name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">วันที่:</span><span className="dark:text-gray-300">{formatThaiDate(showDetail.visit_date?.split("T")[0])}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">เวลาเข้า:</span><span className="dark:text-gray-300">{showDetail.visit_time}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">เวลาออก:</span><span className="dark:text-gray-300">{showDetail.leave_time || "-"}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">ประเภทอาการ:</span><span className="dark:text-gray-300">{showDetail.symptom_category_name || "-"}</span></div>
              <div><span className="text-gray-500">อาการ:</span><p className="mt-1 dark:text-gray-300">{showDetail.symptoms}</p></div>
              {showDetail.temperature && <div className="flex justify-between"><span className="text-gray-500">อุณหภูมิ:</span><span className="dark:text-gray-300">{showDetail.temperature}°C</span></div>}
              {showDetail.treatment && <div><span className="text-gray-500">การรักษา:</span><p className="mt-1 dark:text-gray-300">{showDetail.treatment}</p></div>}
              {showDetail.medication && <div><span className="text-gray-500">ยาที่ให้:</span><p className="mt-1 dark:text-gray-300">{showDetail.medication}</p></div>}
              <div className="flex justify-between"><span className="text-gray-500">ผู้ดูแล:</span><span className="dark:text-gray-300">{showDetail.staff_name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">สถานะ:</span>
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[showDetail.status] || ""}`}>
                  {statusLabels[showDetail.status] || showDetail.status}
                </span>
              </div>
            </div>
            {showDetail.status === "in_room" && (
              <div className="mt-4 flex gap-2">
                <button onClick={() => { handleUpdateStatus(showDetail.id, "treated"); setShowDetail(null); }}
                  className="flex-1 rounded-lg bg-green-600 py-2 text-sm font-medium text-white hover:bg-green-700">รักษาแล้ว</button>
                <button onClick={() => { handleUpdateStatus(showDetail.id, "sent_home"); setShowDetail(null); }}
                  className="flex-1 rounded-lg bg-gray-600 py-2 text-sm font-medium text-white hover:bg-gray-700">ส่งกลับบ้าน</button>
                <button onClick={() => { handleUpdateStatus(showDetail.id, "referred"); setShowDetail(null); }}
                  className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700">ส่งต่อ</button>
              </div>
            )}
            <div className="mt-3 flex gap-2">
              <button onClick={() => { handleDelete(showDetail.id); setShowDetail(null); }}
                className="flex-1 rounded-lg border border-red-300 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20">ลบรายการ</button>
              <button onClick={() => setShowDetail(null)}
                className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">ปิด</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-dark">
        {loading ? (
          <div className="flex h-32 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" /></div>
        ) : visits.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center text-gray-500">
            <ClipboardPlus className="mb-2 h-10 w-10" /><p>ยังไม่มีข้อมูล</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">วันที่</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">เวลา</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">นักเรียน</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">ห้องเรียน</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">อาการ</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">สถานะ</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">ดู</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((v) => (
                  <tr key={v.id} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">{formatThaiDate(v.visit_date?.split("T")[0], true)}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{v.visit_time}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{v.student_name}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{v.class_name || "-"}</td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-gray-600 dark:text-gray-400">{v.symptoms}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[v.status] || ""}`}>
                        {statusLabels[v.status] || v.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setShowDetail(v)} className="mr-1 rounded p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(v.id)} className="rounded p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
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
