"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { LEVELS_BRANCHES, BRANCHES } from "@/lib/constants"
import { FiPlus, FiTrash2, FiEdit2, FiCheck, FiX } from "react-icons/fi"

interface SchoolLevel {
  school_id: string
  level_id: string
  is_active: boolean
}

interface Subject {
  id: string
  school_id: string
  level_id: string
  branch_id: string | null
  name: string
}

interface Teacher {
  id: string
  school_id: string
  full_name: string
  phone: string | null
}

interface TeacherSubject {
  teacher_id: string
  subject_id: string
}

export function EducationalStructure({
  schoolId,
  levels,
  subjects,
  teachers,
  teacherSubjects,
}: {
  schoolId: string
  levels: SchoolLevel[]
  subjects: Subject[]
  teachers: Teacher[]
  teacherSubjects: TeacherSubject[]
}) {
  const router = useRouter()
  const supabase = createClient()

  const [newSubject, setNewSubject] = useState({ level_id: "", branch_id: "", name: "" })
  const [newTeacher, setNewTeacher] = useState({ full_name: "", phone: "" })
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
  const [subjectDialogOpen, setSubjectDialogOpen] = useState(false)
  const [teacherDialogOpen, setTeacherDialogOpen] = useState(false)

  const toggleLevel = async (levelId: string, active: boolean) => {
    await supabase
      .from("school_levels")
      .update({ is_active: active })
      .eq("school_id", schoolId)
      .eq("level_id", levelId)
    router.refresh()
  }

  const addSubject = async () => {
    if (!newSubject.name || !newSubject.level_id) return
    await supabase.from("subjects").insert({
      school_id: schoolId,
      level_id: newSubject.level_id,
      branch_id: newSubject.branch_id || null,
      name: newSubject.name,
    })
    setNewSubject({ level_id: "", branch_id: "", name: "" })
    setSubjectDialogOpen(false)
    router.refresh()
  }

  const updateSubject = async () => {
    if (!editingSubject) return
    await supabase
      .from("subjects")
      .update({ name: editingSubject.name, branch_id: editingSubject.branch_id })
      .eq("id", editingSubject.id)
    setEditingSubject(null)
    router.refresh()
  }

  const deleteSubject = async (id: string) => {
    await supabase.from("subjects").delete().eq("id", id)
    router.refresh()
  }

  const addTeacher = async () => {
    if (!newTeacher.full_name) return
    const { data } = await supabase
      .from("teachers")
      .insert({ school_id: schoolId, full_name: newTeacher.full_name, phone: newTeacher.phone || null })
      .select()
      .single()
    setNewTeacher({ full_name: "", phone: "" })
    setTeacherDialogOpen(false)
    router.refresh()
  }

  const updateTeacher = async () => {
    if (!editingTeacher) return
    await supabase
      .from("teachers")
      .update({ full_name: editingTeacher.full_name, phone: editingTeacher.phone })
      .eq("id", editingTeacher.id)
    setEditingTeacher(null)
    router.refresh()
  }

  const deleteTeacher = async (id: string) => {
    await supabase.from("teacher_subjects").delete().eq("teacher_id", id)
    await supabase.from("teachers").delete().eq("id", id)
    router.refresh()
  }

  const assignTeacherToSubject = async (teacherId: string, subjectId: string) => {
    const exists = teacherSubjects.find(
      (ts) => ts.teacher_id === teacherId && ts.subject_id === subjectId
    )
    if (exists) {
      await supabase
        .from("teacher_subjects")
        .delete()
        .eq("teacher_id", teacherId)
        .eq("subject_id", subjectId)
    } else {
      await supabase
        .from("teacher_subjects")
        .insert({ teacher_id: teacherId, subject_id: subjectId })
    }
    router.refresh()
  }

  const groupedLevels = (cat: string) =>
    levels.filter((l) => LEVELS_BRANCHES.find((lb) => lb.id === l.level_id)?.category === cat)

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-emerald-800 mb-6">الهيكل التعليمي</h1>

      <Tabs defaultValue="levels">
        <TabsList className="mb-6">
          <TabsTrigger value="levels">المستويات</TabsTrigger>
          <TabsTrigger value="subjects">المواد</TabsTrigger>
          <TabsTrigger value="teachers">الأساتذة</TabsTrigger>
        </TabsList>

        {/* Levels Tab */}
        <TabsContent value="levels">
          <Card>
            <CardContent className="p-6 space-y-6">
              {["ابتدائي", "متوسط", "ثانوي"].map((cat) => {
                const catLevels = groupedLevels(cat)
                if (catLevels.length === 0) return null
                return (
                  <div key={cat}>
                    <h3 className="font-semibold text-emerald-700 mb-3 text-lg">{cat}</h3>
                    <div className="space-y-2">
                      {catLevels.map((level) => {
                        const detail = LEVELS_BRANCHES.find((lb) => lb.id === level.level_id)
                        return (
                          <div
                            key={level.level_id}
                            className="flex items-center justify-between p-3 rounded-lg bg-emerald-50"
                          >
                            <span className="text-emerald-800">{detail?.name || level.level_id}</span>
                            <Switch
                              checked={level.is_active}
                              onCheckedChange={(checked) => toggleLevel(level.level_id, checked)}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subjects Tab */}
        <TabsContent value="subjects">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-emerald-700">المواد الدراسية</h3>
                <Dialog open={subjectDialogOpen} onOpenChange={setSubjectDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <FiPlus className="ml-1" />
                      إضافة مادة
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>إضافة مادة جديدة</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <label className="block text-sm font-medium text-emerald-700 mb-1">المستوى</label>
                        <select
                          value={newSubject.level_id}
                          onChange={(e) => setNewSubject({ ...newSubject, level_id: e.target.value })}
                          className="flex h-10 w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="">اختر المستوى</option>
                          {levels.filter((l) => l.is_active).map((l) => {
                            const d = LEVELS_BRANCHES.find((lb) => lb.id === l.level_id)
                            return <option key={l.level_id} value={l.level_id}>{d?.name || l.level_id}</option>
                          })}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-emerald-700 mb-1">الشعبة (اختياري)</label>
                        <select
                          value={newSubject.branch_id}
                          onChange={(e) => setNewSubject({ ...newSubject, branch_id: e.target.value })}
                          className="flex h-10 w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="">بدون شعبة</option>
                          {BRANCHES.map((b) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-emerald-700 mb-1">اسم المادة</label>
                        <Input
                          value={newSubject.name}
                          onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                          placeholder="مثال: رياضيات"
                        />
                      </div>
                      <Button onClick={addSubject} className="w-full">إضافة</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {levels.filter((l) => l.is_active).map((level) => {
                  const levelSubjects = subjects.filter((s) => s.level_id === level.level_id)
                  if (levelSubjects.length === 0) return null
                  const detail = LEVELS_BRANCHES.find((lb) => lb.id === level.level_id)
                  return (
                    <div key={level.level_id}>
                      <h4 className="font-medium text-emerald-700 mb-2">{detail?.name || level.level_id}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {levelSubjects.map((subject) => (
                          <div key={subject.id} className="flex items-center justify-between p-3 rounded-lg bg-emerald-50">
                            <div>
                              <span className="text-emerald-800">{subject.name}</span>
                              {subject.branch_id && (
                                <Badge variant="outline" className="mr-2 text-xs">
                                  {BRANCHES.find((b) => b.id === subject.branch_id)?.name}
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => setEditingSubject(subject)}>
                                <FiEdit2 className="h-4 w-4 text-emerald-600" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => deleteSubject(subject.id)}>
                                <FiTrash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Teachers Tab */}
        <TabsContent value="teachers">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-emerald-700">الأساتذة</h3>
                <Dialog open={teacherDialogOpen} onOpenChange={setTeacherDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <FiPlus className="ml-1" />
                      إضافة أستاذ
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>إضافة أستاذ جديد</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <label className="block text-sm font-medium text-emerald-700 mb-1">الاسم الكامل</label>
                        <Input
                          value={newTeacher.full_name}
                          onChange={(e) => setNewTeacher({ ...newTeacher, full_name: e.target.value })}
                          placeholder="الاسم واللقب"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-emerald-700 mb-1">رقم الهاتف</label>
                        <Input
                          value={newTeacher.phone}
                          onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                          placeholder="05XX XX XX XX"
                        />
                      </div>
                      <Button onClick={addTeacher} className="w-full">إضافة</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-3">
                {teachers.map((teacher) => {
                  const teacherSubjIds = teacherSubjects
                    .filter((ts) => ts.teacher_id === teacher.id)
                    .map((ts) => ts.subject_id)
                  const teacherSubjNames = teacherSubjIds
                    .map((sid) => subjects.find((s) => s.id === sid))
                    .filter(Boolean)

                  return (
                    <div key={teacher.id} className="p-4 rounded-lg bg-emerald-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-emerald-800">{teacher.full_name}</p>
                          {teacher.phone && <p className="text-sm text-emerald-600">{teacher.phone}</p>}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {teacherSubjNames.map((s) => (
                              <Badge key={s!.id} variant="outline" className="text-xs">
                                {s!.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setEditingTeacher(teacher)}>
                            <FiEdit2 className="h-4 w-4 text-emerald-600" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteTeacher(teacher.id)}>
                            <FiTrash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>

                      {/* Assign to subjects */}
                      <div className="mt-3 pt-3 border-t border-emerald-200">
                        <p className="text-xs text-emerald-600 mb-2">ربط بالمواد:</p>
                        <div className="flex flex-wrap gap-2">
                          {subjects.map((subject) => {
                            const isAssigned = teacherSubjIds.includes(subject.id)
                            return (
                              <button
                                key={subject.id}
                                onClick={() => assignTeacherToSubject(teacher.id, subject.id)}
                                className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                                  isAssigned
                                    ? "bg-emerald-600 text-white border-emerald-600"
                                    : "bg-white text-emerald-600 border-emerald-200 hover:border-emerald-400"
                                }`}
                              >
                                {subject.name}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
