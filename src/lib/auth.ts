import { createClient } from "@/lib/supabase/client"

export async function getCurrentUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getCurrentSchool() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("schools")
    .select("*")
    .eq("id", user.id)
    .single()

  return data
}

export async function isAdmin(): Promise<boolean> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from("admins")
    .select("id")
    .eq("id", user.id)
    .single()

  return !!data
}

export async function getSchoolById(id: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from("schools")
    .select("*")
    .eq("id", id)
    .single()

  return data
}
