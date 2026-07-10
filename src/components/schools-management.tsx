"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { School } from "@/types"
import { FiSearch, FiCheck, FiX, FiSettings, FiExternalLink } from "react-icons/fi"
import { SUBSCRIPTION_PLANS } from "@/lib/constants"

export function SchoolsManagement({ schools, adminId }: { schools: School[]; adminId: string }) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [subscribeDialogOpen, setSubscribeDialogOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const filtered = schools.filter((s) => {
    const matchesSearch = s.name.includes(search) || s.wilaya.includes(search)
    const matchesStatus = statusFilter === "all" || s.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("schools").update({ status }).eq("id", id)

    // Log the action
    await supabase.from("subscriptions_log").insert({
      school_id: id,
      action: "change_plan",
      performed_by: adminId,
      old_value: null,
      new_value: `status:${status}`,
    })

    router.refresh()
  }

  const updateSubscription = async () => {
    if (!selectedSchool) return

    const plan = (document.getElementById("sub-plan") as HTMLSelectElement)?.value
    const expiresAt = (document.getElementById("sub-expires") as HTMLInputElement)?.value

    await supabase
      .from("schools")
      .update({
        subscription_plan: plan || null,
        subscription_expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      })
      .eq("id", selectedSchool.id)

    await supabase.from("subscriptions_log").insert({
      school_id: selectedSchool.id,
      action: "change_plan",
      performed_by: adminId,
      old_value: selectedSchool.subscription_plan,
      new_value: plan,
    })

    setSubscribeDialogOpen(false)
    router.refresh()
  }

  const statusLabels: Record<string, string> = {
    pending: "قيد المراجعة",
    approved: "مقبول",
    rejected: "مرفوض",
  }

  const statusVariants: Record<string, "warning" | "success" | "danger"> = {
    pending: "warning",
    approved: "success",
    rejected: "danger",
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 h-4 w-4" />
          <Input
            placeholder="بحث باسم المدرسة أو الولاية..."
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
          <option value="pending">قيد المراجعة</option>
          <option value="approved">مقبول</option>
          <option value="rejected">مرفوض</option>
        </select>
      </div>

      <div className="space-y-4">
        {filtered.map((school) => (
          <Card key={school.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 text-lg font-bold">
                    {school.logo_url ? (
                      <img src={school.logo_url} alt={school.name} className="h-12 w-12 rounded-xl object-cover" />
                    ) : (
                      school.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-800">{school.name}</h3>
                    <p className="text-sm text-emerald-600">{school.wilaya} - {school.phone || "بدون هاتف"}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant={statusVariants[school.status]}>
                        {statusLabels[school.status]}
                      </Badge>
                      {school.subscription_plan && (
                        <Badge variant="outline">{school.subscription_plan}</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {school.status === "pending" && (
                    <>
                      <Button size="sm" variant="default" onClick={() => updateStatus(school.id, "approved")}>
                        <FiCheck className="ml-1" />
                        قبول
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => updateStatus(school.id, "rejected")}>
                        <FiX className="ml-1" />
                        رفض
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedSchool(school)
                      setSubscribeDialogOpen(true)
                    }}
                  >
                    <FiSettings className="ml-1" />
                    الاشتراك
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subscription Dialog */}
      <Dialog open={subscribeDialogOpen} onOpenChange={setSubscribeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إدارة الاشتراك: {selectedSchool?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-emerald-700 mb-1">الباقة</label>
              <select
                id="sub-plan"
                defaultValue={selectedSchool?.subscription_plan || ""}
                className="flex h-10 w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">بدون باقة</option>
                {SUBSCRIPTION_PLANS.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-700 mb-1">تاريخ الانتهاء</label>
              <input
                id="sub-expires"
                type="date"
                defaultValue={selectedSchool?.subscription_expires_at
                  ? new Date(selectedSchool.subscription_expires_at).toISOString().split("T")[0]
                  : ""}
                className="flex h-10 w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <Button onClick={updateSubscription} className="w-full">حفظ التغييرات</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
