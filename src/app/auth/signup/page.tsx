"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { FiAlertCircle, FiLoader, FiCheckCircle } from "react-icons/fi"
import { WILAYAS } from "@/lib/constants"

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    schoolName: "",
    wilaya: "",
    phone: "",
    address: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const supabase = createClient()

    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (!authData.user) {
      setError("حدث خطأ في إنشاء الحساب")
      setLoading(false)
      return
    }

    // Create school profile
    const { error: schoolError } = await supabase.from("schools").insert({
      id: authData.user.id,
      name: formData.schoolName,
      wilaya: formData.wilaya,
      phone: formData.phone,
      address: formData.address,
      status: "pending",
    })

    if (schoolError) {
      setError(schoolError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => router.push("/auth/login"), 3000)
  }

  if (success) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-pattern-geometric px-4" dir="rtl">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="text-center py-12">
            <FiCheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-emerald-800 mb-4">تم التسجيل بنجاح!</CardTitle>
            <p className="text-emerald-600 mb-6">
              تم إرسال رابط تأكيد إلى بريدك الإلكتروني. بعد تأكيد الحساب، سيقوم الأدمن بمراجعة طلبك.
            </p>
            <Link href="/auth/login">
              <Button>تسجيل الدخول</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-pattern-geometric px-4 py-8" dir="rtl">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-emerald-800">تسجيل أكاديمية جديدة</CardTitle>
          <CardDescription>أنشئ حسابًا لمدرستك أو أكاديميتك</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                <FiAlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-emerald-700 mb-1">اسم الأكاديمية</label>
              <input
                name="schoolName"
                value={formData.schoolName}
                onChange={handleChange}
                required
                className="flex h-10 w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-700 mb-1">الولاية</label>
              <select
                name="wilaya"
                value={formData.wilaya}
                onChange={handleChange}
                required
                className="flex h-10 w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">اختر الولاية</option>
                {WILAYAS.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-700 mb-1">رقم الهاتف</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="05XX XX XX XX"
                className="flex h-10 w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-700 mb-1">العنوان</label>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="flex h-10 w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-700 mb-1">البريد الإلكتروني</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="flex h-10 w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-700 mb-1">كلمة المرور</label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                className="flex h-10 w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-xs text-emerald-500 mt-1">8 أحرف على الأقل</p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><FiLoader className="animate-spin ml-2" /> جاري...</> : "تسجيل"}
            </Button>

            <p className="text-center text-sm text-emerald-600 mt-4">
              لديك حساب بالفعل؟
              <Link href="/auth/login" className="text-emerald-700 font-medium hover:underline mr-1">
                تسجيل دخول
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
