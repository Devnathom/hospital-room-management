import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { successResponse, unauthorizedResponse, forbiddenResponse } from "@/lib/api-response";
import os from "os";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  if (!token) return unauthorizedResponse();

  const payload = await verifyToken(token);
  if (!payload) return unauthorizedResponse();
  if (payload.role !== "super_admin") return forbiddenResponse();

  // DB counts
  const [schoolRow, userRow, visitRow] = await Promise.all([
    queryOne<any>(
      "SELECT COUNT(*) as total, SUM(status='approved') as approved, SUM(status='pending') as pending, SUM(status='rejected') as rejected FROM schools"
    ),
    queryOne<any>(
      "SELECT COUNT(*) as total, SUM(is_active=1) as active, SUM(is_active=0) as inactive FROM users"
    ),
    queryOne<any>("SELECT COUNT(*) as total FROM room_visits"),
  ]);

  // DB version
  const dbVersion = await queryOne<any>("SELECT VERSION() as version");

  // DB size
  const dbSize = await queryOne<any>(
    `SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
     FROM information_schema.TABLES
     WHERE table_schema = DATABASE()`
  );

  // Memory
  const memTotal = os.totalmem();
  const memFree = os.freemem();
  const memUsed = memTotal - memFree;

  // Process memory
  const procMem = process.memoryUsage();

  return successResponse({
    server: {
      nodeVersion: process.version,
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      uptimeSeconds: Math.floor(process.uptime()),
      uptimeFormatted: formatUptime(process.uptime()),
      environment: process.env.NODE_ENV || "development",
    },
    memory: {
      totalMB: Math.round(memTotal / 1024 / 1024),
      usedMB: Math.round(memUsed / 1024 / 1024),
      freeMB: Math.round(memFree / 1024 / 1024),
      usagePercent: Math.round((memUsed / memTotal) * 100),
      processHeapMB: Math.round(procMem.heapUsed / 1024 / 1024),
      processHeapTotalMB: Math.round(procMem.heapTotal / 1024 / 1024),
    },
    database: {
      version: dbVersion?.version || "-",
      sizeMB: dbSize?.size_mb || 0,
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || "3306",
      name: process.env.DB_NAME || "hospital_room_mgmt",
    },
    stats: {
      schools: {
        total: Number(schoolRow?.total || 0),
        approved: Number(schoolRow?.approved || 0),
        pending: Number(schoolRow?.pending || 0),
        rejected: Number(schoolRow?.rejected || 0),
      },
      users: {
        total: Number(userRow?.total || 0),
        active: Number(userRow?.active || 0),
        inactive: Number(userRow?.inactive || 0),
      },
      totalVisits: Number(visitRow?.total || 0),
    },
    timestamp: new Date().toISOString(),
  });
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
