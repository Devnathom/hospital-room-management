import { NextRequest } from "next/server";
import { query, execute } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  if (session.role === "super_admin") {
    let sql = "SELECT * FROM schools";
    const params: any[] = [];
    if (status) {
      sql += " WHERE status = ?";
      params.push(status);
    }
    sql += " ORDER BY created_at DESC";
    const schools = await query(sql, params);
    return successResponse(schools);
  }

  if (session.schoolId) {
    const schools = await query("SELECT * FROM schools WHERE id = ?", [session.schoolId]);
    return successResponse(schools);
  }

  return forbiddenResponse();
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();
  if (session.role !== "super_admin") return forbiddenResponse();

  try {
    const { id, status } = await request.json();
    if (!id || !status) return errorResponse("กรุณาระบุ id และ status");

    await execute("UPDATE schools SET status = ? WHERE id = ?", [status, id]);
    return successResponse({ message: "อัปเดตสถานะสำเร็จ" });
  } catch (error) {
    return errorResponse("เกิดข้อผิดพลาด", 500);
  }
}
