-- Migration: Create avatars storage bucket and configure security policies.
-- Public read access is permitted for avatars, while write operations are strictly restricted to the authenticated owner's directory.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 
  'avatars', 
  true, 
  2097152, -- 2MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow anyone to read avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow owners to upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow owners to update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow owners to delete avatars" ON storage.objects;

CREATE POLICY "Allow anyone to read avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Allow owners to upload avatars" ON storage.objects
  FOR INSERT TO authenticated 
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Allow owners to update avatars" ON storage.objects
  FOR UPDATE TO authenticated 
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Allow owners to delete avatars" ON storage.objects
  FOR DELETE TO authenticated 
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
