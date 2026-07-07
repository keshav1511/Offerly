-- Add parsing metadata columns to resumes table if they do not exist
ALTER TABLE public.resumes 
  ADD COLUMN IF NOT EXISTS parsed_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS parser_version TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS parsing_status TEXT NOT NULL DEFAULT 'Pending',
  ADD COLUMN IF NOT EXISTS parsing_error TEXT DEFAULT NULL;

-- Enforce valid parsing status values via a check constraint
ALTER TABLE public.resumes
  DROP CONSTRAINT IF EXISTS check_resumes_parsing_status;

ALTER TABLE public.resumes
  ADD CONSTRAINT check_resumes_parsing_status 
  CHECK (parsing_status IN ('Pending', 'Processing', 'Completed', 'Failed'));
