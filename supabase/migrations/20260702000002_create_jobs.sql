-- 1. Create PostgreSQL Custom Enum Types
CREATE TYPE public.work_mode AS ENUM ('remote', 'hybrid', 'onsite');
CREATE TYPE public.employment_type AS ENUM ('internship', 'full_time', 'part_time', 'contract');

-- 2. Create public.jobs Table
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE ON UPDATE CASCADE,
  title VARCHAR(150) NOT NULL,
  description TEXT DEFAULT NULL,
  location VARCHAR(150) DEFAULT NULL,
  salary_min NUMERIC(12, 2) DEFAULT 0.00 CONSTRAINT check_jobs_salary_min CHECK (salary_min >= 0),
  salary_max NUMERIC(12, 2) DEFAULT 0.00 CONSTRAINT check_jobs_salary_max CHECK (salary_max >= salary_min),
  priority public.priority NOT NULL DEFAULT 'medium',
  status public.application_status NOT NULL DEFAULT 'wishlist',
  work_mode public.work_mode DEFAULT NULL,
  employment_type public.employment_type DEFAULT NULL,
  job_url TEXT DEFAULT NULL,
  applied_at TIMESTAMPTZ DEFAULT NULL,
  deadline TIMESTAMPTZ DEFAULT NULL,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Add Description Comment to jobs Table
COMMENT ON TABLE public.jobs IS 'User-owned job directory tracking targeted positions, matching parameters, and application progress.';

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies
CREATE POLICY "Users can view own jobs" 
  ON public.jobs 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert own jobs" 
  ON public.jobs 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs" 
  ON public.jobs 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id AND deleted_at IS NULL) 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own jobs" 
  ON public.jobs 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- 6. Create Database Indexes for Performance Optimization
CREATE INDEX IF NOT EXISTS jobs_user_id_idx ON public.jobs(user_id);
CREATE INDEX IF NOT EXISTS jobs_company_id_idx ON public.jobs(company_id);
CREATE INDEX IF NOT EXISTS jobs_status_idx ON public.jobs(status);
CREATE INDEX IF NOT EXISTS jobs_priority_idx ON public.jobs(priority);
CREATE INDEX IF NOT EXISTS jobs_deleted_at_idx ON public.jobs(deleted_at) WHERE deleted_at IS NULL;

-- 7. Create Composite Indexes for Performance Optimization
CREATE INDEX IF NOT EXISTS jobs_user_id_status_idx ON public.jobs(user_id, status);
CREATE INDEX IF NOT EXISTS jobs_user_id_created_at_idx ON public.jobs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS jobs_company_id_user_id_idx ON public.jobs(company_id, user_id);

-- 8. Register updated_at Trigger
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
