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

  const { searchParams } = new URL(request.url);
  const dateFrom = searchParams.get("date_from");
  const dateTo = searchParams.get("date_to");
  const status = searchParams.get("status");
  const academicYear = searchParams.get("academic_year");

  let sql = `SELECT rv.*, s.full_name as student_name, s.class_name, s.student_code,
    hr.name as room_name, u.full_name as staff_name, sc.name as symptom_category_name
    FROM room_visits rv
    LEFT JOIN students s ON rv.student_id = s.id
    LEFT JOIN health_rooms hr ON rv.health_room_id = hr.id
    LEFT JOIN users u ON rv.staff_id = u.id
    LEFT JOIN symptom_categories sc ON rv.symptom_category_id = sc.id
    WHERE rv.school_id = ?`;
  const params: any[] = [schoolId];

  if (dateFrom) { sql += " AND rv.visit_date >= ?"; params.push(dateFrom); }
  if (dateTo) { sql += " AND rv.visit_date <= ?"; params.push(dateTo); }
  if (status) { sql += " AND rv.status = ?"; params.push(status); }
  if (academicYear) { sql += " AND rv.academic_year = ?"; params.push(academicYear); }

  sql += " ORDER BY rv.visit_date DESC, rv.visit_time DESC";
  const visits = await query(sql, params);
  return successResponse(visits);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { healthRoomId, studentId, visitDate, visitTime, symptomCategoryId, symptoms, temperature, bloodPressure, treatment, medication, notes, status: visitStatus } = body;

    if (!healthRoomId || !studentId || !visitDate || !visitTime || !symptoms) {
      return errorResponse("กรุณากรอกข้อมูลให้ครบถ้วน");
    }

    const schoolId = session.schoolId;
    if (!schoolId) return forbiddenResponse();

    // Verify room and student belong to this school (prevents cross-school injection)
    const room = await queryOne<any>("SELECT school_id FROM health_rooms WHERE id = ?", [healthRoomId]);
    if (!room || room.school_id !== schoolId) return forbiddenResponse("ห้องพยาบาลนี้ไม่ได้อยู่ในโรงเรียนของคุณ");

    const student = await queryOne<any>("SELECT school_id FROM students WHERE id = ?", [studentId]);
    if (!student || student.school_id !== schoolId) return forbiddenResponse("นักเรียนคนนี้ไม่ได้อยู่ในโรงเรียนของคุณ");

    // Calculate academic_year from visit_date (Thai BE, year starts May)
    const d = new Date(visitDate);
    const ce = d.getFullYear();
    const month = d.getMonth() + 1;
    const academicYearBE = String((month >= 5 ? ce : ce - 1) + 543);

    const result = await execute(
      `INSERT INTO room_visits (school_id, health_room_id, student_id, staff_id, visit_date, visit_time, symptom_category_id, symptoms, temperature, blood_pressure, treatment, medication, notes, status, academic_year)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [schoolId, healthRoomId, studentId, session.userId, visitDate, visitTime, symptomCategoryId || null, symptoms, temperature || null, bloodPressure || null, treatment || null, medication || null, notes || null, visitStatus || "in_room", academicYearBE]
    );

    return successResponse({ id: result.insertId, message: "บันทึกการเข้าใช้ห้องพยาบาลสำเร็จ" }, 201);
  } catch (error) {
    console.error("Create visit error:", error);
    return errorResponse("เกิดข้อผิดพลาด", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return errorResponse("กรุณาระบุ id");

  if (session.role !== "super_admin") {
    const visit = await queryOne<any>("SELECT school_id FROM room_visits WHERE id = ?", [id]);
    if (!visit || visit.school_id !== session.schoolId) return forbiddenResponse();
  }

  try {
    await execute("DELETE FROM treatment_records WHERE visit_id = ?", [id]);
    await execute("DELETE FROM room_visits WHERE id = ?", [id]);
    return successResponse({ message: "ลบรายการสำเร็จ" });
  } catch (error) {
    return errorResponse("เกิดข้อผิดพลาดในการลบ", 500);
  }
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { id, leaveTime, treatment, medication, notes, status: visitStatus } = body;

    if (!id) return errorResponse("กรุณาระบุ id");

    if (session.role !== "super_admin") {
      const visit = await queryOne<any>("SELECT school_id FROM room_visits WHERE id = ?", [id]);
      if (!visit || visit.school_id !== session.schoolId) return forbiddenResponse();
    }

    await execute(
      "UPDATE room_visits SET leave_time = ?, treatment = ?, medication = ?, notes = ?, status = ? WHERE id = ?",
      [leaveTime || null, treatment, medication, notes, visitStatus, id]
    );
    return successResponse({ message: "อัปเดตข้อมูลสำเร็จ" });
  } catch (error) {
    return errorResponse("เกิดข้อผิดพลาด", 500);
  }
}
