import { query } from "@/lib/db";

export async function GET() {
  const results: Record<string, any> = {
    env: {
      DB_HOST: process.env.DB_HOST || "(not set)",
      DB_PORT: process.env.DB_PORT || "(not set)",
      DB_USER: process.env.DB_USER || "(not set)",
      DB_NAME: process.env.DB_NAME || "(not set)",
      DB_PASSWORD: process.env.DB_PASSWORD ? "***set***" : "(not set)",
      JWT_SECRET: process.env.JWT_SECRET ? "***set***" : "(not set)",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "***set***" : "(not set)",
      NODE_ENV: process.env.NODE_ENV || "(not set)",
    },
    db: null,
    users: null,
  };

  try {
    const dbResult = await query("SELECT 1 as ok, NOW() as time");
    results.db = { success: true, result: dbResult };
  } catch (e: any) {
    results.db = { success: false, error: e.message };
  }

  try {
    const users = await query("SELECT id, email, role FROM users LIMIT 5");
    results.users = { success: true, count: (users as any[]).length, data: users };
  } catch (e: any) {
    results.users = { success: false, error: e.message };
  }

  return Response.json(results);
}
