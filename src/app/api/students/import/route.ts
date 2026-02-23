import { NextRequest } from "next/server";
import { execute } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/lib/api-response";
import { toCEYear } from "@/lib/thai-date";

function parseThaiDate(raw: string): string | null {
  if (!raw || !raw.trim()) return null;
  const s = raw.trim();

  // Try ISO format YYYY-MM-DD (CE)
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // Try DD/MM/YYYY — auto-detect BE vs CE by year range
  const m = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (m) {
    const day = m[1].padStart(2, "0");
    const month = m[2].padStart(2, "0");
    const year = parseInt(m[3]);
    const ceYear = year > 2400 ? toCEYear(year) : year;
    return `${ceYear}-${month}-${day}`;
  }
  return null;
}

const GENDER_MAP: Record<string, string> = {
  "ชาย": "male", "male": "male", "m": "male",
  "หญิง": "female", "female": "female", "f": "female",
  "อื่นๆ": "other", "other": "other",
};

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();
  if (!session.schoolId) return forbiddenResponse();

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const academicYear = formData.get("academic_year") as string || null;

    if (!file) return errorResponse("กรุณาแนบไฟล์ CSV");
    if (!file.name.endsWith(".csv")) return errorResponse("รองรับเฉพาะไฟล์ .csv");

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim());

    if (lines.length < 2) return errorResponse("ไฟล์ CSV ไม่มีข้อมูล");

    // Parse header — allow both Thai and English column names
    const header = lines[0].split(",").map((h) => h.trim().toLowerCase()
      .replace("รหัสนักเรียน", "student_code")
      .replace("ชื่อ-นามสกุล", "full_name")
      .replace("ชื่อนามสกุล", "full_name")
      .replace("ห้องเรียน", "class_name")
      .replace("ระดับชั้น", "grade_level")
      .replace("วันเกิด", "date_of_birth")
      .replace("เพศ", "gender")
      .replace("กรุ๊ปเลือด", "blood_type")
      .replace("หมู่เลือด", "blood_type")
      .replace("แพ้ยา", "allergies")
      .replace("ชื่อผู้ปกครอง", "parent_name")
      .replace("เบอร์ผู้ปกครอง", "parent_phone")
    );

    const get = (row: string[], col: string) => {
      const idx = header.indexOf(col);
      return idx >= 0 ? (row[idx] || "").trim() : "";
    };

    let inserted = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(",");
      const fullName = get(row, "full_name");
      if (!fullName) { skipped++; continue; }

      const genderRaw = get(row, "gender").toLowerCase();
      const gender = GENDER_MAP[genderRaw] || (genderRaw || null);

      try {
        await execute(
          `INSERT INTO students
           (school_id, student_code, full_name, class_name, grade_level,
            date_of_birth, gender, blood_type, allergies, parent_phone, parent_name, academic_year)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            session.schoolId,
            get(row, "student_code") || null,
            fullName,
            get(row, "class_name") || null,
            get(row, "grade_level") || null,
            parseThaiDate(get(row, "date_of_birth")),
            gender || null,
            get(row, "blood_type") || null,
            get(row, "allergies") || null,
            get(row, "parent_phone") || null,
            get(row, "parent_name") || null,
            academicYear || null,
          ]
        );
        inserted++;
      } catch (err: any) {
        errors.push(`แถว ${i + 1}: ${err.message}`);
        skipped++;
      }
    }

    return successResponse({
      inserted,
      skipped,
      errors: errors.slice(0, 10),
      message: `นำเข้าสำเร็จ ${inserted} คน, ข้าม ${skipped} รายการ`,
    });
  } catch (error: any) {
    return errorResponse("เกิดข้อผิดพลาด: " + error.message, 500);
  }
}
