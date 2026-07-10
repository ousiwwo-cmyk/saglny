-- ============================================
-- قاعدة بيانات منصة أكاديميتي
-- ============================================

-- جدول المدارس
CREATE TABLE schools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  wilaya TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  subscription_plan TEXT CHECK (subscription_plan IN ('انطلاقة', 'نمو', 'احترافية')),
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- تفعيل RLS على المدارس
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- جدول المستويات الدراسية لكل مدرسة
CREATE TABLE school_levels (
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  level_id TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  PRIMARY KEY (school_id, level_id)
);

ALTER TABLE school_levels ENABLE ROW LEVEL SECURITY;

-- جدول المواد
CREATE TABLE subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  level_id TEXT NOT NULL,
  branch_id TEXT,
  name TEXT NOT NULL
);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- جدول الأساتذة
CREATE TABLE teachers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT
);

ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

-- جدول ربط الأساتذة بالمواد
CREATE TABLE teacher_subjects (
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  PRIMARY KEY (teacher_id, subject_id)
);

ALTER TABLE teacher_subjects ENABLE ROW LEVEL SECURITY;

-- جدول تسجيلات التلاميذ
CREATE TABLE registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  level_id TEXT NOT NULL,
  branch_id TEXT,
  subject_id UUID NOT NULL REFERENCES subjects(id),
  teacher_id UUID NOT NULL REFERENCES teachers(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- جدول سجل الاشتراكات
CREATE TABLE subscriptions_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('extend', 'change_plan', 'cancel')),
  performed_by UUID NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscriptions_log ENABLE ROW LEVEL SECURITY;

-- جدول الأدمن (يتم ملؤه يدويًا)
CREATE TABLE admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'admin' NOT NULL
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- المدارس: القراءة العامة للمعتمدة, المالك يعدل, الأدمن يقرأ/يكتب الكل
CREATE POLICY "public_read_approved" ON schools
  FOR SELECT USING (status = 'approved');

CREATE POLICY "school_owner_update" ON schools
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "school_owner_read" ON schools
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "admin_all_schools" ON schools
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- التسجيلات: المدرسة تقرأ/تعدّل تسجيلاتها, الإدراج للجميع, الأدمن الكل
CREATE POLICY "school_read_own_registrations" ON registrations
  FOR SELECT USING (school_id = auth.uid());

CREATE POLICY "school_update_own_registrations" ON registrations
  FOR UPDATE USING (school_id = auth.uid());

CREATE POLICY "public_insert_registrations" ON registrations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "admin_all_registrations" ON registrations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- المواد: المدرسة المالكة فقط, والأدمن
CREATE POLICY "school_own_subjects" ON subjects
  FOR ALL USING (school_id = auth.uid());

CREATE POLICY "admin_all_subjects" ON subjects
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- الأساتذة: المدرسة المالكة فقط, والأدمن
CREATE POLICY "school_own_teachers" ON teachers
  FOR ALL USING (school_id = auth.uid());

CREATE POLICY "admin_all_teachers" ON teachers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- ربط الأساتذة بالمواد: المدرسة المالكة, والأدمن
CREATE POLICY "school_own_teacher_subjects" ON teacher_subjects
  FOR ALL USING (
    EXISTS (SELECT 1 FROM teachers WHERE id = teacher_id AND school_id = auth.uid())
  );

CREATE POLICY "admin_all_teacher_subjects" ON teacher_subjects
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- مستويات المدرسة: المدرسة المالكة, والأدمن
CREATE POLICY "school_own_levels" ON school_levels
  FOR ALL USING (school_id = auth.uid());

CREATE POLICY "admin_all_levels" ON school_levels
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- سجل الاشتراكات: الأدمن فقط
CREATE POLICY "admin_subscriptions_log" ON subscriptions_log
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- الأدمن: القراءة فقط للأدمن أنفسهم
CREATE POLICY "admin_read_self" ON admins
  FOR SELECT USING (id = auth.uid());

-- ============================================
-- Supabase Storage Policies
-- ============================================
-- إنشاء Bucket للملفات
-- INSERT INTO storage.buckets (id, name, public) VALUES ('school_logos', 'school_logos', true);

-- Policy: رفع للجميع مع تحقق (سيتم ضبطه في Supabase Dashboard)
-- لكن هنا الـ SQL للرجوع إليه:
-- CREATE POLICY "school_upload_own_logo" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'school_logos' AND
--     (storage.foldername(name))[1] = auth.uid()::text
--   );
