import { NextRequest } from "next/server";
import { query, execute } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/lib/api-response";

// Grade progression map
const GRADE_NEXT: Record<string, string> = {
  "อ.1": "อ.2", "อ.2": "อ.3", "อ.3": "ป.1",
  "ป.1": "ป.2", "ป.2": "ป.3", "ป.3": "ป.4",
  "ป.4": "ป.5", "ป.5": "ป.6", "ป.6": "ม.1",
  "ม.1": "ม.2", "ม.2": "ม.3", "ม.3": "ม.4",
  "ม.4": "ม.5", "ม.5": "ม.6",
};

// Default graduation at ม.6 only; schools can override via maxGrade parameter

function promoteGradeLevel(grade: string, maxGrade: string): { next: string | null; graduated: boolean } {
  const trimmed = (grade || "").trim();
  // If this grade IS the school's max grade → graduate
  if (trimmed === maxGrade) return { next: null, graduated: true };
  // Normal promotion
  if (GRADE_NEXT[trimmed]) return { next: GRADE_NEXT[trimmed], graduated: false };
  // Unknown grade — keep as-is
  return { next: trimmed, graduated: false };
}

function promoteClassName(className: string, oldGrade: string, newGrade: string | null): string {
  if (!newGrade || !className) return className || "";
  // Replace grade part in class_name e.g. "ม.3/1" → "ม.4/1"
  return className.replace(oldGrade, newGrade);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();
  if (!session.schoolId) return forbiddenResponse();
  if (!["school_admin", "super_admin"].includes(session.role)) return forbiddenResponse();

  try {
    const body = await request.json();
    const { fromAcademicYear, toAcademicYear, maxGrade } = body;

    if (!fromAcademicYear || !toAcademicYear) {
      return errorResponse("กรุณาระบุปีการศึกษาต้นทางและปลายทาง");
    }

    // Default max grade is ม.6; schools can set ป.6, ม.3 etc.
    const effectiveMaxGrade = maxGrade || "ม.6";

    const schoolId = session.schoolId;

    // Fetch all active students
    const students = await query<any>(
      "SELECT id, grade_level, class_name FROM students WHERE school_id = ? AND is_active = 1",
      [schoolId]
    );

    let promoted = 0;
    let graduated = 0;
    let unchanged = 0;

    for (const s of students) {
      const { next, graduated: isGrad } = promoteGradeLevel(s.grade_level || "", effectiveMaxGrade);

      if (isGrad) {
        // Mark graduated students as inactive
        await execute(
          "UPDATE students SET is_active = 0, academic_year = ? WHERE id = ?",
          [fromAcademicYear, s.id]
        );
        graduated++;
      } else if (next && next !== s.grade_level) {
        const newClassName = promoteClassName(s.class_name || "", s.grade_level || "", next);
        await execute(
          "UPDATE students SET grade_level = ?, class_name = ?, academic_year = ? WHERE id = ?",
          [next, newClassName, toAcademicYear, s.id]
        );
        promoted++;
      } else {
        // Update academic_year only
        await execute("UPDATE students SET academic_year = ? WHERE id = ?", [toAcademicYear, s.id]);
        unchanged++;
      }
    }

    return successResponse({
      promoted,
      graduated,
      unchanged,
      message: `เลื่อนชั้นสำเร็จ: เลื่อน ${promoted} คน, จบการศึกษา ${graduated} คน, คงชั้น ${unchanged} คน`,
    });
  } catch (error: any) {
    return errorResponse("เกิดข้อผิดพลาด: " + error.message, 500);
  }
}
