"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, Users, Search, Upload, FileSpreadsheet, ArrowUpCircle, X, Download } from "lucide-react";
import ThaiDatePicker from "@/components/ThaiDatePicker";
import { formatThaiDate, getCurrentAcademicYear, getAcademicYearOptions } from "@/lib/thai-date";

export default function StudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [showInactive, setShowInactive] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    studentCode: "", fullName: "", className: "", gradeLevel: "",
    dateOfBirth: "", gender: "", bloodType: "", allergies: "",
    parentPhone: "", parentName: "", academicYear: getCurrentAcademicYear(),
  });

  // CSV import state
  const fileRef = useRef<HTMLInputElement>(null);
  const [showImport, setShowImport] = useState(false);
  const [importYear, setImportYear] = useState(getCurrentAcademicYear());
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  // Grade promotion state
  const [showPromote, setShowPromote] = useState(false);
  const [promoteFrom, setPromoteFrom] = useState(getCurrentAcademicYear());
  const [promoteTo, setPromoteTo] = useState(String(parseInt(getCurrentAcademicYear()) + 1));
  const [maxGrade, setMaxGrade] = useState("ป.6");
  const [promoting, setPromoting] = useState(false);
  const [promoteResult, setPromoteResult] = useState<any>(null);

  const fetchStudents = async () => {
    setLoading(true);
    const params = new URLSearchParams({ search });
    if (academicYear) params.set("academic_year", academicYear);
    if (showInactive) params.set("show_inactive", "1");
    const res = await fetch(`/api/students?${params}`);
    const data = await res.json();
    if (data.success) setStudents(data.data);
    setLoading(false);
  };

  useEffect(() => { fetchStudents(); }, [search, academicYear, showInactive]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editId ? "PUT" : "POST";
    const body = editId ? { id: editId, ...form } : form;

    const res = await fetch("/api/students", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.success) {
      setShowForm(false);
      setEditId(null);
      resetForm();
      fetchStudents();
    } else {
      alert(data.error);
    }
  };

  const resetForm = () => {
    setForm({ studentCode: "", fullName: "", className: "", gradeLevel: "", dateOfBirth: "", gender: "", bloodType: "", allergies: "", parentPhone: "", parentName: "", academicYear: getCurrentAcademicYear() });
  };

  const handleEdit = (s: any) => {
    setForm({
      studentCode: s.student_code || "", fullName: s.full_name, className: s.class_name || "",
      gradeLevel: s.grade_level || "", dateOfBirth: s.date_of_birth?.split("T")[0] || "",
      gender: s.gender || "", bloodType: s.blood_type || "", allergies: s.allergies || "",
      parentPhone: s.parent_phone || "", parentName: s.parent_name || "",
      academicYear: s.academic_year || getCurrentAcademicYear(),
    });
    setEditId(s.id);
    setShowForm(true);
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImporting(true);
    setImportResult(null);
    const fd = new FormData();
    fd.append("file", importFile);
    fd.append("academic_year", importYear);
    const res = await fetch("/api/students/import", { method: "POST", body: fd });
    const data = await res.json();
    setImportResult(data);
    setImporting(false);
    if (data.success) { fetchStudents(); setImportFile(null); if (fileRef.current) fileRef.current.value = ""; }
  };

  const handlePromote = async () => {
    if (!confirm(`ยืนยันการเลื่อนชั้นจากปีการศึกษา ${promoteFrom} ไปยัง ${promoteTo}?`)) return;
    setPromoting(true);
    setPromoteResult(null);
    const res = await fetch("/api/students/promote", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromAcademicYear: promoteFrom, toAcademicYear: promoteTo, maxGrade }),
    });
    const data = await res.json();
    setPromoteResult(data);
    setPromoting(false);
    if (data.success) { fetchStudents(); }
  };

  const downloadTemplate = () => {
    const csv = "รหัสนักเรียน,ชื่อ-นามสกุล,ห้องเรียน,ระดับชั้น,วันเกิด,เพศ,กรุ๊ปเลือด,แพ้ยา,ชื่อผู้ปกครอง,เบอร์ผู้ปกครอง\n";
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "student_template.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("ยืนยันการลบข้อมูลนักเรียน?")) return;
    await fetch(`/api/students?id=${id}`, { method: "DELETE" });
    fetchStudents();
  };

  // Pagination
  const [page, setPage] = useState(1);
  const perPage = 20;
  const totalPages = Math.max(1, Math.ceil(students.length / perPage));
  const pagedStudents = students.slice((page - 1) * perPage, page * perPage);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, academicYear, showInactive]);

  const yearOptions = getAcademicYearOptions();
  const inputCls = "w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white";

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-dark dark:text-white">นักเรียน</h1>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { setShowImport(!showImport); setImportResult(null); }}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-700">
              <Upload className="h-4 w-4" /> นำเข้า CSV
            </button>
            <button onClick={() => { setShowPromote(!showPromote); setPromoteResult(null); }}
              className="flex items-center gap-2 rounded-lg bg-orange-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-orange-600">
              <ArrowUpCircle className="h-4 w-4" /> เลื่อนชั้น
            </button>
            <button onClick={() => { setShowForm(true); setEditId(null); resetForm(); }}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
              <Plus className="h-4 w-4" /> เพิ่มนักเรียน
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหานักเรียน..."
              className="rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
          </div>
          <select value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
            <option value="">ทุกปีการศึกษา</option>
            {yearOptions.map((y) => <option key={y} value={y}>ปีการศึกษา {y}</option>)}
          </select>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} className="rounded" />
            แสดงนักเรียนที่จบ/ไม่ใช้งาน
          </label>
        </div>
      </div>

      {/* CSV Import Panel */}
      {showImport && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-green-800 dark:text-green-300">
              <FileSpreadsheet className="h-5 w-5" /> นำเข้านักเรียนจาก CSV
            </div>
            <button onClick={() => setShowImport(false)}><X className="h-4 w-4 text-gray-500" /></button>
          </div>
          <div className="mb-3 flex flex-wrap gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">ปีการศึกษา</label>
              <select value={importYear} onChange={(e) => setImportYear(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-gray-600">ไฟล์ CSV</label>
              <input ref={fileRef} type="file" accept=".csv" onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleImport} disabled={!importFile || importing}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-green-700">
              {importing ? "กำลังนำเข้า..." : <><Upload className="h-4 w-4" /> นำเข้า</>}
            </button>
            <button onClick={downloadTemplate}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300">
              <Download className="h-4 w-4" /> ดาวน์โหลด Template
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">รูปแบบ CSV: รหัสนักเรียน, ชื่อ-นามสกุล, ห้องเรียน, ระดับชั้น, วันเกิด (วว/ดด/ปปปป พ.ศ.), เพศ (ชาย/หญิง), กรุ๊ปเลือด, แพ้ยา, ชื่อผู้ปกครอง, เบอร์ผู้ปกครอง</p>
          {importResult && (
            <div className={`mt-3 rounded-lg p-3 text-sm ${importResult.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {importResult.data?.message || importResult.error}
              {importResult.data?.errors?.length > 0 && (
                <ul className="mt-1 list-disc pl-4 text-xs">{importResult.data.errors.map((e: string, i: number) => <li key={i}>{e}</li>)}</ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* Grade Promotion Panel */}
      {showPromote && (
        <div className="mb-4 rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-orange-800 dark:text-orange-300">
              <ArrowUpCircle className="h-5 w-5" /> เลื่อนชั้นนักเรียน
            </div>
            <button onClick={() => setShowPromote(false)}><X className="h-4 w-4 text-gray-500" /></button>
          </div>
          <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">ระบบจะเลื่อนชั้นนักเรียนทุกคนโดยอัตโนมัติ นักเรียนที่อยู่ชั้นสูงสุดจะถูกทำเครื่องหมายว่าจบการศึกษา (เช่น อ.3 เลื่อนเป็น ป.1)</p>
          <div className="flex flex-wrap gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">ชั้นสูงสุดของโรงเรียน</label>
              <select value={maxGrade} onChange={(e) => setMaxGrade(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                <option value="ป.6">ป.6 (จบแล้วไม่มี ม.ต้น)</option>
                <option value="ม.3">ม.3 (จบแล้วไม่มี ม.ปลาย)</option>
                <option value="ม.6">ม.6 (มัธยมปลาย)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">จากปีการศึกษา</label>
              <select value={promoteFrom} onChange={(e) => setPromoteFrom(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">ไปยังปีการศึกษา</label>
              <select value={promoteTo} onChange={(e) => setPromoteTo(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={handlePromote} disabled={promoting || promoteFrom === promoteTo}
                className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-orange-600">
                {promoting ? "กำลังเลื่อนชั้น..." : <><ArrowUpCircle className="h-4 w-4" /> ยืนยันเลื่อนชั้น</>}
              </button>
            </div>
          </div>
          {promoteResult && (
            <div className={`mt-3 rounded-lg p-3 text-sm ${promoteResult.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {promoteResult.data?.message || promoteResult.error}
            </div>
          )}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-bold dark:text-white">{editId ? "แก้ไขข้อมูลนักเรียน" : "เพิ่มนักเรียน"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-gray-300">รหัสนักเรียน</label>
                  <input value={form.studentCode} onChange={(e) => setForm({ ...form, studentCode: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-gray-300">ชื่อ-นามสกุล *</label>
                  <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-gray-300">ห้องเรียน</label>
                  <input value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="เช่น ม.3/1" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-gray-300">ระดับชั้น</label>
                  <input value={form.gradeLevel} onChange={(e) => setForm({ ...form, gradeLevel: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="เช่น ม.3" />
                </div>
              </div>
              <div>
                <ThaiDatePicker label="วันเกิด" value={form.dateOfBirth} onChange={(v) => setForm({ ...form, dateOfBirth: v })} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-gray-300">เพศ</label>
                  <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                    <option value="">เลือก</option>
                    <option value="male">ชาย</option>
                    <option value="female">หญิง</option>
                    <option value="other">อื่นๆ</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-gray-300">กรุ๊ปเลือด</label>
                  <select value={form.bloodType} onChange={(e) => setForm({ ...form, bloodType: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                    <option value="">เลือก</option>
                    <option value="A">A</option><option value="B">B</option>
                    <option value="AB">AB</option><option value="O">O</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-gray-300">ประวัติแพ้ยา/อาหาร</label>
                  <input value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-gray-300">ชื่อผู้ปกครอง</label>
                  <input value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-gray-300">เบอร์ผู้ปกครอง</label>
                  <input value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-gray-300">ปีการศึกษา</label>
                <select value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                  className={inputCls}>
                  <option value="">ไม่ระบุ</option>
                  {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 rounded-lg bg-blue-600 py-2.5 font-medium text-white hover:bg-blue-700">{editId ? "บันทึก" : "เพิ่ม"}</button>
                <button type="button" onClick={() => { setShowForm(false); setEditId(null); }}
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
        ) : students.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center text-gray-500">
            <Users className="mb-2 h-10 w-10" /><p>ยังไม่มีข้อมูลนักเรียน</p>
          </div>
        ) : (
          <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">รหัส</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">ชื่อ-นามสกุล</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">ห้อง/ชั้น</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">วันเกิด (พ.ศ.)</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">เพศ / เลือด</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">แพ้ยา</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">ผู้ปกครอง</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {pagedStudents.map((s) => (
                  <tr key={s.id} className={`border-b border-gray-100 dark:border-gray-700 ${!s.is_active ? "opacity-50" : ""}`}>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.student_code || "-"}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-white">{s.full_name}</p>
                      {!s.is_active && <span className="text-xs text-red-500">จบการศึกษา</span>}
                      {s.academic_year && <p className="text-xs text-gray-400">ปี {s.academic_year}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.class_name || "-"}<br /><span className="text-xs text-gray-400">{s.grade_level || ""}</span></td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">{s.date_of_birth ? formatThaiDate(s.date_of_birth.split("T")[0], true) : "-"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.gender === "male" ? "ชาย" : s.gender === "female" ? "หญิง" : s.gender || "-"} {s.blood_type ? `/ ${s.blood_type}` : ""}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.allergies || "-"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.parent_name || "-"}<br /><span className="text-xs">{s.parent_phone || ""}</span></td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleEdit(s)} className="mr-2 rounded p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(s.id)} className="rounded p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                แสดง {(page - 1) * perPage + 1}–{Math.min(page * perPage, students.length)} จาก {students.length} รายการ
              </p>
              <div className="flex gap-1">
                <button onClick={() => setPage(1)} disabled={page === 1}
                  className="rounded px-2.5 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 dark:text-gray-300 dark:hover:bg-gray-700">
                  «
                </button>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="rounded px-2.5 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 dark:text-gray-300 dark:hover:bg-gray-700">
                  ‹
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let p: number;
                  if (totalPages <= 5) p = i + 1;
                  else if (page <= 3) p = i + 1;
                  else if (page >= totalPages - 2) p = totalPages - 4 + i;
                  else p = page - 2 + i;
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      className={`rounded px-3 py-1.5 text-sm font-medium ${p === page ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"}`}>
                      {p}
                    </button>
                  );
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="rounded px-2.5 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 dark:text-gray-300 dark:hover:bg-gray-700">
                  ›
                </button>
                <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
                  className="rounded px-2.5 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 dark:text-gray-300 dark:hover:bg-gray-700">
                  »
                </button>
              </div>
            </div>
          )}
          </>
        )}
      </div>
    </div>
  );
}
