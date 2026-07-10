/**
 * سكريبت إنشاء حساب المشرف العام
 * 
 * طريقة التشغيل:
 * 1. تأكد من ضبط SUPABASE_SERVICE_ROLE_KEY و NEXT_PUBLIC_SUPABASE_URL في .env.local
 * 2. شغّل: node src/scripts/create-admin.mjs
 */

const { createClient } = require("@supabase/supabase-js")

require("dotenv").config({ path: ".env.local" })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

async function createAdmin() {
  const email = "oussamaapay23@gmail.com"
  const password = "Annaba23@"

  // 1. إنشاء المستخدم في Supabase Auth
  const { data: user, error: signUpError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: "admin" },
  })

  if (signUpError) {
    // ربما الحساب موجود مسبقًا — جلب userId
    console.log("⚠️ خطأ في إنشاء المستخدم:", signUpError.message)
    const { data: existing } = await supabase.auth.admin.listUsers()
    const found = existing.users.find((u) => u.email === email)
    if (found) {
      console.log("✅ المستخدم موجود مسبقًا:", found.id)
      // إضافة للأدمين إن لم يكن
      const { error: insertError } = await supabase
        .from("admins")
        .upsert({ id: found.id, email, role: "admin" })
      if (insertError) {
        console.log("❌ فشل إضافة للأدمين:", insertError.message)
      } else {
        console.log("✅ تمت إضافة المستخدم للأدمين")
      }
    }
    return
  }

  // 2. إضافة للأدمين
  const { error: insertError } = await supabase.from("admins").insert({
    id: user.user.id,
    email,
    role: "admin",
  })

  if (insertError) {
    console.log("❌ فشل إضافة للأدمين:", insertError.message)
  } else {
    console.log(`✅ تم إنشاء حساب المشرف العام:
   البريد: ${email}
   كلمة المرور: ${password}
   UUID: ${user.user.id}`)
  }
}

createAdmin()
