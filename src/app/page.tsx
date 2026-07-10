import Link from "next/link"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { FiSearch, FiStar, FiMapPin, FiUsers, FiBookOpen } from "react-icons/fi"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WILAYAS } from "@/lib/constants"

async function getStats() {
  const supabase = await createServerSupabaseClient()
  const { count: schoolsCount } = await supabase
    .from("schools")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved")

  const { count: registrationsCount } = await supabase
    .from("registrations")
    .select("*", { count: "exact", head: true })

  return { schoolsCount: schoolsCount || 0, registrationsCount: registrationsCount || 0 }
}

async function getFeaturedSchools() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from("schools")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(6)

  return data || []
}

export default async function HomePage() {
  const [stats, schools] = await Promise.all([getStats(), getFeaturedSchools()])

  return (
    <div className="bg-pattern-geometric" dir="rtl">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-700 text-white">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,50 C20,30 40,70 60,50 C80,30 100,70 100,50 L100,100 L0,100 Z" fill="currentColor" />
          </svg>
        </div>
        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              منصتك الجزائرية{" "}
              <span className="text-emerald-300">للأكاديميات</span>
              <br />والمدارس الخاصة
            </h1>
            <p className="text-lg md:text-xl text-emerald-100 mb-10 leading-relaxed">
              ابحث عن أفضل الأكاديميات والمدارس الخاصة في جميع ولايات الجزائر،
              تصفح المواد والأساتذة، وسجل بكل سهولة
            </p>

            <Link href="/schools">
              <Button size="lg" className="bg-white text-emerald-800 hover:bg-emerald-50 text-base px-10 shadow-lg">
                <FiSearch className="ml-2 h-5 w-5" />
                ابحث عن أكاديمية
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Card className="bg-white shadow-lg border-emerald-100">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100">
                <FiBookOpen className="h-7 w-7 text-emerald-700" />
              </div>
              <div>
                <p className="text-3xl font-bold text-emerald-800">{stats.schoolsCount}</p>
                <p className="text-sm text-emerald-600">أكاديمية مسجلة</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg border-emerald-100">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100">
                <FiUsers className="h-7 w-7 text-emerald-700" />
              </div>
              <div>
                <p className="text-3xl font-bold text-emerald-800">{stats.registrationsCount}</p>
                <p className="text-sm text-emerald-600">تسجيل تلميذ</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Featured Schools */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-emerald-800 mb-3">أشهر الأكاديميات</h2>
          <p className="text-emerald-600">اكتشف الأكاديميات المعتمدة في جميع الولايات</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schools.map((school) => (
            <Link key={school.id} href={`/schools/${school.id}`}>
              <Card className="group hover:shadow-md transition-all duration-300 border-emerald-100 h-full">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 text-xl font-bold">
                      {school.logo_url ? (
                        <img src={school.logo_url} alt={school.name} className="h-14 w-14 rounded-xl object-cover" />
                      ) : (
                        school.name.charAt(0)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-emerald-800 group-hover:text-emerald-600 transition-colors truncate">
                        {school.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-1 text-sm text-emerald-600">
                        <FiMapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{school.wilaya}</span>
                      </div>
                    </div>
                  </div>
                  {school.description && (
                    <p className="mt-3 text-sm text-emerald-600 line-clamp-2">
                      {school.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {schools.length === 0 && (
          <p className="text-center text-emerald-500 py-12">لا توجد أكاديميات معتمدة بعد</p>
        )}

        <div className="text-center mt-10">
          <Link href="/schools">
            <Button variant="outline" size="lg">
              عرض الكل
            </Button>
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-emerald-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-emerald-800 mb-3">كيف تعمل المنصة؟</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mx-auto mb-4">
                <FiSearch className="h-7 w-7" />
              </div>
              <h3 className="font-semibold text-emerald-800 mb-2">ابحث</h3>
              <p className="text-sm text-emerald-600">تصفح الأكاديميات حسب الولاية والمستوى والمادة</p>
            </div>
            <div className="text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mx-auto mb-4">
                <FiStar className="h-7 w-7" />
              </div>
              <h3 className="font-semibold text-emerald-800 mb-2">اختر</h3>
              <p className="text-sm text-emerald-600">اختر الأستاذ والمادة المناسبين لك</p>
            </div>
            <div className="text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mx-auto mb-4">
                <FiUsers className="h-7 w-7" />
              </div>
              <h3 className="font-semibold text-emerald-800 mb-2">سجّل</h3>
              <p className="text-sm text-emerald-600">املأ النموذج وستصلك رسالة تأكيد فورًا</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
