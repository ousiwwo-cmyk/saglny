import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FiBookOpen, FiUsers, FiGrid } from "react-icons/fi"

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: admin } = await supabase
    .from("admins")
    .select("id")
    .eq("id", user.id)
    .single()

  if (!admin) redirect("/")

  const { count: schoolsCount } = await supabase
    .from("schools")
    .select("*", { count: "exact", head: true })

  const { count: pendingCount } = await supabase
    .from("schools")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  const { count: approvedCount } = await supabase
    .from("schools")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved")

  const { count: registrationsCount } = await supabase
    .from("registrations")
    .select("*", { count: "exact", head: true })

  return (
    <div className="flex min-h-screen" dir="rtl">
      <AdminSidebar />
      <div className="flex-1 bg-emerald-50/50 p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-emerald-800 mb-6">لوحة الإدارة</h1>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                  <FiGrid className="h-6 w-6 text-emerald-700" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-800">{schoolsCount || 0}</p>
                  <p className="text-sm text-emerald-600">إجمالي المدارس</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                  <FiGrid className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-700">{pendingCount || 0}</p>
                  <p className="text-sm text-amber-600">قيد المراجعة</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                  <FiBookOpen className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-700">{approvedCount || 0}</p>
                  <p className="text-sm text-green-600">معتمدة</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                  <FiUsers className="h-6 w-6 text-emerald-700" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-800">{registrationsCount || 0}</p>
                  <p className="text-sm text-emerald-600">تسجيلات</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">مرحباً بك في لوحة الإدارة</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-emerald-600">
                من هنا يمكنك إدارة جميع الأكاديميات المسجلة، الموافقة على الطلبات الجديدة،
                وإدارة اشتراكات المدارس.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
