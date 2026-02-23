import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { verifyPassword, createToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email") || "";
  const password = searchParams.get("pw") || "";

  if (!email || !password) {
    return NextResponse.json({ error: "need ?email=&pw=" });
  }

  const user = await queryOne<any>(
    "SELECT id, email, role, password_hash, is_active FROM users WHERE email = ?",
    [email]
  ).catch((e: any) => ({ dbError: e.message }));

  if (!user || (user as any).dbError) {
    return NextResponse.json({ step: "db", result: user });
  }

  const isValid = await verifyPassword(password, (user as any).password_hash).catch((e: any) => ({ error: e.message }));

  const token = isValid === true ? await createToken({
    userId: (user as any).id,
    email: (user as any).email,
    role: (user as any).role,
    schoolId: null,
    fullName: "Super Admin",
  }) : null;

  const response = NextResponse.json({
    step: "done",
    email,
    pw_len: password.length,
    hash_prefix: (user as any).password_hash?.substring(0, 15),
    isValid,
    user_found: !!(user as any).id,
  });

  if (token) {
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });
  }

  return response;
}
