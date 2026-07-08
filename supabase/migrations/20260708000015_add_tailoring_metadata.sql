-- Add job_snapshot and tailoring_metadata columns to the resumes table
ALTER TABLE public.resumes 
ADD COLUMN IF NOT EXISTS job_snapshot JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS tailoring_metadata JSONB DEFAULT NULL;

COMMENT ON COLUMN public.resumes.job_snapshot IS 'Company, title, location, and URL snapshot details linked to customized resume versions.';
COMMENT ON COLUMN public.resumes.tailoring_metadata IS 'AI explanation parameters containing modified sections, added keywords, and confidence levels.';
