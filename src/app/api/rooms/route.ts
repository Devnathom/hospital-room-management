import { NextRequest } from "next/server";
import { query, execute, queryOne } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  const schoolId = session.role === "super_admin"
    ? new URL(request.url).searchParams.get("school_id") || null
    : session.schoolId;

  if (!schoolId) return errorResponse("กรุณาระบุโรงเรียน");

  const rooms = await query(
    "SELECT * FROM health_rooms WHERE school_id = ? ORDER BY name",
    [schoolId]
  );
  return successResponse(rooms);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();
  if (!["super_admin", "school_admin"].includes(session.role)) return forbiddenResponse();

  try {
    const { name, location, capacity, description } = await request.json();
    if (!name) return errorResponse("กรุณาระบุชื่อห้อง");

    const schoolId = session.schoolId;
    if (!schoolId && session.role !== "super_admin") return forbiddenResponse();

    const result = await execute(
      "INSERT INTO health_rooms (school_id, name, location, capacity, description) VALUES (?, ?, ?, ?, ?)",
      [schoolId, name, location || null, capacity || 1, description || null]
    );

    return successResponse({ id: result.insertId, message: "เพิ่มห้องพยาบาลสำเร็จ" }, 201);
  } catch (error) {
    return errorResponse("เกิดข้อผิดพลาด", 500);
  }
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();
  if (!["super_admin", "school_admin"].includes(session.role)) return forbiddenResponse();

  try {
    const { id, name, location, capacity, description, isActive } = await request.json();
    if (!id) return errorResponse("กรุณาระบุ id");

    if (session.role !== "super_admin") {
      const room = await queryOne<any>("SELECT school_id FROM health_rooms WHERE id = ?", [id]);
      if (!room || room.school_id !== session.schoolId) return forbiddenResponse();
    }

    await execute(
      "UPDATE health_rooms SET name = ?, location = ?, capacity = ?, description = ?, is_active = ? WHERE id = ?",
      [name, location, capacity, description, isActive ?? true, id]
    );
    return successResponse({ message: "อัปเดตห้องพยาบาลสำเร็จ" });
  } catch (error) {
    return errorResponse("เกิดข้อผิดพลาด", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();
  if (!["super_admin", "school_admin"].includes(session.role)) return forbiddenResponse();

  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return errorResponse("กรุณาระบุ id");

    if (session.role !== "super_admin") {
      const room = await queryOne<any>("SELECT school_id FROM health_rooms WHERE id = ?", [id]);
      if (!room || room.school_id !== session.schoolId) return forbiddenResponse();
    }

    await execute("DELETE FROM health_rooms WHERE id = ?", [id]);
    return successResponse({ message: "ลบห้องพยาบาลสำเร็จ" });
  } catch (error) {
    return errorResponse("เกิดข้อผิดพลาด", 500);
  }
}
