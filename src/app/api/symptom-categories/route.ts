import { NextRequest } from "next/server";
import { query, execute } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  const schoolId = session.role === "super_admin"
    ? new URL(request.url).searchParams.get("school_id") || null
    : session.schoolId;

  if (!schoolId) return errorResponse("กรุณาระบุโรงเรียน");

  const categories = await query("SELECT * FROM symptom_categories WHERE school_id = ? ORDER BY name", [schoolId]);
  return successResponse(categories);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();
  if (!["super_admin", "school_admin"].includes(session.role)) return forbiddenResponse();

  try {
    const { name, description } = await request.json();
    if (!name) return errorResponse("กรุณาระบุชื่อประเภทอาการ");

    const schoolId = session.schoolId;
    if (!schoolId) return forbiddenResponse();

    const result = await execute(
      "INSERT INTO symptom_categories (school_id, name, description) VALUES (?, ?, ?)",
      [schoolId, name, description || null]
    );
    return successResponse({ id: result.insertId, message: "เพิ่มประเภทอาการสำเร็จ" }, 201);
  } catch (error) {
    return errorResponse("เกิดข้อผิดพลาด", 500);
  }
}
