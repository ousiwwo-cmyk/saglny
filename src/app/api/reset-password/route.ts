import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const ADMIN_EMAIL = "oussamaapay23@gmail.com"
const ADMIN_PASSWORD = "Annaba23@"

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // 1. ابحث عن المستخدم
  const { data: users } = await supabase.auth.admin.listUsers()
  const admin = users.users.find((u) => u.email === ADMIN_EMAIL)

  if (!admin) {
    return NextResponse.json({ error: "المستخدم غير موجود — شغّل /api/setup أولاً" }, { status: 404 })
  }

  // 2. أعد تعيين كلمة المرور
  const { error: updateError } = await supabase.auth.admin.updateUserById(admin.id, {
    password: ADMIN_PASSWORD,
    email_confirm: true,
  })

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({
    message: "تم إعادة تعيين كلمة المرور ✅",
    email: ADMIN_EMAIL,
    note: "حاول تسجيل الدخول الآن من /auth/login",
  })
}
