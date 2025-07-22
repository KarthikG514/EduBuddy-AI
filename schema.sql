-- Enable RLS for all tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated, service_role;

-- Custom Types
DROP TYPE IF EXISTS public.event_type CASCADE;
CREATE TYPE public.event_type AS ENUM ('exam', 'holiday', 'meeting');

DROP TYPE IF EXISTS public.attendance_status CASCADE;
CREATE TYPE public.attendance_status AS ENUM ('Present', 'Absent', 'Late');

DROP TYPE IF EXISTS public.doc_type CASCADE;
CREATE TYPE public.doc_type AS ENUM ('Bonafide', 'Report', 'Certificate', 'Other');

-- mcq_questions table
CREATE TABLE IF NOT EXISTS public.mcq_questions (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    topic text,
    question_text text,
    option_a text,
    option_b text,
    option_c text,
    option_d text,
    correct_option character(1)
);
ALTER TABLE public.mcq_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.mcq_questions;
CREATE POLICY "Allow authenticated read access" ON public.mcq_questions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow authenticated insert access" ON public.mcq_questions;
CREATE POLICY "Allow authenticated insert access" ON public.mcq_questions FOR INSERT TO authenticated WITH CHECK (true);

-- performance_reports table
CREATE TABLE IF NOT EXISTS public.performance_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    student_name text NOT NULL,
    subject text,
    score integer,
    total integer,
    feedback jsonb,
    improvement_plan jsonb,
    teacher_id uuid
);
ALTER TABLE public.performance_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.performance_reports;
CREATE POLICY "Allow authenticated read access" ON public.performance_reports FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow authenticated insert access" ON public.performance_reports;
CREATE POLICY "Allow authenticated insert access" ON public.performance_reports FOR INSERT TO authenticated WITH CHECK (true);

-- teaching_plans table
CREATE TABLE IF NOT EXISTS public.teaching_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    teacher_id uuid,
    subject text,
    uploaded_content text,
    covered_topics jsonb,
    next_topic text,
    revision_topics jsonb,
    missed_concepts jsonb
);
ALTER TABLE public.teaching_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.teaching_plans;
CREATE POLICY "Allow authenticated read access" ON public.teaching_plans FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow authenticated insert access" ON public.teaching_plans;
CREATE POLICY "Allow authenticated insert access" ON public.teaching_plans FOR INSERT TO authenticated WITH CHECK (true);

-- question_papers_v2 table
CREATE TABLE IF NOT EXISTS public.question_papers_v2 (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    teacher_id uuid,
    subject text,
    unit text,
    one_mark jsonb,
    two_mark jsonb,
    ten_mark jsonb
);
ALTER TABLE public.question_papers_v2 ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.question_papers_v2;
CREATE POLICY "Allow authenticated read access" ON public.question_papers_v2 FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow authenticated insert access" ON public.question_papers_v2;
CREATE POLICY "Allow authenticated insert access" ON public.question_papers_v2 FOR INSERT TO authenticated WITH CHECK (true);

-- student_attendance table
CREATE TABLE IF NOT EXISTS public.student_attendance (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    student_name text NOT NULL,
    roll_no text NOT NULL,
    date date NOT NULL,
    subject text NOT NULL,
    period text NOT NULL,
    status public.attendance_status NOT NULL,
    remark text,
    behavior_tags text
);
ALTER TABLE public.student_attendance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to manage attendance" ON public.student_attendance;
CREATE POLICY "Allow authenticated users to manage attendance" ON public.student_attendance FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- internal_marks table
CREATE TABLE IF NOT EXISTS public.internal_marks (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    student_name text NOT NULL,
    roll_no text NOT NULL,
    subject text NOT NULL,
    test1 integer,
    test2 integer,
    assignment integer,
    attendance integer,
    internal_score integer,
    grade text,
    feedback text
);
ALTER TABLE public.internal_marks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to manage marks" ON public.internal_marks;
CREATE POLICY "Allow authenticated users to manage marks" ON public.internal_marks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- syllabus_tracker table
CREATE TABLE IF NOT EXISTS public.syllabus_tracker (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    subject text NOT NULL,
    topic text NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    uploaded_by text
);
ALTER TABLE public.syllabus_tracker ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to manage syllabus" ON public.syllabus_tracker;
CREATE POLICY "Allow authenticated users to manage syllabus" ON public.syllabus_tracker FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- teacher_remarks table
CREATE TABLE IF NOT EXISTS public.teacher_remarks (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    student_name text,
    roll_no text,
    subject text,
    remark text
);
ALTER TABLE public.teacher_remarks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated access" ON public.teacher_remarks;
CREATE POLICY "Allow authenticated access" ON public.teacher_remarks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- academic_calendar table
CREATE TABLE IF NOT EXISTS public.academic_calendar (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    title text,
    description text,
    event_date date NOT NULL,
    event_type public.event_type,
    posted_by text
);
ALTER TABLE public.academic_calendar ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated access" ON public.academic_calendar;
CREATE POLICY "Allow authenticated access" ON public.academic_calendar FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- assignment_scores table
CREATE TABLE IF NOT EXISTS public.assignment_scores (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    student_name text NOT NULL,
    subject text NOT NULL,
    score numeric NOT NULL,
    feedback text
);
ALTER TABLE public.assignment_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated access" ON public.assignment_scores;
CREATE POLICY "Allow authenticated access" ON public.assignment_scores FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- project_tracker table
CREATE TABLE IF NOT EXISTS public.project_tracker (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    student_name text NOT NULL,
    roll_no text NOT NULL UNIQUE,
    project_title text NOT NULL,
    mentor_name text NOT NULL,
    topic_selected boolean DEFAULT false NOT NULL,
    review1_score integer,
    review1_feedback text,
    review2_score integer,
    review2_feedback text,
    final_submission boolean DEFAULT false NOT NULL,
    final_score integer,
    final_feedback text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.project_tracker ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated access" ON public.project_tracker;
CREATE POLICY "Allow authenticated access" ON public.project_tracker FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- student_documents table and storage bucket
CREATE TABLE IF NOT EXISTS public.student_documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    uploaded_at timestamp with time zone DEFAULT now() NOT NULL,
    student_name text NOT NULL,
    roll_no text NOT NULL,
    doc_type public.doc_type NOT NULL,
    file_url text NOT NULL,
    file_path text,
    uploaded_by text,
    verified boolean DEFAULT false NOT NULL
);
ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access" ON public.student_documents;
CREATE POLICY "Allow public read access" ON public.student_documents FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.student_documents;
CREATE POLICY "Allow authenticated insert" ON public.student_documents FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Allow authenticated update" ON public.student_documents;
CREATE POLICY "Allow authenticated update" ON public.student_documents FOR UPDATE TO authenticated USING (true);

INSERT INTO storage.buckets (id, name, public) VALUES ('student-documents', 'student-documents', true) ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
CREATE POLICY "Allow public uploads" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'student-documents');
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
CREATE POLICY "Allow public reads" ON storage.objects FOR SELECT TO public USING (bucket_id = 'student-documents');


-- custom_quizzes table
CREATE TABLE IF NOT EXISTS public.custom_quizzes (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    topic text NOT NULL,
    questions jsonb NOT NULL,
    created_by text
);
ALTER TABLE public.custom_quizzes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access" ON public.custom_quizzes;
CREATE POLICY "Allow public read access" ON public.custom_quizzes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.custom_quizzes;
CREATE POLICY "Allow authenticated insert" ON public.custom_quizzes FOR INSERT TO authenticated WITH CHECK (true);

-- gamification_leaderboard table
CREATE TABLE IF NOT EXISTS public.gamification_leaderboard (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    player_name text NOT NULL,
    topic text NOT NULL,
    score integer NOT NULL
);
ALTER TABLE public.gamification_leaderboard ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access" ON public.gamification_leaderboard;
CREATE POLICY "Allow public read access" ON public.gamification_leaderboard FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.gamification_leaderboard;
CREATE POLICY "Allow authenticated insert" ON public.gamification_leaderboard FOR INSERT TO authenticated WITH CHECK (true);

-- profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  department TEXT,
  college_name TEXT
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow users to read their own profile" ON public.profiles;
CREATE POLICY "Allow users to read their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
CREATE POLICY "Allow users to update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Function to create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, department, college_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'department',
    NEW.raw_user_meta_data->>'college_name'
  );
  RETURN NEW;
END;
$$;

-- Trigger to call the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant usage on schema to roles
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
