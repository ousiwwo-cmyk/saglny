import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SchoolSidebar } from "@/components/layout/sidebar"
import { EducationalStructure } from "@/components/educational-structure"

export default async function EducationalStructurePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: levels } = await supabase
    .from("school_levels")
    .select("*")
    .eq("school_id", user.id)

  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .eq("school_id", user.id)

  const { data: teachers } = await supabase
    .from("teachers")
    .select("*")
    .eq("school_id", user.id)

  const { data: teacherSubjects } = await supabase
    .from("teacher_subjects")
    .select("*")

  const { data: school } = await supabase
    .from("schools")
    .select("name")
    .eq("id", user.id)
    .single()

  // If no levels initialized, create default entries
  if (!levels || levels.length === 0) {
    const { LEVELS_BRANCHES } = await import("@/lib/constants")
    const defaults = LEVELS_BRANCHES.map((l) => ({
      school_id: user.id,
      level_id: l.id,
      is_active: false,
    }))
    await supabase.from("school_levels").insert(defaults)

    // Refetch
    const { data: newLevels } = await supabase
      .from("school_levels")
      .select("*")
      .eq("school_id", user.id)

    return (
      <div className="flex min-h-screen" dir="rtl">
        <SchoolSidebar />
        <div className="flex-1 bg-emerald-50/50 p-8">
          <EducationalStructure
            schoolId={user.id}
            levels={newLevels || []}
            subjects={subjects || []}
            teachers={teachers || []}
            teacherSubjects={teacherSubjects || []}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen" dir="rtl">
      <SchoolSidebar />
      <div className="flex-1 bg-emerald-50/50 p-8">
        <EducationalStructure
          schoolId={user.id}
          levels={levels || []}
          subjects={subjects || []}
          teachers={teachers || []}
          teacherSubjects={teacherSubjects || []}
        />
      </div>
    </div>
  )
}
