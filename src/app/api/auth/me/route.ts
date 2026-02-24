import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import { successResponse, unauthorizedResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  let schoolName: string | null = null;
  if (session.schoolId) {
    const school = await queryOne<any>("SELECT name FROM schools WHERE id = ?", [session.schoolId]);
    schoolName = school?.name || null;
  }

  return successResponse({ ...session, schoolName });
}
