"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FiSearch, FiCheck, FiX, FiClock } from "react-icons/fi"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

interface Registration {
  id: string
  school_id: string
  full_name: string
  phone: string
  email: string
  level_id: string
  branch_id: string | null
  subject_id: string
  teacher_id: string
  status: "pending" | "confirmed" | "cancelled"
  created_at: string
}

export function StudentsTable({ registrations }: { registrations: Registration[] }) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [updating, setUpdating] = useState<string | null>(null)
  const router = useRouter()

  const statusLabels = {
    pending: "قيد الانتظار",
    confirmed: "مؤكد",
    cancelled: "ملغى",
  }

  const statusVariants = {
    pending: "warning" as const,
    confirmed: "success" as const,
    cancelled: "danger" as const,
  }

  const filtered = registrations.filter((r) => {
    const matchesSearch =
      r.full_name.includes(search) ||
      r.email.includes(search) ||
      r.phone.includes(search)
    const matchesStatus = statusFilter === "all" || r.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdating(id)
    const supabase = createClient()
    await supabase.from("registrations").update({ status: newStatus }).eq("id", id)
    setUpdating(null)
    router.refresh()
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 h-4 w-4" />
          <Input
            placeholder="بحث بالاسم أو البريد أو الهاتف..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-lg border border-emerald-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">كل الحالات</option>
          <option value="pending">قيد الانتظار</option>
          <option value="confirmed">مؤكد</option>
          <option value="cancelled">ملغى</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-emerald-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-emerald-50">
              <tr>
                <th className="text-right p-3 font-medium text-emerald-700">الاسم</th>
                <th className="text-right p-3 font-medium text-emerald-700">الهاتف</th>
                <th className="text-right p-3 font-medium text-emerald-700">البريد</th>
                <th className="text-right p-3 font-medium text-emerald-700">المستوى</th>
                <th className="text-right p-3 font-medium text-emerald-700">المادة</th>
                <th className="text-right p-3 font-medium text-emerald-700">الأستاذ</th>
                <th className="text-right p-3 font-medium text-emerald-700">الحالة</th>
                <th className="text-center p-3 font-medium text-emerald-700">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((reg) => (
                <tr key={reg.id} className="border-t border-emerald-50 hover:bg-emerald-50/50 transition-colors">
                  <td className="p-3 font-medium text-emerald-800">{reg.full_name}</td>
                  <td className="p-3 text-emerald-600">{reg.phone}</td>
                  <td className="p-3 text-emerald-600">{reg.email}</td>
                  <td className="p-3 text-emerald-600">{reg.level_id}{reg.branch_id ? ` - ${reg.branch_id}` : ""}</td>
                  <td className="p-3 text-emerald-600">{reg.subject_id.slice(0, 8)}...</td>
                  <td className="p-3 text-emerald-600">{reg.teacher_id.slice(0, 8)}...</td>
                  <td className="p-3">
                    <Badge variant={statusVariants[reg.status]}>
                      {statusLabels[reg.status]}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-center gap-1">
                      {reg.status !== "confirmed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateStatus(reg.id, "confirmed")}
                          disabled={updating === reg.id}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <FiCheck className="h-4 w-4" />
                        </Button>
                      )}
                      {reg.status !== "cancelled" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateStatus(reg.id, "cancelled")}
                          disabled={updating === reg.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <FiX className="h-4 w-4" />
                        </Button>
                      )}
                      {reg.status === "cancelled" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateStatus(reg.id, "pending")}
                          disabled={updating === reg.id}
                          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                        >
                          <FiClock className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-emerald-500 py-8">لا توجد تسجيلات</p>
        )}
      </div>
    </div>
  )
}
