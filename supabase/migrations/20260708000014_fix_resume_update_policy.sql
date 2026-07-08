-- Drop the existing update policy and recreate it to ensure WITH CHECK does not restrict deleted_at
DROP POLICY IF EXISTS "Users can update own resumes" ON public.resumes;
CREATE POLICY "Users can update own resumes" 
  ON public.resumes 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id AND deleted_at IS NULL) 
  WITH CHECK (auth.uid() = user_id);
