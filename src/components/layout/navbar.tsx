"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { FiUser, FiLogOut, FiGrid } from "react-icons/fi"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter, usePathname } from "next/navigation"

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const isDashboard = pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin")

  return (
    <header className="sticky top-0 z-50 w-full border-b border-emerald-100 bg-white/80 backdrop-blur-md" dir="rtl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700 text-white text-sm font-bold">
            أ
          </div>
          <span className="text-xl font-bold text-emerald-800">سجلني</span>
        </Link>

        {!isDashboard && (
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm text-emerald-700 hover:text-emerald-900 transition-colors">
              الرئيسية
            </Link>
            <Link href="/schools" className="text-sm text-emerald-700 hover:text-emerald-900 transition-colors">
              الأكاديميات
            </Link>
          </nav>
        )}

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <Link href={pathname?.startsWith("/admin") ? "/admin" : "/dashboard"}>
                <Button variant="ghost" size="sm">
                  <FiGrid className="ml-1" />
                  لوحة التحكم
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <FiLogOut className="ml-1" />
                تسجيل خروج
              </Button>
            </div>
          ) : (
            <Link href="/auth/login">
              <Button variant="default" size="sm">
                <FiUser className="ml-1" />
                دخول
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
