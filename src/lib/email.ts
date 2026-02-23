import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmail(
  toEmail: string,
  fullName: string,
  resetToken: string
) {
  const appUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetUrl = `${appUrl}/auth/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    from: `"ระบบห้องพยาบาล" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: "รีเซ็ตรหัสผ่าน - ระบบห้องพยาบาล",
    html: `
<!DOCTYPE html>
<html lang="th">
<head><meta charset="UTF-8"></head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; background:#f3f4f6; margin:0; padding:20px;">
  <div style="max-width:520px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08);">
    
    <div style="background:linear-gradient(135deg,#2563eb,#4f46e5); padding:32px; text-align:center;">
      <div style="width:56px; height:56px; background:rgba(255,255,255,0.2); border-radius:14px; display:inline-flex; align-items:center; justify-content:center; margin-bottom:12px;">
        <span style="font-size:28px;">🏥</span>
      </div>
      <h1 style="color:#ffffff; margin:0; font-size:20px; font-weight:700;">ระบบห้องพยาบาล</h1>
      <p style="color:rgba(255,255,255,0.8); margin:4px 0 0; font-size:13px;">Hospital Room Management</p>
    </div>

    <div style="padding:36px 32px;">
      <h2 style="margin:0 0 8px; font-size:22px; color:#111827;">รีเซ็ตรหัสผ่าน</h2>
      <p style="color:#6b7280; margin:0 0 24px; font-size:15px;">สวัสดีคุณ <strong style="color:#111827;">${fullName}</strong></p>
      
      <p style="color:#374151; font-size:15px; line-height:1.6; margin:0 0 24px;">
        เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ คลิกปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่
      </p>

      <div style="text-align:center; margin:28px 0;">
        <a href="${resetUrl}" 
           style="display:inline-block; background:linear-gradient(135deg,#2563eb,#4f46e5); color:#ffffff; text-decoration:none; padding:14px 36px; border-radius:8px; font-size:15px; font-weight:600; letter-spacing:0.3px;">
          ตั้งรหัสผ่านใหม่
        </a>
      </div>

      <div style="background:#fef9c3; border:1px solid #fde047; border-radius:8px; padding:14px 16px; margin:24px 0;">
        <p style="margin:0; font-size:13px; color:#854d0e;">
          ⏰ ลิงก์นี้จะหมดอายุภายใน <strong>1 ชั่วโมง</strong>
        </p>
      </div>

      <p style="color:#9ca3af; font-size:13px; margin:0 0 8px;">
        หากปุ่มด้านบนใช้งานไม่ได้ ให้คัดลอกลิงก์ด้านล่างวางในเบราว์เซอร์:
      </p>
      <p style="word-break:break-all; font-size:12px; color:#6b7280; background:#f9fafb; padding:10px; border-radius:6px; margin:0 0 24px;">
        ${resetUrl}
      </p>

      <hr style="border:none; border-top:1px solid #e5e7eb; margin:0 0 20px;">
      <p style="color:#9ca3af; font-size:12px; margin:0; text-align:center;">
        หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลนี้<br>
        รหัสผ่านของคุณจะยังคงเดิมและปลอดภัย
      </p>
    </div>
  </div>
</body>
</html>`,
  });
}
