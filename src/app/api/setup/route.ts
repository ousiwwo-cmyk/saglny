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

  const results: string[] = []

  // 1. المستخدم في Auth
  const { data: users } = await supabase.auth.admin.listUsers()
  let authUser = users.users.find((u) => u.email === ADMIN_EMAIL)

  if (!authUser) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
    })
    if (error) return NextResponse.json({ error: `فشل إنشاء المستخدم: ${error.message}` }, { status: 500 })
    authUser = data.user
    results.push("مستخدم Auth منشأ ✅")
  } else {
    await supabase.auth.admin.updateUserById(authUser.id, { password: ADMIN_PASSWORD, email_confirm: true })
    results.push("مستخدم Auth موجود وتم تحديث كلمة المرور ✅")
  }

  // 2. جدول admins
  const { error: upsertError } = await supabase
    .from("admins")
    .upsert({ id: authUser.id, email: ADMIN_EMAIL, role: "admin" })

  if (upsertError) results.push(`⚠️ admins: ${upsertError.message}`)
  else results.push("سجل الأدمن مضاف ✅")

  // 3. اختبر تسجيل الدخول
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { error: loginTest } = await anonClient.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  })

  if (loginTest) {
    results.push(`❌ اختبار الدخول فشل: ${loginTest.message}`)
  } else {
    results.push("✅ اختبار الدخول نجاح — الحساب شغال")
  }

  return NextResponse.json({
    results,
    email: ADMIN_EMAIL,
    action: "حاول تسجيل الدخول من /auth/login",
    troubleshoot: loginTest?.message?.includes("Email logins are disabled")
      ? "اذهب إلى Supabase Dashboard → Authentication → Providers → Email → فعّل → Save"
      : null,
  })
}
