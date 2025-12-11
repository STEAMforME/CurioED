-- CurioED v1.0 Complete Schema Migration
-- Run this in Supabase SQL Editor to add remaining tables
-- Your existing tables (curioed_goals, curioed_reflections, curioed_assignments) are preserved

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STUDENT PROFILES (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.curioed_students (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  grade integer CHECK (grade >= 1 AND grade <= 12),
  avatar_url text,
  preferences jsonb DEFAULT '{"notifications": true, "theme": "light"}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- EDUCATOR PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS public.curioed_educators (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  school text,
  bio text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- PROJECTS (Student Portfolio)
-- ============================================
CREATE TABLE IF NOT EXISTS public.curioed_projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  project_type text CHECK (project_type IN ('stem', 'art', 'writing', 'research', 'maker', 'other')) DEFAULT 'other',
  status text CHECK (status IN ('planning', 'in_progress', 'completed', 'presented')) DEFAULT 'planning',
  image_url text,
  attachments jsonb DEFAULT '[]'::jsonb, -- Array of {name, url, type}
  craft_tags text[] DEFAULT '{}', -- ['curiosity', 'reflection', etc]
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone
);

-- ============================================
-- BADGES SYSTEM
-- ============================================
CREATE TABLE IF NOT EXISTS public.curioed_badges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text UNIQUE NOT NULL, -- e.g., 'first_goal', 'week_streak_3'
  name text NOT NULL,
  description text,
  icon_url text,
  category text CHECK (category IN ('goals', 'reflections', 'projects', 'engagement', 'craft')) DEFAULT 'engagement',
  craft_element text CHECK (craft_element IN ('curiosity', 'reflection', 'agency', 'framework', 'transformation')),
  criteria jsonb NOT NULL, -- {type: 'goal_count', threshold: 5}
  points integer DEFAULT 10,
  created_at timestamp with time zone DEFAULT now()
);

-- Student badges (many-to-many)
CREATE TABLE IF NOT EXISTS public.curioed_student_badges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id uuid REFERENCES public.curioed_badges(id) ON DELETE CASCADE NOT NULL,
  earned_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- ============================================
-- ACTIVITY LOG (for analytics)
-- ============================================
CREATE TABLE IF NOT EXISTS public.curioed_activity_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_type text NOT NULL, -- 'login', 'goal_created', 'reflection_submitted', 'project_completed'
  metadata jsonb DEFAULT '{}'::jsonb,
  occurred_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- GOAL UPDATES (Progress Tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS public.curioed_goal_updates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id uuid REFERENCES public.curioed_goals(id) ON DELETE CASCADE NOT NULL,
  progress integer CHECK (progress >= 0 AND progress <= 100) DEFAULT 0,
  note text,
  updated_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- ENHANCE EXISTING TABLES
-- ============================================

-- Add missing columns to curioed_goals
ALTER TABLE public.curioed_goals 
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS category text CHECK (category IN ('academic', 'personal', 'career', 'skill')) DEFAULT 'personal',
  ADD COLUMN IF NOT EXISTS target_date date,
  ADD COLUMN IF NOT EXISTS progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Add missing columns to curioed_reflections
ALTER TABLE public.curioed_reflections
  ADD COLUMN IF NOT EXISTS craft_element text CHECK (craft_element IN ('curiosity', 'reflection', 'agency', 'framework', 'transformation')),
  ADD COLUMN IF NOT EXISTS mood text CHECK (mood IN ('excited', 'confident', 'neutral', 'frustrated', 'confused')),
  ADD COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]'::jsonb;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_curioed_goals_user_id ON public.curioed_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_curioed_goals_completed ON public.curioed_goals(user_id, completed);
CREATE INDEX IF NOT EXISTS idx_curioed_reflections_user_id ON public.curioed_reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_curioed_reflections_week ON public.curioed_reflections(user_id, week_of DESC);
CREATE INDEX IF NOT EXISTS idx_curioed_projects_user_id ON public.curioed_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_curioed_projects_status ON public.curioed_projects(user_id, status);
CREATE INDEX IF NOT EXISTS idx_curioed_activity_user_date ON public.curioed_activity_log(user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_curioed_assignments_educator ON public.curioed_assignments(educator_id);
CREATE INDEX IF NOT EXISTS idx_curioed_assignments_student ON public.curioed_assignments(student_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Student Profiles
ALTER TABLE public.curioed_students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own student profile" ON public.curioed_students
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own student profile" ON public.curioed_students
  FOR UPDATE USING (auth.uid() = user_id);

-- Educator Profiles
ALTER TABLE public.curioed_educators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own educator profile" ON public.curioed_educators
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own educator profile" ON public.curioed_educators
  FOR UPDATE USING (auth.uid() = user_id);

-- Projects
ALTER TABLE public.curioed_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students manage own projects" ON public.curioed_projects
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Educators view assigned students' projects" ON public.curioed_projects
  FOR SELECT USING (
    user_id IN (
      SELECT student_id FROM public.curioed_assignments 
      WHERE educator_id = auth.uid()
    )
  );

-- Student Badges
ALTER TABLE public.curioed_student_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own badges" ON public.curioed_student_badges
  FOR SELECT USING (auth.uid() = user_id);

-- Activity Log
ALTER TABLE public.curioed_activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own activity" ON public.curioed_activity_log
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Educators view assigned students' activity" ON public.curioed_activity_log
  FOR SELECT USING (
    user_id IN (
      SELECT student_id FROM public.curioed_assignments 
      WHERE educator_id = auth.uid()
    )
  );

-- Goal Updates
ALTER TABLE public.curioed_goal_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own goal updates" ON public.curioed_goal_updates
  FOR ALL USING (
    goal_id IN (
      SELECT id FROM public.curioed_goals WHERE user_id = auth.uid()
    )
  );

-- Badges table is public (read-only for all authenticated users)
ALTER TABLE public.curioed_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view badges" ON public.curioed_badges
  FOR SELECT TO authenticated USING (true);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to log activity automatically
CREATE OR REPLACE FUNCTION log_user_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.curioed_activity_log (user_id, activity_type, metadata)
  VALUES (
    NEW.user_id,
    TG_ARGV[0], -- activity_type passed from trigger
    jsonb_build_object('id', NEW.id, 'table', TG_TABLE_NAME)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers to auto-log activities
CREATE TRIGGER log_goal_created
  AFTER INSERT ON public.curioed_goals
  FOR EACH ROW EXECUTE FUNCTION log_user_activity('goal_created');

CREATE TRIGGER log_reflection_submitted
  AFTER INSERT ON public.curioed_reflections
  FOR EACH ROW EXECUTE FUNCTION log_user_activity('reflection_submitted');

CREATE TRIGGER log_project_created
  AFTER INSERT ON public.curioed_projects
  FOR EACH ROW EXECUTE FUNCTION log_user_activity('project_created');

-- Function to auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_curioed_students_updated_at
  BEFORE UPDATE ON public.curioed_students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_curioed_educators_updated_at
  BEFORE UPDATE ON public.curioed_educators
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_curioed_projects_updated_at
  BEFORE UPDATE ON public.curioed_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_curioed_goals_updated_at
  BEFORE UPDATE ON public.curioed_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
