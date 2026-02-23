import { NextRequest } from "next/server";
import { query, execute, queryOne } from "@/lib/db";
import { getSession, hashPassword } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  if (session.role === "super_admin") {
    const users = await query(
      "SELECT u.id, u.school_id, u.username, u.email, u.full_name, u.role, u.phone, u.is_active, u.created_at, s.name as school_name FROM users u LEFT JOIN schools s ON u.school_id = s.id ORDER BY u.created_at DESC"
    );
    return successResponse(users);
  }

  if (!["school_admin", "staff", "nurse"].includes(session.role)) return forbiddenResponse();

  const users = await query(
    "SELECT id, school_id, username, email, full_name, role, phone, is_active, created_at FROM users WHERE school_id = ? ORDER BY created_at DESC",
    [session.schoolId]
  );
  return successResponse(users);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();
  if (!["super_admin", "school_admin"].includes(session.role)) return forbiddenResponse();

  try {
    const body = await request.json();
    const { email, password, fullName, role, phone, schoolId } = body;

    if (!email || !password || !fullName || !role) {
      return errorResponse("กรุณากรอกข้อมูลให้ครบ");
    }

    const existing = await queryOne("SELECT id FROM users WHERE email = ?", [email]);
    if (existing) return errorResponse("อีเมลนี้ถูกใช้งานแล้ว");

    const targetSchoolId = session.role === "super_admin" ? schoolId : session.schoolId;
    const passwordHash = await hashPassword(password);
    const username = email.split("@")[0];

    const result = await execute(
      "INSERT INTO users (school_id, username, email, password_hash, full_name, role, phone) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [targetSchoolId, username, email, passwordHash, fullName, role, phone || null]
    );

    return successResponse({ id: result.insertId, message: "เพิ่มผู้ใช้สำเร็จ" }, 201);
  } catch (error) {
    console.error("Create user error:", error);
    return errorResponse("เกิดข้อผิดพลาด", 500);
  }
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();
  if (!["super_admin", "school_admin"].includes(session.role)) return forbiddenResponse();

  try {
    const body = await request.json();
    const { id, fullName, role, phone, isActive, password } = body;

    if (!id) return errorResponse("กรุณาระบุ id");

    // Verify school access
    if (session.role !== "super_admin") {
      const user = await queryOne<any>("SELECT school_id FROM users WHERE id = ?", [id]);
      if (!user || user.school_id !== session.schoolId) return forbiddenResponse();
    }

    let sql = "UPDATE users SET full_name = ?, role = ?, phone = ?, is_active = ? WHERE id = ?";
    let params: any[] = [fullName, role, phone, isActive, id];

    if (password) {
      const passwordHash = await hashPassword(password);
      sql = "UPDATE users SET full_name = ?, role = ?, phone = ?, is_active = ?, password_hash = ? WHERE id = ?";
      params = [fullName, role, phone, isActive, passwordHash, id];
    }

    await execute(sql, params);
    return successResponse({ message: "อัปเดตผู้ใช้สำเร็จ" });
  } catch (error) {
    return errorResponse("เกิดข้อผิดพลาด", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();
  if (!["super_admin", "school_admin"].includes(session.role)) return forbiddenResponse();

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return errorResponse("กรุณาระบุ id");

    if (session.role !== "super_admin") {
      const user = await queryOne<any>("SELECT school_id FROM users WHERE id = ?", [id]);
      if (!user || user.school_id !== session.schoolId) return forbiddenResponse();
    }

    await execute("DELETE FROM users WHERE id = ?", [id]);
    return successResponse({ message: "ลบผู้ใช้สำเร็จ" });
  } catch (error) {
    return errorResponse("เกิดข้อผิดพลาด", 500);
  }
}
