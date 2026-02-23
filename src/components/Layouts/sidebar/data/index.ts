import * as Icons from "../icons";

export type UserRole = "super_admin" | "school_admin" | "staff" | "nurse";

export const NAV_DATA = [
  {
    label: "เมนูหลัก",
    roles: ["super_admin", "school_admin", "staff", "nurse"] as UserRole[],
    items: [
      {
        title: "แดชบอร์ด",
        url: "/dashboard",
        icon: Icons.HomeIcon,
        roles: ["super_admin", "school_admin"] as UserRole[],
        items: [],
      },
      {
        title: "ห้องพยาบาล",
        icon: Icons.Table,
        roles: ["school_admin", "staff", "nurse"] as UserRole[],
        items: [
          { title: "รายการห้อง", url: "/dashboard/rooms" },
          { title: "บันทึกการใช้ห้อง", url: "/dashboard/visits" },
        ],
      },
      {
        title: "การรักษา",
        icon: Icons.Alphabet,
        roles: ["school_admin", "staff", "nurse"] as UserRole[],
        items: [
          { title: "บันทึกการรักษา", url: "/dashboard/treatments" },
        ],
      },
      {
        title: "นักเรียน",
        url: "/dashboard/students",
        icon: Icons.User,
        roles: ["school_admin", "staff", "nurse"] as UserRole[],
        items: [],
      },
    ],
  },
  {
    label: "รายงาน",
    roles: ["school_admin", "staff", "nurse"] as UserRole[],
    items: [
      {
        title: "สถิติ",
        icon: Icons.PieChart,
        roles: ["school_admin", "staff", "nurse"] as UserRole[],
        items: [
          { title: "ภาพรวม", url: "/dashboard/stats" },
          { title: "ส่งออกรายงาน", url: "/dashboard/reports" },
        ],
      },
    ],
  },
  {
    label: "จัดการระบบ",
    roles: ["super_admin", "school_admin"] as UserRole[],
    items: [
      {
        title: "จัดการผู้ใช้",
        url: "/dashboard/users",
        icon: Icons.User,
        roles: ["super_admin", "school_admin"] as UserRole[],
        items: [],
      },
      {
        title: "จัดการโรงเรียน",
        url: "/dashboard/schools",
        icon: Icons.FourCircle,
        roles: ["super_admin"] as UserRole[],
        items: [],
      },
      {
        title: "ประเภทอาการ",
        url: "/dashboard/symptoms",
        icon: Icons.Calendar,
        roles: ["school_admin"] as UserRole[],
        items: [],
      },
    ],
  },
];
