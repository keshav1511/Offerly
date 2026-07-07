-- 1. Create resumes storage bucket if it does not exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes', 
  'resumes', 
  false, 
  5242880, -- 5MB limit
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies to prevent duplicate errors
DROP POLICY IF EXISTS "Allow owners to upload to their folder" ON storage.objects;
DROP POLICY IF EXISTS "Allow owners to read their folder" ON storage.objects;
DROP POLICY IF EXISTS "Allow owners to delete their folder" ON storage.objects;

-- 3. Create Storage RLS Policies scoped to authenticated user folders (resumes/{userId}/*)
CREATE POLICY "Allow owners to upload to their folder" ON storage.objects
  FOR INSERT TO authenticated 
  WITH CHECK (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Allow owners to read their folder" ON storage.objects
  FOR SELECT TO authenticated 
  USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Allow owners to delete their folder" ON storage.objects
  FOR DELETE TO authenticated 
  USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);
