-- Ensure the pgvector extension is enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Conditional schema recovery of columns from incorrect migration
DO $$
BEGIN
  -- Rename original_filename to file_name if original_filename exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'resumes' AND column_name = 'original_filename'
  ) THEN
    ALTER TABLE public.resumes RENAME COLUMN original_filename TO file_name;
  END IF;

  -- Rename storage_path to file_path if storage_path exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'resumes' AND column_name = 'storage_path'
  ) THEN
    ALTER TABLE public.resumes RENAME COLUMN storage_path TO file_path;
  END IF;

  -- Restore file_type if missing
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'resumes' AND column_name = 'file_type'
  ) THEN
    ALTER TABLE public.resumes ADD COLUMN file_type VARCHAR(100) NOT NULL DEFAULT 'application/pdf';
  END IF;

  -- Restore file_size if missing
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'resumes' AND column_name = 'file_size'
  ) THEN
    ALTER TABLE public.resumes ADD COLUMN file_size BIGINT NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Align types and constraints to original Module 2.3 specification
UPDATE public.resumes SET parsed_text = '' WHERE parsed_text IS NULL;
ALTER TABLE public.resumes ALTER COLUMN parsed_text SET NOT NULL;

UPDATE public.resumes SET structured_data = '{}'::jsonb WHERE structured_data IS NULL;
ALTER TABLE public.resumes ALTER COLUMN structured_data SET DEFAULT '{}'::jsonb;
ALTER TABLE public.resumes ALTER COLUMN structured_data SET NOT NULL;

UPDATE public.resumes SET is_default = false WHERE is_default IS NULL;
ALTER TABLE public.resumes ALTER COLUMN is_default SET DEFAULT false;
ALTER TABLE public.resumes ALTER COLUMN is_default SET NOT NULL;

-- Add AI embedding vector column if not exists
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS embedding VECTOR(768);

-- Cleanup incorrect policies if they exist
DROP POLICY IF EXISTS resumes_select ON public.resumes;
DROP POLICY IF EXISTS resumes_insert ON public.resumes;
DROP POLICY IF EXISTS resumes_update ON public.resumes;
DROP POLICY IF EXISTS resumes_delete ON public.resumes;

-- Restore original RLS policies
DROP POLICY IF EXISTS "Users can view own resumes" ON public.resumes;
CREATE POLICY "Users can view own resumes" 
  ON public.resumes 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can insert own resumes" ON public.resumes;
CREATE POLICY "Users can insert own resumes" 
  ON public.resumes 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own resumes" ON public.resumes;
CREATE POLICY "Users can update own resumes" 
  ON public.resumes 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id AND deleted_at IS NULL) 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own resumes" ON public.resumes;
CREATE POLICY "Users can delete own resumes" 
  ON public.resumes 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Restore original indexes and add new HNSW index
CREATE INDEX IF NOT EXISTS resumes_user_id_idx ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS resumes_is_default_idx ON public.resumes(is_default);
CREATE INDEX IF NOT EXISTS resumes_deleted_at_idx ON public.resumes(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS resumes_structured_data_gin_idx ON public.resumes USING gin (structured_data);
CREATE UNIQUE INDEX IF NOT EXISTS resumes_user_id_default_idx ON public.resumes (user_id) WHERE is_default = true AND deleted_at IS NULL;

-- Create HNSW vector index
CREATE INDEX IF NOT EXISTS resumes_embedding_hnsw_idx ON public.resumes USING hnsw (embedding vector_cosine_ops);

-- Restore trigger
DROP TRIGGER IF EXISTS update_resumes_updated_at ON public.resumes;
CREATE TRIGGER update_resumes_updated_at
  BEFORE UPDATE ON public.resumes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
