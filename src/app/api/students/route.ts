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

  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const academicYear = url.searchParams.get("academic_year") || "";
  const showInactive = url.searchParams.get("show_inactive") === "1";

  let sql = "SELECT * FROM students WHERE school_id = ?";
  const params: any[] = [schoolId];

  if (!showInactive) {
    sql += " AND (is_active = 1 OR is_active IS NULL)";
  }
  if (academicYear) {
    sql += " AND academic_year = ?";
    params.push(academicYear);
  }
  if (search) {
    sql += " AND (full_name LIKE ? OR student_code LIKE ? OR class_name LIKE ? OR grade_level LIKE ?)";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  sql += " ORDER BY grade_level, class_name, full_name";
  const students = await query(sql, params);
  return successResponse(students);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { studentCode, fullName, className, gradeLevel, dateOfBirth, gender, bloodType, allergies, parentPhone, parentName, academicYear } = body;

    if (!fullName) return errorResponse("กรุณาระบุชื่อนักเรียน");

    const schoolId = session.schoolId;
    if (!schoolId) return forbiddenResponse();

    const result = await execute(
      "INSERT INTO students (school_id, student_code, full_name, class_name, grade_level, date_of_birth, gender, blood_type, allergies, parent_phone, parent_name, academic_year) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [schoolId, studentCode || null, fullName, className || null, gradeLevel || null, dateOfBirth || null, gender || null, bloodType || null, allergies || null, parentPhone || null, parentName || null, academicYear || null]
    );

    return successResponse({ id: result.insertId, message: "เพิ่มนักเรียนสำเร็จ" }, 201);
  } catch (error) {
    return errorResponse("เกิดข้อผิดพลาด", 500);
  }
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { id, studentCode, fullName, className, gradeLevel, dateOfBirth, gender, bloodType, allergies, parentPhone, parentName, academicYear } = body;

    if (!id) return errorResponse("กรุณาระบุ id");

    if (session.role !== "super_admin") {
      const student = await queryOne<any>("SELECT school_id FROM students WHERE id = ?", [id]);
      if (!student || student.school_id !== session.schoolId) return forbiddenResponse();
    }

    await execute(
      "UPDATE students SET student_code = ?, full_name = ?, class_name = ?, grade_level = ?, date_of_birth = ?, gender = ?, blood_type = ?, allergies = ?, parent_phone = ?, parent_name = ?, academic_year = ? WHERE id = ?",
      [studentCode, fullName, className, gradeLevel, dateOfBirth || null, gender, bloodType, allergies, parentPhone, parentName, academicYear || null, id]
    );
    return successResponse({ message: "อัปเดตข้อมูลนักเรียนสำเร็จ" });
  } catch (error) {
    return errorResponse("เกิดข้อผิดพลาด", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return errorResponse("กรุณาระบุ id");

    if (session.role !== "super_admin") {
      const student = await queryOne<any>("SELECT school_id FROM students WHERE id = ?", [id]);
      if (!student || student.school_id !== session.schoolId) return forbiddenResponse();
    }

    await execute("DELETE FROM students WHERE id = ?", [id]);
    return successResponse({ message: "ลบนักเรียนสำเร็จ" });
  } catch (error) {
    return errorResponse("เกิดข้อผิดพลาด", 500);
  }
}
