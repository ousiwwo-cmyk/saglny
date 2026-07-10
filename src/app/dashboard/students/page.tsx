import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SchoolSidebar } from "@/components/layout/sidebar"
import { StudentsTable } from "@/components/students-table"

export default async function StudentsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: registrations } = await supabase
    .from("registrations")
    .select("*")
    .eq("school_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="flex min-h-screen" dir="rtl">
      <SchoolSidebar />
      <div className="flex-1 bg-emerald-50/50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-emerald-800">التلاميذ المسجلون</h1>
            <p className="text-emerald-600">عرض وإدارة جميع التلاميذ المسجلين في أكاديميتك</p>
          </div>
          <StudentsTable registrations={registrations || []} />
        </div>
      </div>
    </div>
  )
}
