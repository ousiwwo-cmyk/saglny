export type SchoolStatus = "pending" | "approved" | "rejected"
export type RegistrationStatus = "pending" | "confirmed" | "cancelled"
export type SubscriptionPlan = "انطلاقة" | "نمو" | "احترافية"
export type SubscriptionAction = "extend" | "change_plan" | "cancel"

export interface School {
  id: string
  name: string
  description: string | null
  logo_url: string | null
  wilaya: string
  address: string | null
  phone: string | null
  status: SchoolStatus
  subscription_plan: SubscriptionPlan | null
  subscription_expires_at: string | null
  created_at: string
}

export interface SchoolLevel {
  school_id: string
  level_id: string
  is_active: boolean
}

export interface Subject {
  id: string
  school_id: string
  level_id: string
  branch_id: string | null
  name: string
}

export interface Teacher {
  id: string
  school_id: string
  full_name: string
  phone: string | null
}

export interface TeacherSubject {
  teacher_id: string
  subject_id: string
}

export interface Registration {
  id: string
  school_id: string
  full_name: string
  phone: string
  email: string
  level_id: string
  branch_id: string | null
  subject_id: string
  teacher_id: string
  status: RegistrationStatus
  created_at: string
}

export interface SubscriptionLog {
  id: string
  school_id: string
  action: SubscriptionAction
  performed_by: string
  old_value: string | null
  new_value: string | null
  created_at: string
}

export interface Admin {
  id: string
  email: string
  role: string
}

export interface LevelBranch {
  id: string
  name: string
  category: "ابتدائي" | "متوسط" | "ثانوي"
  parent_id: string | null
  has_branches: boolean
}

export interface Wilaya {
  code: string
  name: string
}
