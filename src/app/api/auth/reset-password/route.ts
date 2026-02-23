import { NextRequest } from "next/server";
import { queryOne, query } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return errorResponse("ข้อมูลไม่ครบถ้วน", 400);
    }

    if (password.length < 8) {
      return errorResponse("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร", 400);
    }

    const user = await queryOne<any>(
      `SELECT id, email, reset_token_expires_at
       FROM users
       WHERE reset_token = ? AND reset_token_expires_at > NOW()`,
      [token]
    );

    if (!user) {
      return errorResponse("ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว", 400);
    }

    const passwordHash = await hashPassword(password);

    await query(
      "UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires_at = NULL WHERE id = ?",
      [passwordHash, user.id]
    );

    return successResponse({ message: "รีเซ็ตรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่" });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return errorResponse("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง", 500);
  }
}
