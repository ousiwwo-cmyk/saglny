"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { WILAYAS } from "@/lib/constants"
import { FiSave, FiExternalLink, FiAlertCircle } from "react-icons/fi"
import { School } from "@/types"

export function SchoolSettings({ school }: { school: School }) {
  const [form, setForm] = useState({
    name: school.name,
    description: school.description || "",
    wilaya: school.wilaya,
    address: school.address || "",
    phone: school.phone || "",
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    await supabase.from("schools").update(form).eq("id", school.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    router.refresh()
  }

  const isExpiringSoon = school.subscription_expires_at &&
    new Date(school.subscription_expires_at) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  const isExpired = school.subscription_expires_at &&
    new Date(school.subscription_expires_at) < new Date()

  const whatsappUrl = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "213XXXXXXXXX"}?text=${encodeURIComponent(
    `السلام عليكم، أريد تجديد اشتراك أكاديمية "${school.name}" (الباقة الحالية: ${school.subscription_plan || "بدون باقة"}).`
  )}`

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-emerald-800">الإعدادات</h1>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">الملف الشخصي</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-emerald-700 mb-1">اسم الأكاديمية</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-700 mb-1">الولاية</label>
              <select
                value={form.wilaya}
                onChange={(e) => setForm({ ...form, wilaya: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {WILAYAS.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-emerald-700 mb-1">الوصف</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="flex w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-emerald-700 mb-1">رقم الهاتف</label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-700 mb-1">العنوان</label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <FiSave className="ml-2" />
            {saving ? "جاري الحفظ..." : saved ? "تم الحفظ" : "حفظ التغييرات"}
          </Button>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">الاشتراك</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600">الباقة الحالية</p>
              <p className="font-semibold text-emerald-800">{school.subscription_plan || "بدون باقة"}</p>
            </div>
            <Badge variant={isExpired ? "danger" : isExpiringSoon ? "warning" : "success"}>
              {isExpired ? "منتهي" : isExpiringSoon ? "ينتهي قريبًا" : "نشط"}
            </Badge>
          </div>

          {school.subscription_expires_at && (
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <FiAlertCircle className="h-4 w-4" />
              تاريخ الانتهاء: {new Date(school.subscription_expires_at).toLocaleDateString("ar-DZ")}
            </div>
          )}

          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="default" className="w-full">
              <FiExternalLink className="ml-2" />
              تجديد الاشتراك عبر واتساب
            </Button>
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
