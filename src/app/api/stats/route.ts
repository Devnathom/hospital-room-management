import { NextRequest } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "month"; // day, month, year
  const year = searchParams.get("year") || new Date().getFullYear().toString();
  const month = searchParams.get("month") || (new Date().getMonth() + 1).toString();

  try {
    // Super admin sees global stats
    if (session.role === "super_admin") {
      const totalSchools = await queryOne<any>("SELECT COUNT(*) as count FROM schools WHERE status = 'approved'");
      const totalUsers = await queryOne<any>("SELECT COUNT(*) as count FROM users WHERE role != 'super_admin'");
      const totalVisits = await queryOne<any>("SELECT COUNT(*) as count FROM room_visits");
      const pendingSchools = await queryOne<any>("SELECT COUNT(*) as count FROM schools WHERE status = 'pending'");

      return successResponse({
        totalSchools: totalSchools?.count || 0,
        totalUsers: totalUsers?.count || 0,
        totalVisits: totalVisits?.count || 0,
        pendingSchools: pendingSchools?.count || 0,
      });
    }

    const schoolId = session.schoolId;
    if (!schoolId) return errorResponse("ไม่พบข้อมูลโรงเรียน");

    // School-level stats
    const totalStudents = await queryOne<any>("SELECT COUNT(*) as count FROM students WHERE school_id = ?", [schoolId]);
    const totalVisits = await queryOne<any>("SELECT COUNT(*) as count FROM room_visits WHERE school_id = ?", [schoolId]);
    const todayVisits = await queryOne<any>("SELECT COUNT(*) as count FROM room_visits WHERE school_id = ? AND visit_date = CURDATE()", [schoolId]);
    const inRoomCount = await queryOne<any>("SELECT COUNT(*) as count FROM room_visits WHERE school_id = ? AND status = 'in_room'", [schoolId]);
    const totalRooms = await queryOne<any>("SELECT COUNT(*) as count FROM health_rooms WHERE school_id = ? AND is_active = TRUE", [schoolId]);

    // Monthly visits chart data
    let visitsByPeriod: any[] = [];
    if (period === "month") {
      visitsByPeriod = await query(
        `SELECT DAY(visit_date) as label, COUNT(*) as count
         FROM room_visits WHERE school_id = ? AND YEAR(visit_date) = ? AND MONTH(visit_date) = ?
         GROUP BY DAY(visit_date) ORDER BY label`,
        [schoolId, year, month]
      );
    } else if (period === "year") {
      visitsByPeriod = await query(
        `SELECT MONTH(visit_date) as label, COUNT(*) as count
         FROM room_visits WHERE school_id = ? AND YEAR(visit_date) = ?
         GROUP BY MONTH(visit_date) ORDER BY label`,
        [schoolId, year]
      );
    } else {
      visitsByPeriod = await query(
        `SELECT HOUR(visit_time) as label, COUNT(*) as count
         FROM room_visits WHERE school_id = ? AND visit_date = CURDATE()
         GROUP BY HOUR(visit_time) ORDER BY label`,
        [schoolId]
      );
    }

    // Symptom category stats
    const symptomStats = await query(
      `SELECT sc.name, COUNT(rv.id) as count
       FROM room_visits rv
       LEFT JOIN symptom_categories sc ON rv.symptom_category_id = sc.id
       WHERE rv.school_id = ? AND YEAR(rv.visit_date) = ?
       GROUP BY rv.symptom_category_id, sc.name ORDER BY count DESC`,
      [schoolId, year]
    );

    // Visit status stats
    const statusStats = await query(
      `SELECT status, COUNT(*) as count FROM room_visits WHERE school_id = ? GROUP BY status`,
      [schoolId]
    );

    // Top students visiting
    const topStudents = await query(
      `SELECT s.full_name, s.class_name, COUNT(rv.id) as visit_count
       FROM room_visits rv
       LEFT JOIN students s ON rv.student_id = s.id
       WHERE rv.school_id = ? AND YEAR(rv.visit_date) = ?
       GROUP BY rv.student_id, s.full_name, s.class_name
       ORDER BY visit_count DESC LIMIT 10`,
      [schoolId, year]
    );

    return successResponse({
      totalStudents: totalStudents?.count || 0,
      totalVisits: totalVisits?.count || 0,
      todayVisits: todayVisits?.count || 0,
      inRoomCount: inRoomCount?.count || 0,
      totalRooms: totalRooms?.count || 0,
      visitsByPeriod,
      symptomStats,
      statusStats,
      topStudents,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return errorResponse("เกิดข้อผิดพลาด", 500);
  }
}
