import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function AdminSubscriptionsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: admin } = await supabase
    .from("admins")
    .select("id")
    .eq("id", user.id)
    .single()

  if (!admin) redirect("/")

  const { data: logs } = await supabase
    .from("subscriptions_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100)

  const { data: schools } = await supabase
    .from("schools")
    .select("id, name")

  const schoolMap = new Map(schools?.map((s) => [s.id, s.name]) || [])

  const actionLabels: Record<string, string> = {
    extend: "تمديد",
    change_plan: "تغيير باقة",
    cancel: "إلغاء",
  }

  const actionVariants: Record<string, "success" | "warning" | "danger"> = {
    extend: "success",
    change_plan: "warning",
    cancel: "danger",
  }

  return (
    <div className="flex min-h-screen" dir="rtl">
      <AdminSidebar />
      <div className="flex-1 bg-emerald-50/50 p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-emerald-800 mb-6">سجل الاشتراكات</h1>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">سجل التدقيق (Audit Log)</CardTitle>
            </CardHeader>
            <CardContent>
              {logs && logs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-emerald-100">
                        <th className="text-right p-3 font-medium text-emerald-700">التاريخ</th>
                        <th className="text-right p-3 font-medium text-emerald-700">المدرسة</th>
                        <th className="text-right p-3 font-medium text-emerald-700">الإجراء</th>
                        <th className="text-right p-3 font-medium text-emerald-700">القيمة القديمة</th>
                        <th className="text-right p-3 font-medium text-emerald-700">القيمة الجديدة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log.id} className="border-b border-emerald-50 hover:bg-emerald-50/50">
                          <td className="p-3 text-emerald-600">
                            {new Date(log.created_at).toLocaleDateString("ar-DZ")}
                          </td>
                          <td className="p-3 font-medium text-emerald-800">
                            {schoolMap.get(log.school_id) || log.school_id.slice(0, 8)}
                          </td>
                          <td className="p-3">
                            <Badge variant={actionVariants[log.action]}>
                              {actionLabels[log.action]}
                            </Badge>
                          </td>
                          <td className="p-3 text-emerald-600">{log.old_value || "-"}</td>
                          <td className="p-3 text-emerald-600">{log.new_value || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-emerald-500 py-8">لا توجد سجلات بعد</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
