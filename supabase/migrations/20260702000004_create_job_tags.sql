-- 1. Create public.job_tags Table
CREATE TABLE IF NOT EXISTS public.job_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Add Description Comment to job_tags Table
COMMENT ON TABLE public.job_tags IS 'Global registry of normalized job tags (skills, categories, keywords).';

-- 3. Create public.job_tag_map Table (Junction Bridge)
CREATE TABLE IF NOT EXISTS public.job_tag_map (
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE ON UPDATE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.job_tags(id) ON DELETE CASCADE ON UPDATE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (job_id, tag_id)
);

-- 4. Add Description Comment to job_tag_map Table
COMMENT ON TABLE public.job_tag_map IS 'Junction table mapping job postings to their respective skills and categories.';

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.job_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_tag_map ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies for job_tags
CREATE POLICY "Authenticated users can view job_tags" 
  ON public.job_tags 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can insert job_tags" 
  ON public.job_tags 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- 7. Create RLS Policies for job_tag_map (Enforces Job Ownership)
CREATE POLICY "Users can view tag map for own jobs" 
  ON public.job_tag_map 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j 
      WHERE j.id = job_id 
      AND j.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert tag map for own jobs" 
  ON public.job_tag_map 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs j 
      WHERE j.id = job_id 
      AND j.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tag map for own jobs" 
  ON public.job_tag_map 
  FOR DELETE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j 
      WHERE j.id = job_id 
      AND j.user_id = auth.uid()
    )
  );

-- 8. Create Performance Optimization Indexes
CREATE INDEX IF NOT EXISTS job_tags_name_idx ON public.job_tags(name);
CREATE INDEX IF NOT EXISTS job_tag_map_job_id_idx ON public.job_tag_map(job_id);
CREATE INDEX IF NOT EXISTS job_tag_map_tag_id_idx ON public.job_tag_map(tag_id);
