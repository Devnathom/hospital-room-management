import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { queryOne } from "@/lib/db";
import { createToken } from "@/lib/auth";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: "No OAuth session" }, { status: 401 });
  }

  const dbUser = await queryOne<any>(
    "SELECT * FROM users WHERE email = ?",
    [session.user.email]
  );

  if (!dbUser) {
    return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
  }

  if (!dbUser.is_active) {
    return NextResponse.json({ success: false, error: "บัญชีถูกระงับ" }, { status: 403 });
  }

  const token = await createToken({
    userId: dbUser.id,
    email: dbUser.email,
    role: dbUser.role,
    schoolId: dbUser.school_id,
    fullName: dbUser.full_name,
  });

  const response = NextResponse.json({
    success: true,
    data: {
      role: dbUser.role,
      user: { id: dbUser.id, email: dbUser.email, fullName: dbUser.full_name, role: dbUser.role },
    },
  });

  response.cookies.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  return response;
}
