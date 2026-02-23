import { NextRequest } from "next/server";
import crypto from "crypto";
import { queryOne, query } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return errorResponse("กรุณากรอกอีเมล", 400);
    }

    const user = await queryOne<any>(
      "SELECT id, email, full_name, is_active FROM users WHERE email = ?",
      [email]
    );

    // Always return success to prevent email enumeration
    if (!user || !user.is_active) {
      return successResponse({ message: "หากอีเมลนี้มีในระบบ เราจะส่งลิงก์รีเซ็ตรหัสผ่านไปให้" });
    }

    // Generate secure token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    const expiresAtStr = expiresAt.toISOString().slice(0, 19).replace("T", " ");

    await query(
      "UPDATE users SET reset_token = ?, reset_token_expires_at = ? WHERE id = ?",
      [resetToken, expiresAtStr, user.id]
    );

    await sendPasswordResetEmail(user.email, user.full_name, resetToken);

    return successResponse({ message: "หากอีเมลนี้มีในระบบ เราจะส่งลิงก์รีเซ็ตรหัสผ่านไปให้" });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return errorResponse("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง", 500);
  }
}
