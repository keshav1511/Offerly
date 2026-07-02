-- 1. Create public.resumes Table
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  version_name VARCHAR(100) NOT NULL DEFAULT 'Original',
  parsed_text TEXT NOT NULL,
  structured_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  file_path TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size BIGINT NOT NULL,
  ats_score INT DEFAULT NULL CONSTRAINT check_resumes_ats_score CHECK (ats_score >= 0 AND ats_score <= 100),
  is_default BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT resumes_user_id_version_name_key UNIQUE (user_id, version_name)
);

-- 2. Add Description Comment to resumes Table
COMMENT ON TABLE public.resumes IS 'User-owned resume CV registry tracking parsed textual inputs, metadata, and file pointers.';

-- 3. Create public.notes Table
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE ON UPDATE CASCADE,
  content TEXT NOT NULL,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Add Description Comment to notes Table
COMMENT ON TABLE public.notes IS 'User-owned notebook records appended to targeted job positions.';

-- 5. Create public.application_history Table
CREATE TABLE IF NOT EXISTS public.application_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE ON UPDATE CASCADE,
  changed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  from_status public.application_status NOT NULL,
  to_status public.application_status NOT NULL,
  note TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT check_status_change CHECK (from_status <> to_status)
);

-- 6. Add Description Comment to application_history Table
COMMENT ON TABLE public.application_history IS 'Automated append-only audit logs tracking timeline status changes across a user''s job application pipeline.';

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_history ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS Policies for resumes
CREATE POLICY "Users can view own resumes" 
  ON public.resumes 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert own resumes" 
  ON public.resumes 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes" 
  ON public.resumes 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id AND deleted_at IS NULL) 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own resumes" 
  ON public.resumes 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- 9. Create RLS Policies for notes
CREATE POLICY "Users can view own notes" 
  ON public.notes 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert own notes" 
  ON public.notes 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes" 
  ON public.notes 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id AND deleted_at IS NULL) 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes" 
  ON public.notes 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- 10. Create RLS Policies for application_history
CREATE POLICY "Users can view own application_history" 
  ON public.application_history 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own application_history" 
  ON public.application_history 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- 11. Create Performance Optimization Indexes for Resumes
CREATE INDEX IF NOT EXISTS resumes_user_id_idx ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS resumes_is_default_idx ON public.resumes(is_default);
CREATE INDEX IF NOT EXISTS resumes_deleted_at_idx ON public.resumes(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS resumes_structured_data_gin_idx ON public.resumes USING gin (structured_data);

-- 12. Create Performance Optimization Indexes for Notes
CREATE INDEX IF NOT EXISTS notes_user_id_idx ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS notes_job_id_idx ON public.notes(job_id);
CREATE INDEX IF NOT EXISTS notes_created_at_idx ON public.notes(created_at DESC);
CREATE INDEX IF NOT EXISTS notes_deleted_at_idx ON public.notes(deleted_at) WHERE deleted_at IS NULL;

-- 13. Create Performance Optimization Indexes for Application History
CREATE INDEX IF NOT EXISTS application_history_user_id_idx ON public.application_history(user_id);
CREATE INDEX IF NOT EXISTS application_history_job_id_idx ON public.application_history(job_id);
CREATE INDEX IF NOT EXISTS application_history_created_at_idx ON public.application_history(created_at DESC);

-- 14. Enforce One Default Resume Per User via Unique Partial Index
CREATE UNIQUE INDEX IF NOT EXISTS resumes_user_id_default_idx ON public.resumes (user_id) WHERE is_default = true AND deleted_at IS NULL;

-- 15. Register updated_at Triggers
CREATE TRIGGER update_resumes_updated_at
  BEFORE UPDATE ON public.resumes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
