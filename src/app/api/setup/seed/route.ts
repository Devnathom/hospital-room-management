import { NextResponse } from "next/server";
import { execute, queryOne } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "ไม่อนุญาตใน production" }, { status: 403 });
  }

  try {
    const existing = await queryOne("SELECT id FROM users WHERE email = ?", ["admin@hospital-room.com"]);

    const passwordHash = await hashPassword("admin123");

    if (existing) {
      await execute("UPDATE users SET password_hash = ? WHERE email = ?", [passwordHash, "admin@hospital-room.com"]);
    } else {
      await execute(
        `INSERT INTO users (school_id, username, email, password_hash, full_name, role, is_active)
         VALUES (NULL, 'superadmin', 'admin@hospital-room.com', ?, 'Super Administrator', 'super_admin', TRUE)`,
        [passwordHash]
      );
    }

    return NextResponse.json({
      success: true,
      message: "Super Admin seeded",
      credentials: { email: "admin@hospital-room.com", password: "admin123" },
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
