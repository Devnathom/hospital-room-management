import { NextRequest } from "next/server";
import { execute, queryOne } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { schoolName, address, phone, schoolEmail, adminName, adminEmail, adminPassword } = body;

    if (!schoolName || !adminName || !adminEmail || !adminPassword) {
      return errorResponse("กรุณากรอกข้อมูลให้ครบถ้วน", 400);
    }

    // Check if email already exists
    const existingUser = await queryOne("SELECT id FROM users WHERE email = ?", [adminEmail]);
    if (existingUser) {
      return errorResponse("อีเมลนี้ถูกใช้งานแล้ว", 400);
    }

    // Create school
    const schoolResult = await execute(
      "INSERT INTO schools (name, address, phone, email, status) VALUES (?, ?, ?, ?, 'approved')",
      [schoolName, address || null, phone || null, schoolEmail || null]
    );
    const schoolId = schoolResult.insertId;

    // Create school admin user
    const passwordHash = await hashPassword(adminPassword);
    await execute(
      "INSERT INTO users (school_id, username, email, password_hash, full_name, role, phone) VALUES (?, ?, ?, ?, ?, 'school_admin', ?)",
      [schoolId, adminEmail.split("@")[0], adminEmail, passwordHash, adminName, phone || null]
    );

    // Insert default symptom categories
    const defaultSymptoms = ["ปวดหัว", "ปวดท้อง", "มีไข้", "เป็นแผล/บาดเจ็บ", "คลื่นไส้/อาเจียน", "เป็นลม", "ปวดฟัน", "ผื่นคัน/แพ้", "อื่นๆ"];
    for (const symptom of defaultSymptoms) {
      await execute("INSERT INTO symptom_categories (school_id, name) VALUES (?, ?)", [schoolId, symptom]);
    }

    return successResponse({ message: "สมัครสำเร็จ สามารถเข้าสู่ระบบได้ทันที", schoolId }, 201);
  } catch (error: any) {
    console.error("Register school error:", error);
    return errorResponse("เกิดข้อผิดพลาดในการสมัคร", 500);
  }
}
