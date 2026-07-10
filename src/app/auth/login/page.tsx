"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { FiMail, FiLock, FiAlertCircle, FiLoader } from "react-icons/fi"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message === "Invalid login credentials"
        ? "البريد الإلكتروني أو كلمة المرور غير صحيحة"
        : authError.message)
      setLoading(false)
      return
    }

    // Check if admin
    const { data: admin } = await supabase
      .from("admins")
      .select("id")
      .eq("id", data.user?.id)
      .single()

    if (admin) {
      router.push("/admin")
    } else {
      // Check if school exists
      const { data: school } = await supabase
        .from("schools")
        .select("id")
        .eq("id", data.user?.id)
        .single()

      if (school) {
        router.push("/dashboard")
      } else {
        router.push("/")
      }
    }

    router.refresh()
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-pattern-geometric px-4" dir="rtl">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-emerald-800">تسجيل الدخول</CardTitle>
          <CardDescription>أدخل بريدك الإلكتروني وكلمة المرور</CardDescription>
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
              <label className="block text-sm font-medium text-emerald-700 mb-1">البريد الإلكتروني</label>
              <div className="relative">
                <FiMail className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 h-4 w-4" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@school.com"
                  className="pr-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-700 mb-1">كلمة المرور</label>
              <div className="relative">
                <FiLock className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 h-4 w-4" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pr-10"
                  required
                  minLength={8}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><FiLoader className="animate-spin ml-2" /> جاري...</> : "دخول"}
            </Button>

            <p className="text-center text-sm text-emerald-600 mt-4">
              ليس لديك حساب؟
              <Link href="/auth/signup" className="text-emerald-700 font-medium hover:underline mr-1">
                تسجيل أكاديمية
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
