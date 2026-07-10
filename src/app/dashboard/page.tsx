import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SchoolSidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FiUsers, FiBookOpen, FiUserCheck, FiCalendar, FiAlertCircle } from "react-icons/fi"

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: school } = await supabase
    .from("schools")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!school) redirect("/")

  const { count: registrationsCount } = await supabase
    .from("registrations")
    .select("*", { count: "exact", head: true })
    .eq("school_id", user.id)

  const { count: pendingCount } = await supabase
    .from("registrations")
    .select("*", { count: "exact", head: true })
    .eq("school_id", user.id)
    .eq("status", "pending")

  const { data: recentRegistrations } = await supabase
    .from("registrations")
    .select("*")
    .eq("school_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  const isExpiringSoon = school.subscription_expires_at &&
    new Date(school.subscription_expires_at) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  return (
    <div className="flex min-h-screen" dir="rtl">
      <SchoolSidebar />
      <div className="flex-1 bg-emerald-50/50 p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-emerald-800 mb-6">مرحباً، {school.name}</h1>

          {/* Subscription Alert */}
          {isExpiringSoon && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <FiAlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
              <div className="text-sm text-amber-800">
                باقٍ أقل من 30 يومًا على انتهاء الاشتراك.
                <a
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "213XXXXXXXXX"}?text=${encodeURIComponent(`السلام عليكم، أريد تجديد اشتراك أكاديمية "${school.name}" (الباقة الحالية: ${school.subscription_plan || "بدون باقة"}).`)}`}
                  target="_blank"
                  className="font-semibold underline mr-1"
                >
                  جدد الآن
                </a>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                  <FiUsers className="h-6 w-6 text-emerald-700" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-800">{registrationsCount || 0}</p>
                  <p className="text-sm text-emerald-600">إجمالي التلاميذ</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                  <FiCalendar className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-700">{pendingCount || 0}</p>
                  <p className="text-sm text-amber-600">قيد الانتظار</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                  <FiBookOpen className="h-6 w-6 text-emerald-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-700">الباقة الحالية</p>
                  <Badge variant={school.subscription_plan ? "success" : "warning"}>
                    {school.subscription_plan || "بدون باقة"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Registrations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">آخر التسجيلات</CardTitle>
            </CardHeader>
            <CardContent>
              {recentRegistrations && recentRegistrations.length > 0 ? (
                <div className="space-y-3">
                  {recentRegistrations.map((reg) => (
                    <div key={reg.id} className="flex items-center justify-between py-2 border-b border-emerald-100 last:border-0">
                      <div>
                        <p className="font-medium text-emerald-800">{reg.full_name}</p>
                        <p className="text-sm text-emerald-600">{reg.email}</p>
                      </div>
                      <Badge
                        variant={
                          reg.status === "confirmed" ? "success" :
                          reg.status === "cancelled" ? "danger" : "warning"
                        }
                      >
                        {reg.status === "confirmed" ? "مؤكد" :
                         reg.status === "cancelled" ? "ملغى" : "قيد الانتظار"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-emerald-500 text-center py-8">لا توجد تسجيلات بعد</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
