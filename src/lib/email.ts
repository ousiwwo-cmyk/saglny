import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST,
  port: Number(process.env.BREVO_SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASSWORD,
  },
})

export async function sendRegistrationEmail(params: {
  to: string
  studentName: string
  teacherName: string
  subjectName: string
  schoolName: string
  schoolLogo?: string | null
}) {
  const { to, studentName, teacherName, subjectName, schoolName, schoolLogo } = params

  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f0fdf4;font-family:'Cairo','Tajawal',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;padding:20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
        <tr>
          <td style="background:linear-gradient(135deg,#1a5c2a,#0d421d);padding:30px;text-align:center;">
            ${schoolLogo ? `<img src="${schoolLogo}" alt="${schoolName}" style="width:80px;height:80px;border-radius:50%;margin-bottom:15px;border:3px solid #ffffff;">` : ""}
            <h1 style="color:#ffffff;margin:0;font-size:24px;">✅ تم تسجيلك بنجاح</h1>
          </td>
        </tr>
        <tr><td style="padding:30px;text-align:center;">
          <p style="font-size:18px;color:#1f2937;line-height:1.8;">${studentName}، تم تسجيلك بنجاح عند الأستاذ <strong style="color:#1a5c2a;">${teacherName}</strong> في مادة <strong style="color:#1a5c2a;">${subjectName}</strong>.</p>
          <p style="font-size:16px;color:#4b5563;margin-top:20px;">مدرسة <strong style="color:#1a5c2a;">${schoolName}</strong> تتمنى لك التوفيق 🌟</p>
          <div style="margin-top:30px;padding-top:20px;border-top:1px solid #e5e7eb;">
            <p style="font-size:14px;color:#9ca3af;">جميع الحقوق محفوظة © ${new Date().getFullYear()} — سجلني</p>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  try {
    await transporter.sendMail({
      from: `"سجلني" <${process.env.BREVO_SMTP_USER}>`,
      to,
      subject: "تم تسجيلك بنجاح ✅",
      html,
    })
    return { success: true }
  } catch (error) {
    console.error("Email sending failed:", error)
    return { success: false, error }
  }
}

export async function sendStatusChangeEmail(params: {
  to: string
  studentName: string
  newStatus: string
  schoolName: string
}) {
  const { to, studentName, newStatus, schoolName } = params

  const statusColor = newStatus === "confirmed" ? "#16a34a" : newStatus === "cancelled" ? "#dc2626" : "#f59e0b"
  const statusLabel = newStatus === "confirmed" ? "مؤكد" : newStatus === "cancelled" ? "ملغى" : "قيد الانتظار"

  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f0fdf4;font-family:'Cairo','Tajawal',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;padding:20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
        <tr><td style="background:linear-gradient(135deg,#1a5c2a,#0d421d);padding:30px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:24px;">تحديث حالة التسجيل</h1>
        </td></tr>
        <tr><td style="padding:30px;text-align:center;">
          <p style="font-size:18px;color:#1f2937;line-height:1.8;">${studentName}، تم تحديث حالة تسجيلك إلى:</p>
          <p style="font-size:22px;color:${statusColor};font-weight:bold;margin:20px 0;">${statusLabel}</p>
          <p style="font-size:16px;color:#4b5563;">مدرسة <strong>${schoolName}</strong></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  try {
    await transporter.sendMail({
      from: `"سجلني" <${process.env.BREVO_SMTP_USER}>`,
      to,
      subject: `تحديث حالة التسجيل - ${statusLabel}`,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error("Status email failed:", error)
    return { success: false, error }
  }
}
