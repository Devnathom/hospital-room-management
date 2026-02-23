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

  const studentId = new URL(request.url).searchParams.get("student_id");

  let sql = `SELECT tr.*, s.full_name as student_name, s.class_name, u.full_name as treated_by_name,
    rv.visit_date, rv.symptoms
    FROM treatment_records tr
    LEFT JOIN students s ON tr.student_id = s.id
    LEFT JOIN users u ON tr.treated_by = u.id
    LEFT JOIN room_visits rv ON tr.visit_id = rv.id
    WHERE tr.school_id = ?`;
  const params: any[] = [schoolId];

  if (studentId) { sql += " AND tr.student_id = ?"; params.push(studentId); }

  sql += " ORDER BY tr.created_at DESC";
  const treatments = await query(sql, params);
  return successResponse(treatments);
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return errorResponse("กรุณาระบุ id");

  if (session.role !== "super_admin") {
    const rec = await queryOne<any>("SELECT school_id FROM treatment_records WHERE id = ?", [id]);
    if (!rec || rec.school_id !== session.schoolId) return forbiddenResponse();
  }

  try {
    await execute("DELETE FROM treatment_records WHERE id = ?", [id]);
    return successResponse({ message: "ลบบันทึกการรักษาสำเร็จ" });
  } catch (error) {
    return errorResponse("เกิดข้อผิดพลาดในการลบ", 500);
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { visitId, studentId, treatmentType, treatmentDetail, medicationGiven, followUpRequired, followUpDate, notes } = body;

    if (!visitId || !studentId || !treatmentType) {
      return errorResponse("กรุณากรอกข้อมูลให้ครบถ้วน");
    }

    const schoolId = session.schoolId;
    if (!schoolId) return forbiddenResponse();

    // Verify visit and student belong to this school (prevents cross-school injection)
    const visit = await queryOne<any>("SELECT school_id FROM room_visits WHERE id = ?", [visitId]);
    if (!visit || visit.school_id !== schoolId) return forbiddenResponse("รายการนี้ไม่ได้อยู่ในโรงเรียนของคุณ");

    const student = await queryOne<any>("SELECT school_id FROM students WHERE id = ?", [studentId]);
    if (!student || student.school_id !== schoolId) return forbiddenResponse("นักเรียนคนนี้ไม่ได้อยู่ในโรงเรียนของคุณ");

    const result = await execute(
      `INSERT INTO treatment_records (school_id, visit_id, student_id, treated_by, treatment_type, treatment_detail, medication_given, follow_up_required, follow_up_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [schoolId, visitId, studentId, session.userId, treatmentType, treatmentDetail || null, medicationGiven || null, followUpRequired || false, followUpDate || null, notes || null]
    );

    // Update visit status to treated
    await execute("UPDATE room_visits SET status = 'treated' WHERE id = ?", [visitId]);

    return successResponse({ id: result.insertId, message: "บันทึกการรักษาสำเร็จ" }, 201);
  } catch (error) {
    console.error("Create treatment error:", error);
    return errorResponse("เกิดข้อผิดพลาด", 500);
  }
}
