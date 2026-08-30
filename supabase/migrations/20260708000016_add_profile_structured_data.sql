-- Add structured_data JSONB column to public.profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS structured_data JSONB DEFAULT '{}'::jsonb NOT NULL;

COMMENT ON COLUMN public.profiles.structured_data IS 'Verified structured profile schema containing education, work history, skills, and projects.';
