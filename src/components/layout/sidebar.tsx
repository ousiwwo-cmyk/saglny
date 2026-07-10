"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  FiGrid, FiUsers, FiBookOpen, FiUserCheck, FiSettings,
  FiLogOut, FiHome, FiChevronLeft
} from "react-icons/fi"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function SchoolSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const links = [
    { href: "/dashboard", label: "الرئيسية", icon: FiHome },
    { href: "/dashboard/educational-structure", label: "الهيكل التعليمي", icon: FiBookOpen },
    { href: "/dashboard/students", label: "التلاميذ", icon: FiUsers },
    { href: "/dashboard/teachers", label: "الأساتذة", icon: FiUserCheck },
    { href: "/dashboard/settings", label: "الإعدادات", icon: FiSettings },
  ]

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <aside className="w-64 min-h-screen bg-white border-l border-emerald-100 p-4 flex flex-col">
      <Link href="/dashboard" className="flex items-center gap-2 mb-8 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-white text-sm font-bold">
          أ
        </div>
        <span className="font-bold text-emerald-800">سجلني</span>
      </Link>

      <nav className="flex-1 space-y-1">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? "bg-emerald-100 text-emerald-800 font-medium"
                  : "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <Button variant="ghost" className="justify-start text-emerald-600" onClick={handleLogout}>
        <FiLogOut className="ml-2" />
        تسجيل خروج
      </Button>
    </aside>
  )
}

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const links = [
    { href: "/admin", label: "الرئيسية", icon: FiHome },
    { href: "/admin/schools", label: "المدارس", icon: FiGrid },
    { href: "/admin/subscriptions", label: "الاشتراكات", icon: FiSettings },
  ]

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <aside className="w-64 min-h-screen bg-white border-l border-emerald-100 p-4 flex flex-col">
      <Link href="/admin" className="flex items-center gap-2 mb-8 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white text-sm font-bold">
          أ
        </div>
        <span className="font-bold text-emerald-800">الإدارة</span>
      </Link>

      <nav className="flex-1 space-y-1">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? "bg-emerald-100 text-emerald-800 font-medium"
                  : "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <Button variant="ghost" className="justify-start text-emerald-600" onClick={handleLogout}>
        <FiLogOut className="ml-2" />
        تسجيل خروج
      </Button>
    </aside>
  )
}
