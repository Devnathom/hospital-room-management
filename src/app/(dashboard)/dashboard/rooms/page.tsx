"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, DoorOpen } from "lucide-react";

export default function RoomsPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", location: "", capacity: "1", description: "" });

  const canManage = user?.role === "super_admin" || user?.role === "school_admin";

  const fetchRooms = async () => {
    const res = await fetch("/api/rooms");
    const data = await res.json();
    if (data.success) setRooms(data.data);
    setLoading(false);
  };

  useEffect(() => { fetchRooms(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editId ? "PUT" : "POST";
    const body = editId
      ? { id: editId, ...form, capacity: parseInt(form.capacity), isActive: true }
      : { ...form, capacity: parseInt(form.capacity) };

    const res = await fetch("/api/rooms", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.success) {
      setShowForm(false);
      setEditId(null);
      setForm({ name: "", location: "", capacity: "1", description: "" });
      fetchRooms();
    }
  };

  const handleEdit = (room: any) => {
    setForm({ name: room.name, location: room.location || "", capacity: String(room.capacity), description: room.description || "" });
    setEditId(room.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("ยืนยันการลบห้องพยาบาล?")) return;
    await fetch(`/api/rooms?id=${id}`, { method: "DELETE" });
    fetchRooms();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark dark:text-white">ห้องพยาบาล</h1>
        {canManage && (
          <button
            onClick={() => { setShowForm(true); setEditId(null); setForm({ name: "", location: "", capacity: "1", description: "" }); }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> เพิ่มห้อง
          </button>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-bold dark:text-white">{editId ? "แก้ไขห้องพยาบาล" : "เพิ่มห้องพยาบาล"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-gray-300">ชื่อห้อง *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-gray-300">สถานที่</label>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-gray-300">ความจุ (เตียง)</label>
                <input type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-gray-300">รายละเอียด</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 rounded-lg bg-blue-600 py-2.5 font-medium text-white hover:bg-blue-700">
                  {editId ? "บันทึก" : "เพิ่ม"}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditId(null); }}
                  className="flex-1 rounded-lg border border-gray-300 py-2.5 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-dark">
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center text-gray-500">
            <DoorOpen className="mb-2 h-10 w-10" />
            <p>ยังไม่มีห้องพยาบาล</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">#</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">ชื่อห้อง</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">สถานที่</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">ความจุ</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">สถานะ</th>
                  {canManage && <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">จัดการ</th>}
                </tr>
              </thead>
              <tbody>
                {rooms.map((room, i) => (
                  <tr key={room.id} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{room.name}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{room.location || "-"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{room.capacity} เตียง</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${room.is_active ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"}`}>
                        {room.is_active ? "ใช้งาน" : "ปิด"}
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleEdit(room)} className="mr-2 rounded p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(room.id)} className="rounded p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    )}
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
