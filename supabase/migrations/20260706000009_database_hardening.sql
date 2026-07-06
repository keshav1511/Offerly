-- 1. Drop redundant indexes to optimize write performance (covered by composite primary or unique keys)
DROP INDEX IF EXISTS public.saved_jobs_user_id_idx;
DROP INDEX IF EXISTS public.job_skill_map_job_id_idx;
DROP INDEX IF EXISTS public.job_tag_map_job_id_idx;

-- 2. Add documentation COMMENTS for tables
COMMENT ON TABLE public.profiles IS 'Extends authentication user details with names, photos, onboarding progression state, and career goals.';
COMMENT ON TABLE public.notes IS 'Personal notes cataloged by user accounts and attached to targeted job positions.';
COMMENT ON TABLE public.application_history IS 'Append-only transition logs recording progress jumps across workflow statuses.';
COMMENT ON TABLE public.saved_jobs IS 'Bookmarks tracking job positions targeted by user accounts.';
COMMENT ON TABLE public.job_skills IS 'Normalized taxonomy directory of skills, frameworks, and job keywords.';
COMMENT ON TABLE public.job_skill_map IS 'Junction table mapping job postings to their required qualifications and skills.';

-- 3. Add documentation COMMENTS for columns where useful
COMMENT ON COLUMN public.profiles.target_role IS 'Preferred next title or role of the candidate.';
COMMENT ON COLUMN public.companies.size IS 'Size range enumeration of the company employee base.';
COMMENT ON COLUMN public.jobs.priority IS 'Priority tier tracking urgency level of the job listing.';
COMMENT ON COLUMN public.resumes.ats_score IS 'AI generated score mapping resume text relevance against target parameters.';
COMMENT ON COLUMN public.resumes.embedding IS '1536-dimensional vector embedding representation of the CV text contents.';
COMMENT ON COLUMN public.applications.salary_offered IS 'Numeric salary package amount proposed in the job offer stage.';
COMMENT ON COLUMN public.application_events.payload IS 'JSON metadata tracking parameters of the lifecycle event.';

-- 4. Add documentation COMMENTS for views
COMMENT ON VIEW public.application_dashboard IS 'Consolidated real-time career analytics metrics including totals and average ATS resume scores.';
COMMENT ON VIEW public.job_overview IS 'List overview joining job records, employer brands, and total application metrics.';

-- 5. Add documentation COMMENTS for triggers
-- Triggers cannot have direct comments, but we comment on functions they execute:
COMMENT ON FUNCTION public.handle_updated_at() IS 'Fires on update triggers to automatically sync updated_at timestamps to now().';
COMMENT ON FUNCTION public.handle_new_user() IS 'Fires on auth.users inserts to automatically create corresponding public.profiles records.';
COMMENT ON FUNCTION public.handle_application_status_change() IS 'Fires on applications update/insert to log state transitions inside application_events.';
