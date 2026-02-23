"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2, AlertCircle } from "lucide-react";

export default function OAuthCompletePage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    async function exchange() {
      try {
        const res = await fetch("/api/auth/oauth-token", { method: "POST" });
        const data = await res.json();

        if (!data.success) {
          setError(data.error || "เกิดข้อผิดพลาด");
          return;
        }

        const role = data.data?.role;
        if (role === "staff" || role === "nurse") {
          router.replace("/dashboard/visits");
        } else {
          router.replace("/dashboard");
        }
      } catch {
        setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
      }
    }

    exchange();
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg mb-6">
        <Heart className="h-8 w-8 text-white" />
      </div>

      {error ? (
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">เข้าสู่ระบบไม่สำเร็จ</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => router.replace("/auth/signin")}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            กลับหน้าเข้าสู่ระบบ
          </button>
        </div>
      ) : (
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-600 mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            กำลังเข้าสู่ระบบ...
          </h2>
          <p className="text-sm text-gray-500 mt-1">กรุณารอสักครู่</p>
        </div>
      )}
    </div>
  );
}
