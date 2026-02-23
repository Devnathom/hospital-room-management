"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { Plus, Trash2, Tag } from "lucide-react";

export default function SymptomsPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");

  const canManage = user?.role === "super_admin" || user?.role === "school_admin";

  const fetchCategories = async () => {
    const res = await fetch("/api/symptom-categories");
    const data = await res.json();
    if (data.success) setCategories(data.data);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const res = await fetch("/api/symptom-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    const data = await res.json();
    if (data.success) {
      setNewName("");
      fetchCategories();
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-dark dark:text-white">ประเภทอาการ</h1>

      {canManage && (
        <form onSubmit={handleAdd} className="mb-6 flex gap-3">
          <input value={newName} onChange={(e) => setNewName(e.target.value)}
            placeholder="เพิ่มประเภทอาการใหม่..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
          <button type="submit"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700">
            <Plus className="h-4 w-4" /> เพิ่ม
          </button>
        </form>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-dark">
        {loading ? (
          <div className="flex h-32 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" /></div>
        ) : categories.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center text-gray-500">
            <Tag className="mb-2 h-10 w-10" /><p>ยังไม่มีประเภทอาการ</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {categories.map((c, i) => (
              <div key={c.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                    {i + 1}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">{c.name}</span>
                </div>
                {c.description && <span className="text-sm text-gray-500">{c.description}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
