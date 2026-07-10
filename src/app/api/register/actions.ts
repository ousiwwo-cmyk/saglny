"use server"

import { z } from "zod"
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase/server"

const phoneRegex = /^(0|\+213)[5-7][0-9]{8}$/

export const registrationSchema = z.object({
  full_name: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل").max(100),
  phone: z.string().regex(phoneRegex, "رقم الهاتف غير صحيح"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  school_id: z.string().uuid(),
  level_id: z.string().min(1),
  branch_id: z.string().nullable().optional(),
  subject_id: z.string().uuid(),
  teacher_id: z.string().uuid(),
})

export async function submitRegistration(formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = registrationSchema.safeParse({
    ...raw,
    branch_id: raw.branch_id === "" || raw.branch_id === "null" ? null : raw.branch_id,
  })

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors, success: false }
  }

  const supabase = await createServerSupabaseClient()
  const adminSupabase = await createAdminClient()

  const data = parsed.data

  // Verify subject belongs to school
  const { data: subject } = await supabase
    .from("subjects")
    .select("id, school_id, level_id, branch_id, name")
    .eq("id", data.subject_id)
    .eq("school_id", data.school_id)
    .single()

  if (!subject) {
    return { error: { subject_id: ["المادة غير موجودة"] }, success: false }
  }

  // Verify teacher is assigned to this subject
  const { data: ts } = await supabase
    .from("teacher_subjects")
    .select("teacher_id")
    .eq("teacher_id", data.teacher_id)
    .eq("subject_id", data.subject_id)
    .single()

  if (!ts) {
    return { error: { teacher_id: ["الأستاذ غير مرتبط بهذه المادة"] }, success: false }
  }

  // Verify teacher belongs to this school
  const { data: teacher } = await supabase
    .from("teachers")
    .select("id, school_id, full_name")
    .eq("id", data.teacher_id)
    .eq("school_id", data.school_id)
    .single()

  if (!teacher) {
    return { error: { teacher_id: ["الأستاذ غير موجود"] }, success: false }
  }

  // Verify level is active for this school
  const { data: level } = await supabase
    .from("school_levels")
    .select("level_id")
    .eq("school_id", data.school_id)
    .eq("level_id", data.level_id)
    .eq("is_active", true)
    .single()

  if (!level) {
    return { error: { level_id: ["المستوى غير مفعل"] }, success: false }
  }

  // Insert registration
  const { data: registration, error: insertError } = await supabase
    .from("registrations")
    .insert({
      school_id: data.school_id,
      full_name: data.full_name,
      phone: data.phone,
      email: data.email,
      level_id: data.level_id,
      branch_id: data.branch_id || null,
      subject_id: data.subject_id,
      teacher_id: data.teacher_id,
    })
    .select()
    .single()

  if (insertError) {
    console.error("Registration insert error:", insertError)
    return { error: { general: ["حدث خطأ أثناء التسجيل"] }, success: false }
  }

  // Get school name for email
  const { data: school } = await supabase
    .from("schools")
    .select("name, logo_url")
    .eq("id", data.school_id)
    .single()

  // Send email (non-blocking - don't fail if email fails)
  const { sendRegistrationEmail } = await import("@/lib/email")
  sendRegistrationEmail({
    to: data.email,
    studentName: data.full_name,
    teacherName: teacher.full_name,
    subjectName: subject.name,
    schoolName: school?.name || "",
    schoolLogo: school?.logo_url,
  }).catch((e) => console.error("Background email send failed:", e))

  return { success: true, data: registration }
}
