-- 1. Create SQL Function: application_count_by_status
CREATE OR REPLACE FUNCTION public.application_count_by_status(user_uuid UUID)
RETURNS TABLE (status public.application_status, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT a.status, COUNT(*)
  FROM public.applications a
  WHERE a.user_id = user_uuid AND a.deleted_at IS NULL
  GROUP BY a.status;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION public.application_count_by_status(UUID) IS 'Returns the count of applications grouped by status for a specific user ID.';

-- 2. Create SQL Function: wishlist_count
CREATE OR REPLACE FUNCTION public.wishlist_count(user_uuid UUID)
RETURNS BIGINT AS $$
DECLARE
  cnt BIGINT;
BEGIN
  SELECT COUNT(*) INTO cnt
  FROM public.applications a
  WHERE a.user_id = user_uuid 
    AND a.status = 'wishlist'::public.application_status 
    AND a.deleted_at IS NULL;
  RETURN cnt;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION public.wishlist_count(UUID) IS 'Returns the total count of wishlist applications for a specific user ID.';

-- 3. Create SQL Function: active_interviews
CREATE OR REPLACE FUNCTION public.active_interviews(user_uuid UUID)
RETURNS BIGINT AS $$
DECLARE
  cnt BIGINT;
BEGIN
  SELECT COUNT(*) INTO cnt
  FROM public.applications a
  WHERE a.user_id = user_uuid 
    AND a.status = 'interview'::public.application_status 
    AND a.deleted_at IS NULL;
  RETURN cnt;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION public.active_interviews(UUID) IS 'Returns the total count of active interview applications for a specific user ID.';

-- 4. Create SQL Function: offers_received
CREATE OR REPLACE FUNCTION public.offers_received(user_uuid UUID)
RETURNS BIGINT AS $$
DECLARE
  cnt BIGINT;
BEGIN
  SELECT COUNT(*) INTO cnt
  FROM public.applications a
  WHERE a.user_id = user_uuid 
    AND a.status = 'offer'::public.application_status 
    AND a.deleted_at IS NULL;
  RETURN cnt;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION public.offers_received(UUID) IS 'Returns the total count of job offers received for a specific user ID.';

-- 5. Create SQL Function: average_ats_score
CREATE OR REPLACE FUNCTION public.average_ats_score(user_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
  avg_score NUMERIC;
BEGIN
  SELECT ROUND(AVG(ats_score), 2) INTO avg_score
  FROM public.resumes r
  WHERE r.user_id = user_uuid 
    AND r.deleted_at IS NULL 
    AND r.ats_score IS NOT NULL;
  RETURN COALESCE(avg_score, 0.00);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION public.average_ats_score(UUID) IS 'Calculates the average ATS score across all active resumes for a specific user ID.';

-- 6. Create SQL Function: latest_application
CREATE OR REPLACE FUNCTION public.latest_application(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  job_title VARCHAR(150),
  company_name VARCHAR(100),
  status public.application_status,
  applied_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    j.title AS job_title,
    c.name AS company_name,
    a.status,
    a.applied_at
  FROM public.applications a
  JOIN public.jobs j ON a.job_id = j.id
  JOIN public.companies c ON j.company_id = c.id
  WHERE a.user_id = user_uuid 
    AND a.deleted_at IS NULL 
    AND j.deleted_at IS NULL
  ORDER BY a.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION public.latest_application(UUID) IS 'Returns the latest application created by a specific user, including job title and company name.';

-- 7. Create View: application_dashboard
CREATE OR REPLACE VIEW public.application_dashboard AS
SELECT
  p.id AS user_id,
  COUNT(a.id) AS total_applications,
  COUNT(CASE WHEN a.status = 'wishlist' THEN 1 END) AS wishlist,
  COUNT(CASE WHEN a.status = 'interview' THEN 1 END) AS interviews,
  COUNT(CASE WHEN a.status = 'offer' THEN 1 END) AS offers,
  COUNT(CASE WHEN a.status = 'accepted' THEN 1 END) AS accepted,
  COUNT(CASE WHEN a.status = 'rejected' THEN 1 END) AS rejected,
  COALESCE(
    (SELECT ROUND(AVG(r.ats_score), 2)
     FROM public.resumes r
     WHERE r.user_id = p.id AND r.deleted_at IS NULL AND r.ats_score IS NOT NULL),
    0.00
  ) AS average_ats_score
FROM public.profiles p
LEFT JOIN public.applications a ON p.id = a.user_id AND a.deleted_at IS NULL
WHERE p.id = auth.uid()
GROUP BY p.id;

COMMENT ON VIEW public.application_dashboard IS 'Dashboard analytics aggregates (counts, averages) for the authenticated user session.';

-- 8. Create View: job_overview
CREATE OR REPLACE VIEW public.job_overview AS
SELECT
  j.id AS job_id,
  j.user_id,
  c.name AS company,
  j.title,
  j.work_mode,
  j.employment_type,
  j.posted_at AS posted_date,
  COUNT(a.id) AS application_count
FROM public.jobs j
JOIN public.companies c ON j.company_id = c.id
LEFT JOIN public.applications a ON j.id = a.job_id AND a.deleted_at IS NULL
WHERE j.deleted_at IS NULL
GROUP BY j.id, c.name;

COMMENT ON VIEW public.job_overview IS 'Overview list of job tracked items, companies, work configurations, and total application counts.';
