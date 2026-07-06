-- Suppress trigger and constraint issues by inserting dependency order:
-- Users -> Profiles (via update) -> Companies -> Jobs -> Resumes -> Applications -> Notes / Tags / Skills / Bookmarks

-- 1. Seed Auth Users
-- Generates mock records inside auth.users (on_auth_user_created trigger automatically creates empty profiles)
INSERT INTO auth.users (
  id,
  email,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES 
  (
    'd73a7d2e-0678-4ea1-b2ef-9f37f3747d01', 
    'candidate@offerly.ai', 
    '{"full_name": "Jane Candidate"}'::jsonb,
    now() - interval '30 days',
    now()
  ),
  (
    'a28c8d2f-1789-5ea2-c3ef-0f48f4858e02', 
    'applicant@offerly.ai', 
    '{"full_name": "John Applicant"}'::jsonb,
    now() - interval '15 days',
    now()
  )
ON CONFLICT (id) DO NOTHING;

-- 2. Update Profiles details (Trigger creates empty profiles, seed updates them)
UPDATE public.profiles
SET 
  full_name = 'Jane Candidate',
  target_role = 'Senior Software Engineer',
  target_salary_min = 120000.00,
  target_salary_max = 160000.00,
  experience_level = 'senior'::public.experience_level
WHERE id = 'd73a7d2e-0678-4ea1-b2ef-9f37f3747d01';

UPDATE public.profiles
SET 
  full_name = 'John Applicant',
  target_role = 'Product Manager',
  target_salary_min = 110000.00,
  target_salary_max = 150000.00,
  experience_level = 'mid'::public.experience_level
WHERE id = 'a28c8d2f-1789-5ea2-c3ef-0f48f4858e02';

-- 3. Seed Companies
INSERT INTO public.companies (
  id, 
  user_id, 
  name, 
  website, 
  linkedin_url, 
  industry, 
  location, 
  size, 
  logo_url, 
  description, 
  notes
) VALUES
  (
    'c5b2a7d2-0678-4ea1-b2ef-9f37f3747c01', 
    'd73a7d2e-0678-4ea1-b2ef-9f37f3747d01', 
    'Stripe', 
    'https://stripe.com', 
    'https://linkedin.com/company/stripe',
    'Fintech', 
    'San Francisco, CA', 
    '1000+', 
    'https://logo.clearbit.com/stripe.com',
    'Global payments infrastructure platform for online business transactions.',
    'Fast-paced backend environment with heavy focus on API reliability.'
  ),
  (
    'c5b2a7d2-0678-4ea1-b2ef-9f37f3747c02', 
    'd73a7d2e-0678-4ea1-b2ef-9f37f3747d01', 
    'Vercel', 
    'https://vercel.com', 
    'https://linkedin.com/company/vercel',
    'Cloud Computing', 
    'Remote', 
    '201-500', 
    'https://logo.clearbit.com/vercel.com',
    'Frontend deployment developer tools and React Next.js cloud frameworks.',
    'Remote-first culture, strong emphasis on open source contribution.'
  ),
  (
    'c5b2a7d2-0678-4ea1-b2ef-9f37f3747c03', 
    'a28c8d2f-1789-5ea2-c3ef-0f48f4858e02', 
    'Google', 
    'https://google.com', 
    'https://linkedin.com/company/google',
    'Technology', 
    'Mountain View, CA', 
    '1000+', 
    'https://logo.clearbit.com/google.com',
    'Multinational internet services search engine and AI developer corp.',
    'Massive scale platforms and complex internal coordination.'
  )
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Jobs
INSERT INTO public.jobs (
  id, 
  user_id, 
  company_id, 
  title, 
  description, 
  location, 
  salary_min, 
  salary_max, 
  priority,
  status,
  work_mode, 
  employment_type, 
  job_url,
  applied_at,
  deadline,
  department, 
  currency, 
  requirements, 
  responsibilities, 
  benefits, 
  application_url, 
  source, 
  external_job_id,
  posted_at, 
  expires_at
) VALUES
  (
    'f5b2a7d2-0678-4ea1-b2ef-9f37f3747f01', 
    'd73a7d2e-0678-4ea1-b2ef-9f37f3747d01', 
    'c5b2a7d2-0678-4ea1-b2ef-9f37f3747c01', 
    'Senior Backend Engineer', 
    'Develop Stripe scale transaction features and maintain API layers.',
    'San Francisco, CA', 
    150000.00, 
    190000.00, 
    'high'::public.priority,
    'applied'::public.application_status,
    'hybrid'::public.work_mode, 
    'full_time'::public.employment_type, 
    'https://stripe.com/jobs/detail/892',
    now() - interval '5 days',
    now() + interval '25 days',
    'Core Payments API', 
    'USD', 
    '5+ years programming experience in Go, Java, or Ruby. System design proficiency.', 
    'Maintain transactional APIs and scaling databases databases.', 
    'Competitive salary, equity package, and premium health coverage.', 
    'https://stripe.com/jobs/apply/892',
    'Stripe Careers Portal', 
    'strp-892',
    now() - interval '10 days',
    now() + interval '30 days'
  ),
  (
    'f5b2a7d2-0678-4ea1-b2ef-9f37f3747f02', 
    'd73a7d2e-0678-4ea1-b2ef-9f37f3747d01', 
    'c5b2a7d2-0678-4ea1-b2ef-9f37f3747c02', 
    'Frontend Engineer', 
    'Craft Next.js developer libraries, tooling, and documentation blocks.',
    'Remote', 
    130000.00, 
    165000.00, 
    'medium'::public.priority,
    'wishlist'::public.application_status,
    'remote'::public.work_mode, 
    'full_time'::public.employment_type, 
    'https://vercel.com/jobs/detail/011',
    NULL,
    now() + interval '45 days',
    'Framework DX Team', 
    'USD', 
    'Expertise in React 19, Next.js, Tailwind, and Webpack compiler setups.', 
    'Build and document rendering interfaces.', 
    '401k match, standard equipment stipends, wellness funds.', 
    'https://vercel.com/jobs/apply/011',
    'LinkedIn Listings', 
    'verc-011',
    now() - interval '2 days',
    now() + interval '60 days'
  ),
  (
    'f5b2a7d2-0678-4ea1-b2ef-9f37f3747f03', 
    'a28c8d2f-1789-5ea2-c3ef-0f48f4858e02', 
    'c5b2a7d2-0678-4ea1-b2ef-9f37f3747c03', 
    'Product Manager II', 
    'Drive requirements specifications for Google Search scaling modules.',
    'Mountain View, CA', 
    160000.00, 
    210000.00, 
    'critical'::public.priority,
    'applied'::public.application_status,
    'onsite'::public.work_mode, 
    'full_time'::public.employment_type, 
    'https://google.com/jobs/goog-7781',
    now() - interval '2 days',
    now() + interval '12 days',
    'Search Platforms', 
    'USD', 
    '3+ years product management experience on technical systems.', 
    'Define feature lists and align stakeholder roadmap boards.', 
    'Google campus access, meal plans, health credits.', 
    'https://google.com/jobs/apply/goog-7781',
    'Google Job Board', 
    'goog-7781',
    now() - interval '6 days',
    now() + interval '20 days'
  )
ON CONFLICT (id) DO NOTHING;

-- 5. Seed Resumes
INSERT INTO public.resumes (
  id, 
  user_id, 
  version_name, 
  parsed_text, 
  structured_data, 
  file_path, 
  file_name, 
  file_type, 
  file_size, 
  ats_score, 
  is_default
) VALUES
  (
    'e5b2a7d2-0678-4ea1-b2ef-9f37f3747e01', 
    'd73a7d2e-0678-4ea1-b2ef-9f37f3747d01', 
    'Go & System Design CV', 
    'Jane Candidate: 6 years experience in Node.js and Go. System designer.', 
    '{"skills": ["Node.js", "Go", "Postgres", "System Design"], "experience_years": 6}'::jsonb, 
    'd73a7d2e-0678-4ea1-b2ef-9f37f3747d01/r01_cv.pdf', 
    'jane_cv_go_backend.pdf', 
    'application/pdf', 
    102450, 
    88, 
    true
  ),
  (
    'e5b2a7d2-0678-4ea1-b2ef-9f37f3747e02', 
    'a28c8d2f-1789-5ea2-c3ef-0f48f4858e02', 
    'Product Management CV', 
    'John Applicant: Product manager specializing in search and platform scaling systems.', 
    '{"skills": ["Product Strategy", "Agile", "SQL", "Roadmapping"], "experience_years": 4}'::jsonb, 
    'a28c8d2f-1789-5ea2-c3ef-0f48f4858e02/r02_cv.pdf', 
    'john_cv_product.pdf', 
    'application/pdf', 
    115600, 
    92, 
    true
  )
ON CONFLICT (id) DO NOTHING;

-- 6. Seed Applications
-- Note: Insert trigger automatically fires to log event 'application_created'
INSERT INTO public.applications (
  id, 
  user_id, 
  job_id, 
  resume_id, 
  status, 
  priority, 
  applied_at, 
  notes
) VALUES
  (
    'a5b2a7d2-0678-4ea1-b2ef-9f37f3747a01', 
    'd73a7d2e-0678-4ea1-b2ef-9f37f3747d01', 
    'f5b2a7d2-0678-4ea1-b2ef-9f37f3747f01', 
    'e5b2a7d2-0678-4ea1-b2ef-9f37f3747e01', 
    'applied', 
    'high', 
    now() - interval '5 days', 
    '{"stage": "hr_screening", "next_step": "System design round study."}'::jsonb
  ),
  (
    'a5b2a7d2-0678-4ea1-b2ef-9f37f3747a02', 
    'a28c8d2f-1789-5ea2-c3ef-0f48f4858e02', 
    'f5b2a7d2-0678-4ea1-b2ef-9f37f3747f03', 
    'e5b2a7d2-0678-4ea1-b2ef-9f37f3747e02', 
    'applied', 
    'critical', 
    now() - interval '2 days', 
    '{"stage": "applied_waiting", "next_step": "Follow up in 5 days."}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- 7. Seed Application Events
-- Populates status change events logs for auditable analytics
INSERT INTO public.application_events (
  id,
  application_id,
  event_type,
  event_time,
  payload
) VALUES
  (
    'bb22a7d2-0678-4ea1-b2ef-9f37f3747b01',
    'a5b2a7d2-0678-4ea1-b2ef-9f37f3747a01',
    'status_changed',
    now() - interval '3 days',
    '{"from_status": "wishlist", "to_status": "applied", "user_id": "d73a7d2e-0678-4ea1-b2ef-9f37f3747d01"}'::jsonb
  ),
  (
    'bb22a7d2-0678-4ea1-b2ef-9f37f3747b02',
    'a5b2a7d2-0678-4ea1-b2ef-9f37f3747a02',
    'status_changed',
    now() - interval '1 days',
    '{"from_status": "wishlist", "to_status": "applied", "user_id": "a28c8d2f-1789-5ea2-c3ef-0f48f4858e02"}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- 8. Seed Job Tags
INSERT INTO public.job_tags (id, name)
VALUES
  ('ab82a7d2-0678-4ea1-b2ef-9f37f3747d01', 'Go'),
  ('ab82a7d2-0678-4ea1-b2ef-9f37f3747d02', 'System Design'),
  ('ab82a7d2-0678-4ea1-b2ef-9f37f3747d03', 'React'),
  ('ab82a7d2-0678-4ea1-b2ef-9f37f3747d04', 'Next.js'),
  ('ab82a7d2-0678-4ea1-b2ef-9f37f3747d05', 'Roadmapping')
ON CONFLICT (id) DO NOTHING;

-- 9. Seed Job Tag Map Links
INSERT INTO public.job_tag_map (job_id, tag_id)
VALUES
  ('f5b2a7d2-0678-4ea1-b2ef-9f37f3747f01', 'ab82a7d2-0678-4ea1-b2ef-9f37f3747d01'),
  ('f5b2a7d2-0678-4ea1-b2ef-9f37f3747f01', 'ab82a7d2-0678-4ea1-b2ef-9f37f3747d02'),
  ('f5b2a7d2-0678-4ea1-b2ef-9f37f3747f02', 'ab82a7d2-0678-4ea1-b2ef-9f37f3747d03'),
  ('f5b2a7d2-0678-4ea1-b2ef-9f37f3747f02', 'ab82a7d2-0678-4ea1-b2ef-9f37f3747d04'),
  ('f5b2a7d2-0678-4ea1-b2ef-9f37f3747f03', 'ab82a7d2-0678-4ea1-b2ef-9f37f3747d05')
ON CONFLICT DO NOTHING;

-- 10. Seed Notes
INSERT INTO public.notes (
  id, 
  user_id, 
  job_id, 
  content
) VALUES
  (
    'cb22a7d2-0678-4ea1-b2ef-9f37f3747c01', 
    'd73a7d2e-0678-4ea1-b2ef-9f37f3747d01', 
    'f5b2a7d2-0678-4ea1-b2ef-9f37f3747f01', 
    'Study transactional consistency, multi-region database replication architectures, and idempotency keys handling.'
  )
ON CONFLICT (id) DO NOTHING;

-- 11. Seed Job Skills (Taxonomy list)
INSERT INTO public.job_skills (id, name, category)
VALUES
  ('dd22a7d2-0678-4ea1-b2ef-9f37f3747d01', 'Golang Programming', 'Backend'),
  ('dd22a7d2-0678-4ea1-b2ef-9f37f3747d02', 'System Design & Architecture', 'General Engineering'),
  ('dd22a7d2-0678-4ea1-b2ef-9f37f3747d03', 'TypeScript Language', 'Frontend'),
  ('dd22a7d2-0678-4ea1-b2ef-9f37f3747d04', 'Product Strategy Planning', 'Product Management')
ON CONFLICT (id) DO NOTHING;

-- 12. Seed Job Skill Map bridge table links
INSERT INTO public.job_skill_map (job_id, skill_id)
VALUES
  ('f5b2a7d2-0678-4ea1-b2ef-9f37f3747f01', 'dd22a7d2-0678-4ea1-b2ef-9f37f3747d01'),
  ('f5b2a7d2-0678-4ea1-b2ef-9f37f3747f01', 'dd22a7d2-0678-4ea1-b2ef-9f37f3747d02'),
  ('f5b2a7d2-0678-4ea1-b2ef-9f37f3747f02', 'dd22a7d2-0678-4ea1-b2ef-9f37f3747d03'),
  ('f5b2a7d2-0678-4ea1-b2ef-9f37f3747f03', 'dd22a7d2-0678-4ea1-b2ef-9f37f3747d04')
ON CONFLICT DO NOTHING;

-- 13. Seed Bookmarks (Saved Jobs)
INSERT INTO public.saved_jobs (id, user_id, job_id)
VALUES
  ('b5b2a7d2-0678-4ea1-b2ef-9f37f3747b01', 'd73a7d2e-0678-4ea1-b2ef-9f37f3747d01', 'f5b2a7d2-0678-4ea1-b2ef-9f37f3747f02')
ON CONFLICT (id) DO NOTHING;
