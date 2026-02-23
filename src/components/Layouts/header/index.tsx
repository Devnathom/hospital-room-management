"use client";

import Link from "next/link";
import { useSidebarContext } from "../sidebar/sidebar-context";
import { MenuIcon } from "./icons";
import { ThemeToggleSwitch } from "./theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { Heart, LogOut } from "lucide-react";

export function Header() {
  const { toggleSidebar, isMobile } = useSidebarContext();
  const { user, logout } = useAuth();

  const roleLabels: Record<string, string> = {
    super_admin: "Super Admin",
    school_admin: "ผู้ดูแลโรงเรียน",
    staff: "เจ้าหน้าที่",
    nurse: "พยาบาล",
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stroke bg-white px-4 py-4 shadow-1 dark:border-stroke-dark dark:bg-gray-dark md:px-5 2xl:px-10">
      <button
        onClick={toggleSidebar}
        className="rounded-lg border px-1.5 py-1 dark:border-stroke-dark dark:bg-[#020D1A] hover:dark:bg-[#FFFFFF1A] lg:hidden"
      >
        <MenuIcon />
        <span className="sr-only">Toggle Sidebar</span>
      </button>

      {isMobile && (
        <Link href="/dashboard" className="ml-2 flex items-center gap-2">
          <Heart className="h-6 w-6 text-blue-600" />
        </Link>
      )}

      <div className="max-xl:hidden">
        <h1 className="mb-0.5 text-lg font-bold text-dark dark:text-white">
          ระบบห้องพยาบาลโรงเรียน
        </h1>
        <p className="text-sm font-medium text-gray-500">Hospital Room Management System</p>
      </div>

      <div className="flex flex-1 items-center justify-end gap-3 min-[375px]:gap-4">
        <ThemeToggleSwitch />

        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-dark dark:text-white">{user.fullName}</p>
              <p className="text-xs text-gray-500">{roleLabels[user.role] || user.role}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 transition hover:bg-red-50 hover:border-red-300 hover:text-red-600 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              title="ออกจากระบบ"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
