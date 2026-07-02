-- 1. Create Company Size Enum Type
CREATE TYPE public.company_size AS ENUM ('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+');

-- 2. Create public.companies Table
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  name VARCHAR(150) NOT NULL,
  website TEXT DEFAULT NULL,
  linkedin_url TEXT DEFAULT NULL,
  industry VARCHAR(100) DEFAULT NULL,
  location VARCHAR(150) DEFAULT NULL,
  size public.company_size DEFAULT NULL,
  logo_url TEXT DEFAULT NULL,
  description TEXT DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT companies_user_id_name_key UNIQUE (user_id, name)
);

-- 3. Add Description Comment to companies Table
COMMENT ON TABLE public.companies IS 'User-owned company registry tracking target employers, corporate profiles, and user-specific notes.';

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies
CREATE POLICY "Users can view own companies" 
  ON public.companies 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert own companies" 
  ON public.companies 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own companies" 
  ON public.companies 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id AND deleted_at IS NULL) 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own companies" 
  ON public.companies 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- 6. Create Database Indexes for Performance Optimization
CREATE INDEX IF NOT EXISTS companies_user_id_idx ON public.companies(user_id);
CREATE INDEX IF NOT EXISTS companies_name_idx ON public.companies(name);
CREATE INDEX IF NOT EXISTS companies_industry_idx ON public.companies(industry);
CREATE INDEX IF NOT EXISTS companies_deleted_at_idx ON public.companies(deleted_at) WHERE deleted_at IS NULL;

-- 7. Register updated_at Trigger
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
