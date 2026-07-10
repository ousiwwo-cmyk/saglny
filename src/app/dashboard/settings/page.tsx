import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SchoolSidebar } from "@/components/layout/sidebar"
import { SchoolSettings } from "@/components/school-settings"

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: school } = await supabase
    .from("schools")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!school) redirect("/")

  return (
    <div className="flex min-h-screen" dir="rtl">
      <SchoolSidebar />
      <div className="flex-1 bg-emerald-50/50 p-8">
        <SchoolSettings school={school} />
      </div>
    </div>
  )
}
