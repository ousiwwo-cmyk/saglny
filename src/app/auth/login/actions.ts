"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function adminLogin(email: string, password: string) {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  
  if (error) {
    if (error.message.includes("Email logins are disabled")) {
      return { error: "فعّل تسجيل الدخول بالبريد في Supabase Dashboard → Authentication → Providers → Email" }
    }
    return { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" }
  }

  // تحقق من كونه أدمن
  const { data: admin } = await supabase
    .from("admins")
    .select("id")
    .eq("id", data.user.id)
    .single()

  if (admin) {
    return { success: true, redirectTo: "/admin" }
  }

  // تحقق من مدرسة
  const { data: school } = await supabase
    .from("schools")
    .select("id")
    .eq("id", data.user.id)
    .single()

  if (school) {
    return { success: true, redirectTo: "/dashboard" }
  }

  return { success: true, redirectTo: "/" }
}
