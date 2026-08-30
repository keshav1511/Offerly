-- Migration: Recreate SELECT policies for resumes and jobs to allow soft-deleted rows to be returned by RETURNING clause without violating RLS policies.
-- Security is fully preserved as access remains strictly constrained to authenticated user ownership.

DROP POLICY IF EXISTS "Users can view own resumes" ON public.resumes;
CREATE POLICY "Users can view own resumes" 
  ON public.resumes 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own jobs" ON public.jobs;
CREATE POLICY "Users can view own jobs" 
  ON public.jobs 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);
