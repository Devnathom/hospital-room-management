/**
 * Run this script once to create the Super Admin account:
 *   npx tsx scripts/seed-admin.ts
 *
 * Or use the /api/setup/seed endpoint (development only).
 */
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "hospital_room_mgmt",
  });

  const passwordHash = await bcrypt.hash("admin123", 12);

  await conn.execute(
    `INSERT INTO users (school_id, username, email, password_hash, full_name, role, is_active)
     VALUES (NULL, 'superadmin', 'admin@hospital-room.com', ?, 'Super Administrator', 'super_admin', TRUE)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
    [passwordHash]
  );

  console.log("✅ Super Admin seeded successfully");
  console.log("   Email   : admin@hospital-room.com");
  console.log("   Password: admin123");

  await conn.end();
}

main().catch((e) => {
  console.error("Seed error:", e);
  process.exit(1);
});
