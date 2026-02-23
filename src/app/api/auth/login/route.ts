import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { verifyPassword, createToken } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log("LOGIN_DEBUG email:", email, "| pw_len:", password?.length, "| pw_chars:", JSON.stringify(password));

    if (!email || !password) {
      return errorResponse("กรุณากรอกอีเมลและรหัสผ่าน", 400);
    }

    const user = await queryOne<any>(
      "SELECT u.*, s.name as school_name, s.status as school_status FROM users u LEFT JOIN schools s ON u.school_id = s.id WHERE u.email = ?",
      [email]
    );

    if (!user) {
      return errorResponse("อีเมลหรือรหัสผ่านไม่ถูกต้อง", 401);
    }

    if (!user.is_active) {
      return errorResponse("บัญชีถูกระงับการใช้งาน", 403);
    }

    // Check school status for non-super-admin users
    if (user.role !== "super_admin" && user.school_id) {
      if (user.school_status !== "approved") {
        return errorResponse("โรงเรียนยังไม่ได้รับการอนุมัติ กรุณารอการอนุมัติจากผู้ดูแลระบบ", 403);
      }
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return errorResponse("อีเมลหรือรหัสผ่านไม่ถูกต้อง", 401);
    }

    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      schoolId: user.school_id,
      fullName: user.full_name,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          schoolId: user.school_id,
          schoolName: user.school_name,
        },
      },
    });

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return errorResponse("เกิดข้อผิดพลาดในการเข้าสู่ระบบ", 500);
  }
}
