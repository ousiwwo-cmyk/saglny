import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SchoolSidebar } from "@/components/layout/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default async function TeachersPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: teachers } = await supabase
    .from("teachers")
    .select("*")
    .eq("school_id", user.id)
    .order("full_name")

  return (
    <div className="flex min-h-screen" dir="rtl">
      <SchoolSidebar />
      <div className="flex-1 bg-emerald-50/50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-emerald-800">الأساتذة</h1>
            <p className="text-emerald-600">إدارة الأساتذة في أكاديميتك</p>
          </div>

          <Card>
            <CardContent className="p-6">
              {teachers && teachers.length > 0 ? (
                <div className="divide-y divide-emerald-100">
                  {teachers.map((teacher) => (
                    <div key={teacher.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-emerald-800">{teacher.full_name}</p>
                        {teacher.phone && (
                          <p className="text-sm text-emerald-600">{teacher.phone}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-emerald-500 py-8">لا يوجد أساتذة بعد</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
