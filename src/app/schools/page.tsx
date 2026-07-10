import { createServerSupabaseClient } from "@/lib/supabase/server"
import Link from "next/link"
import { FiSearch, FiMapPin } from "react-icons/fi"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { WILAYAS } from "@/lib/constants"

async function getSchools(searchParams: { wilaya?: string; q?: string }) {
  const supabase = await createServerSupabaseClient()
  let query = supabase
    .from("schools")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false })

  if (searchParams.wilaya) {
    query = query.eq("wilaya", searchParams.wilaya)
  }

  if (searchParams.q) {
    query = query.ilike("name", `%${searchParams.q}%`)
  }

  const { data } = await query
  return data || []
}

export default async function SchoolsPage(props: { searchParams: Promise<{ wilaya?: string; q?: string }> }) {
  const searchParams = await props.searchParams
  const schools = await getSchools(searchParams)

  return (
    <div className="bg-pattern-geometric min-h-screen" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-emerald-800 mb-2">الأكاديميات</h1>
          <p className="text-emerald-600">تصفح الأكاديميات والمدارس الخاصة في جميع ولايات الجزائر</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-emerald-100 p-4 mb-8 shadow-sm">
          <form className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-emerald-700 mb-1">البحث</label>
              <div className="relative">
                <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 h-4 w-4" />
                <Input
                  name="q"
                  defaultValue={searchParams.q || ""}
                  placeholder="ابحث عن أكاديمية..."
                  className="pr-10"
                />
              </div>
            </div>
            <div className="w-full md:w-64">
              <label className="block text-sm font-medium text-emerald-700 mb-1">الولاية</label>
              <select
                name="wilaya"
                defaultValue={searchParams.wilaya || ""}
                className="flex h-10 w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">كل الولايات</option>
                {WILAYAS.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button type="submit">بحث</Button>
            </div>
          </form>
        </div>

        {/* Results */}
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
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-emerald-800 group-hover:text-emerald-600 transition-colors truncate">
                          {school.name}
                        </h3>
                        {school.subscription_plan === "نمو" || school.subscription_plan === "احترافية" ? (
                          <Badge variant="success" className="shrink-0">معتمدة</Badge>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-sm text-emerald-600">
                        <FiMapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{school.wilaya}</span>
                      </div>
                    </div>
                  </div>
                  {school.description && (
                    <p className="mt-3 text-sm text-emerald-600 line-clamp-2">{school.description}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {schools.length === 0 && (
          <div className="text-center py-20">
            <p className="text-emerald-500 text-lg">لا توجد أكاديميات في هذه الولاية</p>
          </div>
        )}
      </div>
    </div>
  )
}
