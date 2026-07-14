-- 001_initial_schema.sql
-- Phase 1: Supabase Foundation & Backend Scaffold
-- Creates all 5 tables, RLS policies, and storage bucket

-- 1. Profiles table (extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  avatar_url TEXT,
  is_online BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Classes table
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subject_code TEXT NOT NULL,
  offer_number TEXT NOT NULL,
  description TEXT,
  units INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Users can read their own classes
CREATE POLICY "Users can read own classes"
  ON classes FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own classes
CREATE POLICY "Users can insert own classes"
  ON classes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own classes
CREATE POLICY "Users can update own classes"
  ON classes FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own classes
CREATE POLICY "Users can delete own classes"
  ON classes FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  student_id TEXT NOT NULL,
  image_url TEXT,
  face_encoding JSONB,
  total_attendance INTEGER DEFAULT 0,
  last_attendance_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Users can read students in their own classes
CREATE POLICY "Users can read own students"
  ON students FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = students.class_id
      AND classes.user_id = auth.uid()
    )
  );

-- Users can insert students into their own classes
CREATE POLICY "Users can insert own students"
  ON students FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = students.class_id
      AND classes.user_id = auth.uid()
    )
  );

-- Users can update students in their own classes
CREATE POLICY "Users can update own students"
  ON students FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = students.class_id
      AND classes.user_id = auth.uid()
    )
  );

-- Users can delete students from their own classes
CREATE POLICY "Users can delete own students"
  ON students FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = students.class_id
      AND classes.user_id = auth.uid()
    )
  );

-- 4. Attendance Sessions table
CREATE TABLE IF NOT EXISTS attendance_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  session_name TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;

-- Users can read attendance sessions for their own classes
CREATE POLICY "Users can read own attendance_sessions"
  ON attendance_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = attendance_sessions.class_id
      AND classes.user_id = auth.uid()
    )
  );

-- Users can insert attendance sessions for their own classes
CREATE POLICY "Users can insert own attendance_sessions"
  ON attendance_sessions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = attendance_sessions.class_id
      AND classes.user_id = auth.uid()
    )
  );

-- Users can delete attendance sessions for their own classes
CREATE POLICY "Users can delete own attendance_sessions"
  ON attendance_sessions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = attendance_sessions.class_id
      AND classes.user_id = auth.uid()
    )
  );

-- 5. Attendance Records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  time_in TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, student_id)
);

ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- Users can read attendance records for their own sessions
CREATE POLICY "Users can read own attendance_records"
  ON attendance_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM attendance_sessions
      JOIN classes ON classes.id = attendance_sessions.class_id
      WHERE attendance_sessions.id = attendance_records.session_id
      AND classes.user_id = auth.uid()
    )
  );

-- Users can insert attendance records for their own sessions
CREATE POLICY "Users can insert own attendance_records"
  ON attendance_records FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM attendance_sessions
      JOIN classes ON classes.id = attendance_sessions.class_id
      WHERE attendance_sessions.id = attendance_records.session_id
      AND classes.user_id = auth.uid()
    )
  );

-- Enable Realtime for attendance_records (Phase 4)
ALTER PUBLICATION supabase_realtime ADD TABLE attendance_records;

-- 6. Storage bucket for student images
INSERT INTO storage.buckets (id, name, public) VALUES ('student-images', 'student-images', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policy for student-images bucket
CREATE POLICY "Users can read own student images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'student-images'
    AND (
      EXISTS (
        SELECT 1 FROM students
        WHERE students.image_url LIKE '%' || storage.objects.name || '%'
        AND EXISTS (
          SELECT 1 FROM classes
          WHERE classes.id = students.class_id
          AND classes.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can upload student images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'student-images'
    AND auth.role() = 'authenticated'
  );
