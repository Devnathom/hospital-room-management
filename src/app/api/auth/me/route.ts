import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { successResponse, unauthorizedResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();
  return successResponse(session);
}
