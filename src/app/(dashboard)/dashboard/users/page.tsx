"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Users } from "lucide-react";

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  school_admin: "ผู้ดูแลโรงเรียน",
  staff: "เจ้าหน้าที่",
  nurse: "พยาบาล",
};

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    email: "", password: "", fullName: "", role: "staff", phone: "", isActive: true,
  });

  const canManage = user?.role === "super_admin" || user?.role === "school_admin";

  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    const data = await res.json();
    if (data.success) setUsers(data.data);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editId ? "PUT" : "POST";
    const body = editId
      ? { id: editId, fullName: form.fullName, role: form.role, phone: form.phone, isActive: form.isActive, password: form.password || undefined }
      : form;

    const res = await fetch("/api/users", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.success) {
      setShowForm(false);
      setEditId(null);
      setForm({ email: "", password: "", fullName: "", role: "staff", phone: "", isActive: true });
      fetchUsers();
    } else {
      alert(data.error);
    }
  };

  const handleEdit = (u: any) => {
    setForm({ email: u.email, password: "", fullName: u.full_name, role: u.role, phone: u.phone || "", isActive: u.is_active });
    setEditId(u.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("ยืนยันการลบผู้ใช้?")) return;
    await fetch(`/api/users?id=${id}`, { method: "DELETE" });
    fetchUsers();
  };

  if (!canManage) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-gray-500">
        <Users className="mb-2 h-10 w-10" />
        <p>คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark dark:text-white">จัดการผู้ใช้</h1>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ email: "", password: "", fullName: "", role: "staff", phone: "", isActive: true }); }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700">
          <Plus className="h-4 w-4" /> เพิ่มผู้ใช้
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-bold dark:text-white">{editId ? "แก้ไขผู้ใช้" : "เพิ่มผู้ใช้"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editId && (
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-gray-300">อีเมล *</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-gray-300">
                  {editId ? "รหัสผ่านใหม่ (เว้นว่างหากไม่ต้องการเปลี่ยน)" : "รหัสผ่าน *"}
                </label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required={!editId}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-gray-300">ชื่อ-นามสกุล *</label>
                <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-gray-300">บทบาท *</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                  {user?.role === "super_admin" && <option value="super_admin">Super Admin</option>}
                  <option value="school_admin">ผู้ดูแลโรงเรียน</option>
                  <option value="staff">เจ้าหน้าที่</option>
                  <option value="nurse">พยาบาล</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-gray-300">โทรศัพท์</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              </div>
              {editId && (
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="isActive" checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300" />
                  <label htmlFor="isActive" className="text-sm font-medium dark:text-gray-300">เปิดใช้งาน</label>
                </div>
              )}
              <div className="flex gap-3">
                <button type="submit" className="flex-1 rounded-lg bg-blue-600 py-2.5 font-medium text-white hover:bg-blue-700">{editId ? "บันทึก" : "เพิ่ม"}</button>
                <button type="button" onClick={() => { setShowForm(false); setEditId(null); }}
                  className="flex-1 rounded-lg border border-gray-300 py-2.5 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">ยกเลิก</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-dark">
        {loading ? (
          <div className="flex h-32 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">#</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">ชื่อ-นามสกุล</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">อีเมล</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">บทบาท</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">โทร</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">สถานะ</th>
                  {user?.role === "super_admin" && <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">โรงเรียน</th>}
                  <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{u.full_name}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                        {roleLabels[u.role] || u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{u.phone || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${u.is_active ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"}`}>
                        {u.is_active ? "ใช้งาน" : "ระงับ"}
                      </span>
                    </td>
                    {user?.role === "super_admin" && <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{u.school_name || "-"}</td>}
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleEdit(u)} className="mr-2 rounded p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(u.id)} className="rounded p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="h-4 w-4" /></button>
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
