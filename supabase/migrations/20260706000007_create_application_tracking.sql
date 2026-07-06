-- 1. Create public.applications Table
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  cover_letter_id UUID DEFAULT NULL,
  status public.application_status NOT NULL DEFAULT 'wishlist',
  priority public.priority NOT NULL DEFAULT 'medium',
  applied_at TIMESTAMPTZ,
  interview_date TIMESTAMPTZ,
  offer_date TIMESTAMPTZ,
  rejection_date TIMESTAMPTZ,
  salary_offered NUMERIC(12, 2) DEFAULT 0.00 CONSTRAINT check_applications_salary_offered CHECK (salary_offered >= 0),
  notes JSONB DEFAULT '{}'::jsonb,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Add Description Comment to applications Table
COMMENT ON TABLE public.applications IS 'Tracks active and historical job applications and status metrics.';

-- 3. Create public.application_events Table (Append-only Event Log)
CREATE TABLE IF NOT EXISTS public.application_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  event_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Add Description Comment to application_events Table
COMMENT ON TABLE public.application_events IS 'Audit logs capturing life-cycle transitions and user interactions for job applications.';

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_events ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies for applications
DROP POLICY IF EXISTS "Users can view own applications" ON public.applications;
CREATE POLICY "Users can view own applications" ON public.applications
  FOR SELECT TO authenticated USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can insert own applications" ON public.applications;
CREATE POLICY "Users can insert own applications" ON public.applications
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own applications" ON public.applications;
CREATE POLICY "Users can update own applications" ON public.applications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id AND deleted_at IS NULL) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own applications" ON public.applications;
CREATE POLICY "Users can delete own applications" ON public.applications
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 7. Create RLS Policies for application_events (Scoped to Application Owner)
DROP POLICY IF EXISTS "Users can view own application_events" ON public.application_events;
CREATE POLICY "Users can view own application_events" ON public.application_events
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.applications a
      WHERE a.id = application_id AND a.user_id = auth.uid() AND a.deleted_at IS NULL
    )
  );

DROP POLICY IF EXISTS "Users can insert own application_events" ON public.application_events;
CREATE POLICY "Users can insert own application_events" ON public.application_events
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.applications a
      WHERE a.id = application_id AND a.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own application_events" ON public.application_events;
CREATE POLICY "Users can delete own application_events" ON public.application_events
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.applications a
      WHERE a.id = application_id AND a.user_id = auth.uid()
    )
  );

-- 8. Create Performance Optimization Indexes on public.applications
CREATE INDEX IF NOT EXISTS applications_user_id_status_idx ON public.applications (user_id, status);
CREATE INDEX IF NOT EXISTS applications_user_id_priority_idx ON public.applications (user_id, priority);
CREATE INDEX IF NOT EXISTS applications_user_id_created_at_idx ON public.applications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS applications_notes_gin_idx ON public.applications USING GIN (notes);

-- Ensure partial unique constraint: only one active (non soft-deleted) application per user per job
CREATE UNIQUE INDEX IF NOT EXISTS applications_user_job_active_unique_idx ON public.applications (user_id, job_id) WHERE deleted_at IS NULL;

-- 9. Create Performance Optimization Indexes on public.application_events
CREATE INDEX IF NOT EXISTS application_events_application_id_idx ON public.application_events (application_id);
CREATE INDEX IF NOT EXISTS application_events_event_time_idx ON public.application_events (event_time DESC);
CREATE INDEX IF NOT EXISTS application_events_payload_gin_idx ON public.application_events USING GIN (payload);

-- 10. Register updated_at Trigger for public.applications
DROP TRIGGER IF EXISTS update_applications_updated_at ON public.applications;
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 11. Create Automatic Status Logging Trigger and Function
CREATE OR REPLACE FUNCTION public.handle_application_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') OR (NEW.status IS DISTINCT FROM OLD.status) THEN
    INSERT INTO public.application_events (
      application_id,
      event_type,
      event_time,
      payload
    ) VALUES (
      NEW.id,
      CASE WHEN TG_OP = 'INSERT' THEN 'application_created' ELSE 'status_changed' END,
      now(),
      jsonb_build_object(
        'from_status', CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE OLD.status END,
        'to_status', NEW.status,
        'user_id', NEW.user_id
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS log_application_status_change ON public.applications;
CREATE TRIGGER log_application_status_change
  AFTER INSERT OR UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_application_status_change();
