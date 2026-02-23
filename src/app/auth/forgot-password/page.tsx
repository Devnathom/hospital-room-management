"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Mail, Loader2, CheckCircle, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "เกิดข้อผิดพลาด");
        return;
      }

      setSent(true);
    } catch {
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600">
              <Heart className="h-7 w-7 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">ระบบห้องพยาบาล</h1>
              <p className="text-xs text-gray-500">Hospital Room Management</p>
            </div>
          </Link>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-700 dark:bg-gray-800">
          {sent ? (
            /* Success state */
            <div className="text-center py-4">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle className="h-9 w-9 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                ส่งอีเมลแล้ว!
              </h2>
              <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
                หากอีเมล <span className="font-medium text-gray-800 dark:text-gray-200">{email}</span>
              </p>
              <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                มีในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปให้แล้ว<br />
                กรุณาตรวจสอบกล่องจดหมายของคุณ (รวมถึงโฟลเดอร์ Spam)
              </p>
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 mb-6 dark:bg-amber-900/20 dark:border-amber-800">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  ⏰ ลิงก์จะหมดอายุภายใน <strong>1 ชั่วโมง</strong>
                </p>
              </div>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                ส่งอีกครั้ง
              </button>
            </div>
          ) : (
            /* Form state */
            <>
              <div className="mb-6">
                <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                  ลืมรหัสผ่าน?
                </h2>
                <p className="text-sm text-gray-500">
                  กรอกอีเมลที่ลงทะเบียนไว้ เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้คุณ
                </p>
              </div>

              {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    อีเมล
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-11 pr-4 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:shadow-blue-500/40 disabled:opacity-50"
                >
                  {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                  {loading ? "กำลังส่ง..." : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
                </button>
              </form>
            </>
          )}

          <div className="mt-6 flex justify-center">
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              กลับหน้าเข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
