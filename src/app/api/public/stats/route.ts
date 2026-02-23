import { queryOne } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const schoolCount = await queryOne<any>("SELECT COUNT(*) as count FROM schools WHERE status = 'approved'");
    return successResponse({
      totalSchools: schoolCount?.count || 0,
    });
  } catch (error) {
    console.error("Public stats error:", error);
    return successResponse({ totalSchools: 0 });
  }
}
