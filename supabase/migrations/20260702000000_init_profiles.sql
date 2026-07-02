-- 1. Enable Database Extensions
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "public";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "public";

-- 2. Create PostgreSQL Custom Enum Types
CREATE TYPE public.experience_level AS ENUM ('entry', 'mid', 'senior', 'lead');
CREATE TYPE public.application_status AS ENUM ('wishlist', 'applied', 'oa', 'interview', 'hr', 'offer', 'accepted', 'rejected', 'withdrawn');
CREATE TYPE public.priority AS ENUM ('low', 'medium', 'high', 'critical');

-- 3. Create Common Audit Functions
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create public.profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  full_name VARCHAR(150) DEFAULT NULL,
  avatar_url VARCHAR(512) DEFAULT NULL,
  preferred_location VARCHAR(100) DEFAULT NULL,
  linkedin_url VARCHAR(512) DEFAULT NULL,
  github_url VARCHAR(512) DEFAULT NULL,
  target_role VARCHAR(100) DEFAULT NULL,
  experience_level public.experience_level DEFAULT NULL,
  target_salary_min NUMERIC(12, 2) DEFAULT 0.00 CONSTRAINT check_target_salary_min CHECK (target_salary_min >= 0),
  target_salary_max NUMERIC(12, 2) DEFAULT 0.00 CONSTRAINT check_target_salary_max CHECK (target_salary_max >= target_salary_min),
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Add Description Comment to profiles Table
COMMENT ON TABLE public.profiles IS 'Extends default Supabase Auth details with application-specific preferences, career goals, and social links.';

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS Policies
CREATE POLICY "Users can view own profile" 
  ON public.profiles 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id AND deleted_at IS NULL);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id AND deleted_at IS NULL) 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile" 
  ON public.profiles 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = id);

-- 8. Create Database Indexes for Performance Optimization
CREATE INDEX IF NOT EXISTS profiles_target_role_idx ON public.profiles(target_role);
CREATE INDEX IF NOT EXISTS profiles_experience_level_idx ON public.profiles(experience_level);
CREATE INDEX IF NOT EXISTS profiles_deleted_at_idx ON public.profiles(deleted_at) WHERE deleted_at IS NULL;

-- 9. Register updated_at Trigger
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 10. Automatic Profile Creation on auth.users Sign Up Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
