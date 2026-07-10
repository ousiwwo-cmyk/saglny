"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { LEVELS_BRANCHES, BRANCHES } from "@/lib/constants"
import { submitRegistration } from "@/app/api/register/actions"
import { FiCheckCircle, FiAlertCircle, FiLoader } from "react-icons/fi"

interface RegistrationFormProps {
  schoolId: string
  levels: { level_id: string; is_active: boolean }[]
  subjects: { id: string; school_id: string; level_id: string; branch_id: string | null; name: string }[]
  teachers: { id: string; school_id: string; full_name: string; phone: string | null }[]
  teacherSubjects: { teacher_id: string; subject_id: string }[]
}

export function RegistrationForm({
  schoolId,
  levels,
  subjects,
  teachers,
  teacherSubjects,
}: RegistrationFormProps) {
  const [selectedLevel, setSelectedLevel] = useState("")
  const [selectedBranch, setSelectedBranch] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedTeacher, setSelectedTeacher] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const router = useRouter()

  const activeLevels = levels.filter((l) => l.is_active)

  // Get level details
  const currentLevelDetail = LEVELS_BRANCHES.find((l) => l.id === selectedLevel)
  const needsBranch = currentLevelDetail?.has_branches

  // Branches for selected level
  const availableBranches = BRANCHES.filter((b) => b.level_ids.includes(selectedLevel))

  // Subjects filtered by level and branch
  const filteredSubjects = subjects.filter((s) => {
    if (s.level_id !== selectedLevel) return false
    if (needsBranch && selectedBranch) {
      return s.branch_id === selectedBranch
    }
    if (!needsBranch) {
      return !s.branch_id
    }
    return false
  })

  // Teachers filtered by selected subject
  const filteredTeachers = teacherSubjects
    .filter((ts) => ts.subject_id === selectedSubject)
    .map((ts) => teachers.find((t) => t.id === ts.teacher_id))
    .filter(Boolean)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})

    const formData = new FormData(e.currentTarget)
    formData.set("school_id", schoolId)

    const result = await submitRegistration(formData)

    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        router.push("/")
        router.refresh()
      }, 3000)
    } else {
      setErrors(result.error || {})
    }
    setSubmitting(false)
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <FiCheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-emerald-800 mb-2">تم التسجيل بنجاح!</h3>
        <p className="text-sm text-emerald-600">سيصلك إيميل تأكيد قريبًا</p>
      </div>
    )
  }

  if (activeLevels.length === 0) {
    return (
      <div className="text-center py-8 text-emerald-500 text-sm">
        لا توجد مستويات مفعلة حاليًا
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.general && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          <FiAlertCircle className="h-4 w-4 shrink-0" />
          {errors.general[0]}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-emerald-700 mb-1">الاسم واللقب</label>
        <Input name="full_name" placeholder="أدخل اسمك الكامل" required />
        {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name[0]}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-emerald-700 mb-1">رقم الهاتف</label>
        <Input name="phone" type="tel" placeholder="05XX XX XX XX" required />
        {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone[0]}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-emerald-700 mb-1">البريد الإلكتروني</label>
        <Input name="email" type="email" placeholder="example@email.com" required />
        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email[0]}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-emerald-700 mb-1">المستوى الدراسي</label>
        <select
          name="level_id"
          value={selectedLevel}
          onChange={(e) => {
            setSelectedLevel(e.target.value)
            setSelectedBranch("")
            setSelectedSubject("")
            setSelectedTeacher("")
          }}
          required
          className="flex h-10 w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">اختر المستوى</option>
          {activeLevels.map((l) => {
            const detail = LEVELS_BRANCHES.find((lb) => lb.id === l.level_id)
            return (
              <option key={l.level_id} value={l.level_id}>
                {detail?.name || l.level_id}
              </option>
            )
          })}
        </select>
      </div>

      {needsBranch && availableBranches.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-emerald-700 mb-1">الشعبة</label>
          <select
            name="branch_id"
            value={selectedBranch}
            onChange={(e) => {
              setSelectedBranch(e.target.value)
              setSelectedSubject("")
              setSelectedTeacher("")
            }}
            className="flex h-10 w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">اختر الشعبة</option>
            {availableBranches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedLevel && (filteredSubjects.length > 0) && (
        <div>
          <label className="block text-sm font-medium text-emerald-700 mb-1">المادة</label>
          <select
            name="subject_id"
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value)
              setSelectedTeacher("")
            }}
            required
            className="flex h-10 w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">اختر المادة</option>
            {filteredSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedSubject && filteredTeachers.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-emerald-700 mb-1">الأستاذ</label>
          <select
            name="teacher_id"
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            required
            className="flex h-10 w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">اختر الأستاذ</option>
            {filteredTeachers.map((t) => (
              <option key={t!.id} value={t!.id}>
                {t!.full_name}
              </option>
            ))}
          </select>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? (
          <>
            <FiLoader className="animate-spin ml-2" />
            جاري التسجيل...
          </>
        ) : (
          "تسجيل"
        )}
      </Button>
    </form>
  )
}
