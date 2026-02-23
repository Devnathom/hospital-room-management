"use client";

import Link from "next/link";
import { Heart, BarChart3, ClipboardPlus, Stethoscope, FileText, GraduationCap, Activity } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">ระบบห้องพยาบาล</h1>
              <p className="text-xs text-gray-500">Hospital Room Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/signin"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              เข้าสู่ระบบ
            </Link>
            <Link
              href="/auth/register-school"
              className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition hover:shadow-blue-500/40"
            >
              สมัครใช้งาน
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-blue-200/30 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            <Activity className="h-4 w-4" />
            <span>ดูแลสุขภาพนักเรียนอย่างเป็นระบบ</span>
          </div>
          <h2 className="mb-6 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
            ระบบบริหารจัดการ
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ห้องพยาบาลโรงเรียน
            </span>
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            บันทึกข้อมูลการเข้าใช้ห้องพยาบาล ประวัติการรักษา สถิติสุขภาพนักเรียน
            <br className="hidden sm:block" />
            ใช้งานง่าย ดูข้อมูลได้ทันที ออกรายงานสรุปเป็น PDF
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/auth/register-school"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-blue-500/25 transition hover:shadow-blue-500/40 hover:brightness-110"
            >
              <ClipboardPlus className="h-5 w-5" />
              เริ่มต้นใช้งานฟรี
            </Link>
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-8 py-4 text-lg font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              เข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h3 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">ฟีเจอร์หลัก</h3>
            <p className="text-gray-600 dark:text-gray-400">ครบทุกฟังก์ชันที่ห้องพยาบาลโรงเรียนต้องการ</p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: ClipboardPlus, title: "บันทึกการใช้ห้องพยาบาล", desc: "บันทึกข้อมูลนักเรียนที่เข้าใช้ห้องพยาบาล วันที่ เวลา อาการ และการรักษาเบื้องต้น", color: "blue" },
              { icon: Stethoscope, title: "ประวัติการรักษา", desc: "เก็บประวัติการรักษาของนักเรียนแต่ละคน ยาที่ให้ รายละเอียดการรักษา และการนัดติดตาม", color: "emerald" },
              { icon: BarChart3, title: "สถิติและกราฟ", desc: "ดูสถิติการใช้ห้องพยาบาล ประเภทอาการที่พบบ่อย แสดงเป็นกราฟ เข้าใจง่าย", color: "violet" },
              { icon: FileText, title: "ออกรายงาน PDF", desc: "สร้างรายงานสรุปสำหรับผู้บริหาร ส่งออกเป็น PDF พร้อมตารางและข้อมูลครบถ้วน", color: "amber" },
              { icon: GraduationCap, title: "จัดการข้อมูลนักเรียน", desc: "นำเข้านักเรียนจาก CSV เลื่อนชั้นอัตโนมัติ กรองตามห้อง ชั้น ปีการศึกษา", color: "rose" },
              { icon: Heart, title: "ใช้งานง่าย ฟรี", desc: "สมัครใช้งานได้ทันที ไม่มีค่าใช้จ่าย ออกแบบมาให้ใช้งานง่าย เหมาะกับทุกโรงเรียน", color: "sky" },
            ].map((feature, i) => {
              const colorMap: Record<string, string> = {
                blue: "bg-blue-100 text-blue-600 group-hover:bg-blue-600 dark:bg-blue-900/30",
                emerald: "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 dark:bg-emerald-900/30",
                violet: "bg-violet-100 text-violet-600 group-hover:bg-violet-600 dark:bg-violet-900/30",
                amber: "bg-amber-100 text-amber-600 group-hover:bg-amber-600 dark:bg-amber-900/30",
                rose: "bg-rose-100 text-rose-600 group-hover:bg-rose-600 dark:bg-rose-900/30",
                sky: "bg-sky-100 text-sky-600 group-hover:bg-sky-600 dark:bg-sky-900/30",
              };
              return (
                <div key={i} className="group rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-lg hover:-translate-y-1 dark:border-gray-700 dark:bg-gray-800">
                  <div className={`mb-4 inline-flex rounded-xl p-3 transition group-hover:text-white ${colorMap[feature.color]}`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h4 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">{feature.title}</h4>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-12 text-center shadow-2xl">
            <h3 className="mb-4 text-3xl font-bold text-white">พร้อมเริ่มใช้งานแล้วหรือยัง?</h3>
            <p className="mb-8 text-lg text-blue-100">สมัครใช้งานฟรี เริ่มบันทึกข้อมูลได้ทันที</p>
            <Link
              href="/auth/register-school"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-lg transition hover:bg-blue-50"
            >
              <ClipboardPlus className="h-5 w-5" />
              สมัครใช้งานฟรี
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/50 px-4 py-8 dark:border-gray-700 dark:bg-gray-900/50 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600">
              <Heart className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">ระบบห้องพยาบาลโรงเรียน</span>
          </div>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Hospital Room Management System
          </p>
        </div>
      </footer>
    </div>
  );
}
