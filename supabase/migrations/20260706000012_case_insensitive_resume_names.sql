-- 1. Safe data migration: Append suffix to any existing active duplicate case-insensitive version names for the same user
WITH duplicates AS (
  SELECT 
    id,
    version_name,
    ROW_NUMBER() OVER(PARTITION BY user_id, lower(version_name) ORDER BY created_at ASC) as rn
  FROM public.resumes
  WHERE deleted_at IS NULL
)
UPDATE public.resumes r
SET version_name = r.version_name || ' (' || (d.rn - 1) || ')'
FROM duplicates d
WHERE r.id = d.id AND d.rn > 1;

-- 2. Drop the old case-sensitive unique constraint
ALTER TABLE public.resumes DROP CONSTRAINT IF EXISTS resumes_user_id_version_name_key;

-- 3. Create the new case-insensitive unique index for active (non-soft-deleted) resumes
CREATE UNIQUE INDEX IF NOT EXISTS resumes_user_id_lower_version_name_idx 
  ON public.resumes (user_id, lower(version_name)) 
  WHERE deleted_at IS NULL;
