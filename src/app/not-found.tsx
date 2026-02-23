import Link from "next/link";
import { Home, AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-red-100 p-6 dark:bg-red-900/20">
            <AlertCircle className="h-16 w-16 text-red-500" />
          </div>
        </div>
        <h1 className="mb-2 text-6xl font-extrabold text-gray-900 dark:text-white">404</h1>
        <h2 className="mb-4 text-2xl font-bold text-gray-700 dark:text-gray-300">ไม่พบหน้าที่ต้องการ</h2>
        <p className="mb-8 text-gray-500 dark:text-gray-400">
          หน้าที่คุณกำลังมองหาอาจถูกลบออก เปลี่ยนชื่อ หรือไม่มีอยู่ในระบบ
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:shadow-blue-500/40"
          >
            <Home className="h-5 w-5" />
            กลับหน้าแดชบอร์ด
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            หน้าแรก
          </Link>
        </div>
      </div>
    </div>
  );
}
