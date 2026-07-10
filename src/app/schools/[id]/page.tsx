import { createServerSupabaseClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { FiMapPin, FiPhone, FiMail, FiArrowRight, FiCheckCircle } from "react-icons/fi"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RegistrationForm } from "@/components/registration-form"

export default async function SchoolDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createServerSupabaseClient()

  const { data: school } = await supabase
    .from("schools")
    .select("*")
    .eq("id", params.id)
    .eq("status", "approved")
    .single()

  if (!school) notFound()

  const { data: levels } = await supabase
    .from("school_levels")
    .select("level_id, is_active")
    .eq("school_id", params.id)
    .eq("is_active", true)

  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .eq("school_id", params.id)

  const { data: teachers } = await supabase
    .from("teachers")
    .select("*")
    .eq("school_id", params.id)

  const { data: teacherSubjects } = await supabase
    .from("teacher_subjects")
    .select("*")

  const hasPremium = school.subscription_plan === "نمو" || school.subscription_plan === "احترافية"

  // Group subjects by level
  const subjectsByLevel: Record<string, typeof subjects> = {}
  subjects?.forEach((s) => {
    if (!subjectsByLevel[s.level_id]) subjectsByLevel[s.level_id] = []
    subjectsByLevel[s.level_id].push(s)
  })

  // Get teachers for each subject
  const teachersBySubject: Record<string, typeof teachers> = {}
  teacherSubjects?.forEach((ts) => {
    if (!teachersBySubject[ts.subject_id]) teachersBySubject[ts.subject_id] = []
    const teacher = teachers?.find((t) => t.id === ts.teacher_id)
    if (teacher) {
      teachersBySubject[ts.subject_id] = [
        ...(teachersBySubject[ts.subject_id] || []),
        teacher,
      ]
    }
  })

  return (
    <div className="bg-pattern-geometric min-h-screen" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-emerald-600 mb-6">
          <Link href="/" className="hover:text-emerald-800">الرئيسية</Link>
          <span>/</span>
          <Link href="/schools" className="hover:text-emerald-800">الأكاديميات</Link>
          <span>/</span>
          <span className="text-emerald-800 font-medium">{school.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* School Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-5">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 text-3xl font-bold">
                    {school.logo_url ? (
                      <img src={school.logo_url} alt={school.name} className="h-20 w-20 rounded-2xl object-cover" />
                    ) : (
                      school.name.charAt(0)
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="text-2xl font-bold text-emerald-800">{school.name}</h1>
                      {hasPremium && (
                        <Badge variant="success" className="text-sm px-3 py-1">
                          <FiCheckCircle className="ml-1" />
                          معتمدة
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-emerald-600">
                      <span className="flex items-center gap-1">
                        <FiMapPin className="h-4 w-4" />
                        {school.wilaya}
                      </span>
                      {school.phone && (
                        <span className="flex items-center gap-1">
                          <FiPhone className="h-4 w-4" />
                          {school.phone}
                        </span>
                      )}
                    </div>
                    {school.description && (
                      <p className="mt-4 text-emerald-700 leading-relaxed">{school.description}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subjects per Level */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-emerald-800 mb-4">المواد والأساتذة</h2>
                {levels?.map((level) => {
                  const levelSubjects = subjectsByLevel[level.level_id] || []
                  return (
                    <div key={level.level_id} className="mb-6 last:mb-0">
                      <h3 className="font-semibold text-emerald-700 mb-3 pb-2 border-b border-emerald-100">
                        {level.level_id}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {levelSubjects.map((subject) => {
                          const subjectTeachers = teachersBySubject[subject.id] || []
                          return (
                            <div key={subject.id} className="bg-emerald-50 rounded-lg p-3">
                              <p className="font-medium text-emerald-800">{subject.name}</p>
                              {subject.branch_id && (
                                <p className="text-xs text-emerald-500 mt-1">الشعبة: {subject.branch_id}</p>
                              )}
                              <div className="flex flex-wrap gap-1 mt-2">
                                {subjectTeachers.map((t) => (
                                  <Badge key={t.id} variant="outline" className="text-xs">
                                    {t.full_name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* Registration Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-emerald-800 mb-4">سجّل الآن</h2>
                <RegistrationForm
                  schoolId={school.id}
                  levels={levels || []}
                  subjects={subjects || []}
                  teachers={teachers || []}
                  teacherSubjects={teacherSubjects || []}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
