-- 1. Alter public.jobs table to append new job management tracking fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'jobs' AND column_name = 'department'
  ) THEN
    ALTER TABLE public.jobs ADD COLUMN department VARCHAR(100);
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'jobs' AND column_name = 'currency'
  ) THEN
    ALTER TABLE public.jobs ADD COLUMN currency VARCHAR(10) DEFAULT 'USD';
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'jobs' AND column_name = 'requirements'
  ) THEN
    ALTER TABLE public.jobs ADD COLUMN requirements TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'jobs' AND column_name = 'responsibilities'
  ) THEN
    ALTER TABLE public.jobs ADD COLUMN responsibilities TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'jobs' AND column_name = 'benefits'
  ) THEN
    ALTER TABLE public.jobs ADD COLUMN benefits TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'jobs' AND column_name = 'application_url'
  ) THEN
    ALTER TABLE public.jobs ADD COLUMN application_url TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'jobs' AND column_name = 'source'
  ) THEN
    ALTER TABLE public.jobs ADD COLUMN source VARCHAR(100);
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'jobs' AND column_name = 'external_job_id'
  ) THEN
    ALTER TABLE public.jobs ADD COLUMN external_job_id VARCHAR(100);
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'jobs' AND column_name = 'posted_at'
  ) THEN
    ALTER TABLE public.jobs ADD COLUMN posted_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'jobs' AND column_name = 'expires_at'
  ) THEN
    ALTER TABLE public.jobs ADD COLUMN expires_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'jobs' AND column_name = 'embedding'
  ) THEN
    ALTER TABLE public.jobs ADD COLUMN embedding VECTOR(1536);
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'jobs' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE public.jobs ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- 2. Add unique constraint conditionally
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE table_schema = 'public' 
      AND table_name = 'jobs' 
      AND constraint_name = 'jobs_user_id_source_external_job_id_key'
  ) THEN
    ALTER TABLE public.jobs ADD CONSTRAINT jobs_user_id_source_external_job_id_key UNIQUE (user_id, source, external_job_id);
  END IF;
END $$;

-- 3. Create Performance Optimization Indexes on public.jobs
CREATE INDEX IF NOT EXISTS jobs_metadata_gin_idx ON public.jobs USING gin (metadata);
CREATE INDEX IF NOT EXISTS jobs_embedding_hnsw_idx ON public.jobs USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS jobs_work_mode_idx ON public.jobs (work_mode);
CREATE INDEX IF NOT EXISTS jobs_employment_type_idx ON public.jobs (employment_type);
CREATE INDEX IF NOT EXISTS jobs_location_idx ON public.jobs (location);
CREATE INDEX IF NOT EXISTS jobs_title_idx ON public.jobs (title);

-- 4. Create public.saved_jobs Table
CREATE TABLE IF NOT EXISTS public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT saved_jobs_user_id_job_id_key UNIQUE (user_id, job_id)
);

-- 5. Create public.job_skills Table
CREATE TABLE IF NOT EXISTS public.job_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL UNIQUE,
  category VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Create public.job_skill_map Junction Table
CREATE TABLE IF NOT EXISTS public.job_skill_map (
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.job_skills(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (job_id, skill_id)
);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_skill_map ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS Policies for saved_jobs (with Soft-delete filter compatibility)
DROP POLICY IF EXISTS "Users can view own saved_jobs" ON public.saved_jobs;
CREATE POLICY "Users can view own saved_jobs" ON public.saved_jobs
  FOR SELECT 
  TO authenticated 
  USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_id AND j.deleted_at IS NULL
    )
  );

DROP POLICY IF EXISTS "Users can insert own saved_jobs" ON public.saved_jobs;
CREATE POLICY "Users can insert own saved_jobs" ON public.saved_jobs
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own saved_jobs" ON public.saved_jobs;
CREATE POLICY "Users can delete own saved_jobs" ON public.saved_jobs
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- 9. Create RLS Policies for job_skills
DROP POLICY IF EXISTS "Authenticated users can view job_skills" ON public.job_skills;
CREATE POLICY "Authenticated users can view job_skills" ON public.job_skills
  FOR SELECT 
  TO authenticated 
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert job_skills" ON public.job_skills;
CREATE POLICY "Authenticated users can insert job_skills" ON public.job_skills
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- 10. Create RLS Policies for job_skill_map
DROP POLICY IF EXISTS "Users can view skill map for own jobs" ON public.job_skill_map;
CREATE POLICY "Users can view skill map for own jobs" ON public.job_skill_map
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_id AND j.user_id = auth.uid() AND j.deleted_at IS NULL
    )
  );

DROP POLICY IF EXISTS "Users can insert skill map for own jobs" ON public.job_skill_map;
CREATE POLICY "Users can insert skill map for own jobs" ON public.job_skill_map
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_id AND j.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete skill map for own jobs" ON public.job_skill_map;
CREATE POLICY "Users can delete skill map for own jobs" ON public.job_skill_map
  FOR DELETE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_id AND j.user_id = auth.uid()
    )
  );

-- 11. Create Performance Optimization Indexes on the new tables
CREATE INDEX IF NOT EXISTS saved_jobs_user_id_idx ON public.saved_jobs (user_id);
CREATE INDEX IF NOT EXISTS saved_jobs_job_id_idx ON public.saved_jobs (job_id);

CREATE INDEX IF NOT EXISTS job_skills_name_idx ON public.job_skills (name);

CREATE INDEX IF NOT EXISTS job_skill_map_job_id_idx ON public.job_skill_map (job_id);
CREATE INDEX IF NOT EXISTS job_skill_map_skill_id_idx ON public.job_skill_map (skill_id);

-- 12. Create updated_at trigger for public.job_skills
DROP TRIGGER IF EXISTS update_job_skills_updated_at ON public.job_skills;
CREATE TRIGGER update_job_skills_updated_at
  BEFORE UPDATE ON public.job_skills
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
