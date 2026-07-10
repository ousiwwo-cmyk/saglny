import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/layout/sidebar"
import { SchoolsManagement } from "@/components/schools-management"

export default async function AdminSchoolsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: admin } = await supabase
    .from("admins")
    .select("id")
    .eq("id", user.id)
    .single()

  if (!admin) redirect("/")

  const { data: schools } = await supabase
    .from("schools")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="flex min-h-screen" dir="rtl">
      <AdminSidebar />
      <div className="flex-1 bg-emerald-50/50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-emerald-800">إدارة المدارس</h1>
            <p className="text-emerald-600">عرض ومراجعة وإدارة جميع الأكاديميات المسجلة</p>
          </div>
          <SchoolsManagement schools={schools || []} adminId={user.id} />
        </div>
      </div>
    </div>
  )
}
