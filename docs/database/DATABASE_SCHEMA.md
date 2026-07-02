# Database Schema Specification - Offerly

This document defines the schema configuration, constraints, row-level security (RLS) rules, trigger hooks, performance indexes, and relational definitions for the Offerly PostgreSQL database managed under Supabase.

---

## 1. Database Extensions

* **`vector`**: Enabled under the `public` schema. Used for future semantic vector matching.
* **`pgcrypto`**: Enabled under the `public` schema. Provides cryptographic random generators (e.g., `gen_random_uuid()`).

---

## 2. PostgreSQL Custom Enum Types

### `public.experience_level`
Declares the candidate experience hierarchy bounds:
* `entry`
* `mid`
* `senior`
* `lead`

### `public.application_status`
Tracks the status tracking progression list of job applications:
* `wishlist`
* `applied`
* `oa` (Online Assessment)
* `interview`
* `hr` (HR screening/negotiation)
* `offer`
* `accepted`
* `rejected`
* `withdrawn`

### `public.priority`
Represents the personal target importance of job postings:
* `low`
* `medium`
* `high`
* `critical`

### `public.work_mode`
Tracks targeted operational job locations:
* `remote`
* `hybrid`
* `onsite`

### `public.employment_type`
Defines targeted job contract relations:
* `internship`
* `full_time`
* `part_time`
* `contract`

### `public.company_size`
Defines standard company sizing brackets:
* `1-10`
* `11-50`
* `51-200`
* `201-500`
* `501-1000`
* `1000+`

---

## 3. Relational Schema Tables

### Table 1: `public.profiles`
* **Purpose**: Extends default Supabase Auth details with application-specific preferences, career goals, and social links.
* **Columns**:
  * `id`: `UUID` (Primary Key, foreign key referencing `auth.users(id) ON DELETE CASCADE ON UPDATE CASCADE`)
  * `full_name`: `VARCHAR(150)` (Nullable)
  * `avatar_url`: `VARCHAR(512)` (Nullable)
  * `preferred_location`: `VARCHAR(100)` (Nullable)
  * `linkedin_url`: `VARCHAR(512)` (Nullable)
  * `github_url`: `VARCHAR(512)` (Nullable)
  * `target_role`: `VARCHAR(100)` (Nullable)
  * `experience_level`: `public.experience_level` (Nullable)
  * `target_salary_min`: `NUMERIC(12, 2)` (Default: `0.00`)
  * `target_salary_max`: `NUMERIC(12, 2)` (Default: `0.00`)
  * `deleted_at`: `TIMESTAMPTZ` (Nullable)
  * `created_at`: `TIMESTAMPTZ` (Default: `now()`)
  * `updated_at`: `TIMESTAMPTZ` (Default: `now()`)
* **Constraints**:
  * `check_target_salary_min`: `target_salary_min >= 0`
  * `check_target_salary_max`: `target_salary_max >= target_salary_min`
* **Indexes**:
  * `profiles_target_role_idx`: B-tree index on `target_role`
  * `profiles_experience_level_idx`: B-tree index on `experience_level`
  * `profiles_deleted_at_idx`: B-tree partial index on `deleted_at` where `deleted_at IS NULL`
* **Triggers**:
  * `update_profiles_updated_at`: `BEFORE UPDATE` updates `updated_at` via `handle_updated_at()`
  * `on_auth_user_created`: `AFTER INSERT` on `auth.users` calls `handle_new_user()` to automatically create profile
* **RLS Policies**:
  * `SELECT`: `auth.uid() = id AND deleted_at IS NULL`
  * `INSERT`: `auth.uid() = id`
  * `UPDATE`: `auth.uid() = id AND deleted_at IS NULL`
  * `DELETE`: `auth.uid() = id`

---

### Table 2: `public.companies`
* **Purpose**: User-owned corporate directory registry.
* **Columns**:
  * `id`: `UUID` (Primary Key, Default: `gen_random_uuid()`)
  * `user_id`: `UUID` (Not Null, Foreign key referencing `auth.users(id) ON DELETE CASCADE ON UPDATE CASCADE`)
  * `name`: `VARCHAR(150)` (Not Null)
  * `website`: `TEXT` (Nullable)
  * `linkedin_url`: `TEXT` (Nullable)
  * `industry`: `VARCHAR(100)` (Nullable)
  * `location`: `VARCHAR(150)` (Nullable)
  * `size`: `public.company_size` (Nullable)
  * `logo_url`: `TEXT` (Nullable)
  * `description`: `TEXT` (Nullable)
  * `notes`: `TEXT` (Nullable)
  * `deleted_at`: `TIMESTAMPTZ` (Nullable)
  * `created_at`: `TIMESTAMPTZ` (Default: `now()`)
  * `updated_at`: `TIMESTAMPTZ` (Default: `now()`)
* **Constraints**:
  * `companies_user_id_name_key`: Unique constraint on `(user_id, name)` (User cannot create duplicate company names)
* **Indexes**:
  * `companies_user_id_idx`: B-tree index on `user_id`
  * `companies_name_idx`: B-tree index on `name`
  * `companies_industry_idx`: B-tree index on `industry`
  * `companies_deleted_at_idx`: B-tree partial index on `deleted_at` where `deleted_at IS NULL`
* **Triggers**:
  * `update_companies_updated_at`: `BEFORE UPDATE` updates `updated_at` via `handle_updated_at()`
* **RLS Policies**:
  * `SELECT`: `auth.uid() = user_id AND deleted_at IS NULL`
  * `INSERT`: `auth.uid() = user_id`
  * `UPDATE`: `auth.uid() = user_id AND deleted_at IS NULL`
  * `DELETE`: `auth.uid() = user_id`

---

### Table 3: `public.jobs`
* **Purpose**: User-owned target job catalog listings.
* **Columns**:
  * `id`: `UUID` (Primary Key, Default: `gen_random_uuid()`)
  * `user_id`: `UUID` (Not Null, Foreign key referencing `auth.users(id) ON DELETE CASCADE ON UPDATE CASCADE`)
  * `company_id`: `UUID` (Not Null, Foreign key referencing `public.companies(id) ON DELETE CASCADE ON UPDATE CASCADE`)
  * `title`: `VARCHAR(150)` (Not Null)
  * `description`: `TEXT` (Nullable)
  * `location`: `VARCHAR(150)` (Nullable)
  * `salary_min`: `NUMERIC(12, 2)` (Default: `0.00`)
  * `salary_max`: `NUMERIC(12, 2)` (Default: `0.00`)
  * `priority`: `public.priority` (Default: `'medium'`)
  * `status`: `public.application_status` (Default: `'wishlist'`)
  * `work_mode`: `public.work_mode` (Nullable)
  * `employment_type`: `public.employment_type` (Nullable)
  * `job_url`: `TEXT` (Nullable)
  * `applied_at`: `TIMESTAMPTZ` (Nullable)
  * `deadline`: `TIMESTAMPTZ` (Nullable)
  * `deleted_at`: `TIMESTAMPTZ` (Nullable)
  * `created_at`: `TIMESTAMPTZ` (Default: `now()`)
  * `updated_at`: `TIMESTAMPTZ` (Default: `now()`)
* **Constraints**:
  * `check_jobs_salary_min`: `salary_min >= 0`
  * `check_jobs_salary_max`: `salary_max >= salary_min`
* **Indexes**:
  * `jobs_user_id_idx`: B-tree index on `user_id`
  * `jobs_company_id_idx`: B-tree index on `company_id`
  * `jobs_status_idx`: B-tree index on `status`
  * `jobs_priority_idx`: B-tree index on `priority`
  * `jobs_deleted_at_idx`: B-tree partial index on `deleted_at` where `deleted_at IS NULL`
* **Composite Indexes**:
  * `jobs_user_id_status_idx`: Index on `(user_id, status)` for fast Kanban column lookups
  * `jobs_user_id_created_at_idx`: Index on `(user_id, created_at DESC)` for chronologically sorted lists
  * `jobs_company_id_user_id_idx`: Index on `(company_id, user_id)` for company specific job counts
* **Triggers**:
  * `update_jobs_updated_at`: `BEFORE UPDATE` updates `updated_at` via `handle_updated_at()`
* **RLS Policies**:
  * `SELECT`: `auth.uid() = user_id AND deleted_at IS NULL`
  * `INSERT`: `auth.uid() = user_id`
  * `UPDATE`: `auth.uid() = user_id AND deleted_at IS NULL`
  * `DELETE`: `auth.uid() = user_id`

---

### Table 4: `public.resumes`
* **Purpose**: User-owned CV records, file path pointers, and structured profiles.
* **Columns**:
  * `id`: `UUID` (Primary Key, Default: `gen_random_uuid()`)
  * `user_id`: `UUID` (Not Null, Foreign key referencing `auth.users(id) ON DELETE CASCADE ON UPDATE CASCADE`)
  * `version_name`: `VARCHAR(100)` (Default: `'Original'`)
  * `parsed_text`: `TEXT` (Not Null)
  * `structured_data`: `JSONB` (Default: `'{}'::jsonb`)
  * `file_path`: `TEXT` (Not Null)
  * `file_name`: `VARCHAR(255)` (Not Null)
  * `file_type`: `VARCHAR(100)` (Not Null)
  * `file_size`: `BIGINT` (Not Null)
  * `ats_score`: `INT` (Nullable)
  * `is_default`: `BOOLEAN` (Default: `false`)
  * `deleted_at`: `TIMESTAMPTZ` (Nullable)
  * `created_at`: `TIMESTAMPTZ` (Default: `now()`)
  * `updated_at`: `TIMESTAMPTZ` (Default: `now()`)
* **Constraints**:
  * `resumes_user_id_version_name_key`: Unique constraint on `(user_id, version_name)`
  * `check_resumes_ats_score`: `ats_score >= 0 AND ats_score <= 100`
* **Indexes**:
  * `resumes_user_id_idx`: B-tree index on `user_id`
  * `resumes_is_default_idx`: B-tree index on `is_default`
  * `resumes_deleted_at_idx`: B-tree partial index on `deleted_at` where `deleted_at IS NULL`
  * `resumes_structured_data_gin_idx`: GIN index on `structured_data`
  * `resumes_user_id_default_idx`: Unique partial index on `(user_id)` where `is_default = true AND deleted_at IS NULL` (Ensures maximum of 1 default resume per user)
* **Triggers**:
  * `update_resumes_updated_at`: `BEFORE UPDATE` updates `updated_at` via `handle_updated_at()`
* **RLS Policies**:
  * `SELECT`: `auth.uid() = user_id AND deleted_at IS NULL`
  * `INSERT`: `auth.uid() = user_id`
  * `UPDATE`: `auth.uid() = user_id AND deleted_at IS NULL`
  * `DELETE`: `auth.uid() = user_id`

---

### Table 5: `public.notes`
* **Purpose**: User-owned notebook records appended to targeted positions.
* **Columns**:
  * `id`: `UUID` (Primary Key, Default: `gen_random_uuid()`)
  * `user_id`: `UUID` (Not Null, Foreign key referencing `auth.users(id) ON DELETE CASCADE ON UPDATE CASCADE`)
  * `job_id`: `UUID` (Not Null, Foreign key referencing `public.jobs(id) ON DELETE CASCADE ON UPDATE CASCADE`)
  * `content`: `TEXT` (Not Null)
  * `deleted_at`: `TIMESTAMPTZ` (Nullable)
  * `created_at`: `TIMESTAMPTZ` (Default: `now()`)
  * `updated_at`: `TIMESTAMPTZ` (Default: `now()`)
* **Indexes**:
  * `notes_user_id_idx`: B-tree index on `user_id`
  * `notes_job_id_idx`: B-tree index on `job_id`
  * `notes_created_at_idx`: B-tree sorting index on `created_at DESC`
  * `notes_deleted_at_idx`: B-tree partial index on `deleted_at` where `deleted_at IS NULL`
* **Triggers**:
  * `update_notes_updated_at`: `BEFORE UPDATE` updates `updated_at` via `handle_updated_at()`
* **RLS Policies**:
  * `SELECT`: `auth.uid() = user_id AND deleted_at IS NULL`
  * `INSERT`: `auth.uid() = user_id`
  * `UPDATE`: `auth.uid() = user_id AND deleted_at IS NULL`
  * `DELETE`: `auth.uid() = user_id`

---

### Table 6: `public.application_history` (Append-Only)
* **Purpose**: Logs status transitions across target job tracks.
* **Columns**:
  * `id`: `UUID` (Primary Key, Default: `gen_random_uuid()`)
  * `user_id`: `UUID` (Not Null, Foreign key referencing `auth.users(id) ON DELETE CASCADE ON UPDATE CASCADE`)
  * `job_id`: `UUID` (Not Null, Foreign key referencing `public.jobs(id) ON DELETE CASCADE ON UPDATE CASCADE`)
  * `changed_by`: `UUID` (Not Null, Foreign key referencing `auth.users(id) ON DELETE CASCADE ON UPDATE CASCADE`)
  * `from_status`: `public.application_status` (Not Null)
  * `to_status`: `public.application_status` (Not Null)
  * `note`: `TEXT` (Nullable)
  * `created_at`: `TIMESTAMPTZ` (Default: `now()`)
* **Constraints**:
  * `check_status_change`: `from_status <> to_status`
* **Indexes**:
  * `application_history_user_id_idx`: B-tree index on `user_id`
  * `application_history_job_id_idx`: B-tree index on `job_id`
  * `application_history_created_at_idx`: B-tree index on `created_at DESC`
* **RLS Policies**:
  * `SELECT`: `auth.uid() = user_id`
  * `INSERT`: `auth.uid() = user_id`

---

### Table 7: `public.job_tags` (Global Lookup)
* **Purpose**: Shared tags dictionary database.
* **Columns**:
  * `id`: `UUID` (Primary Key, Default: `gen_random_uuid()`)
  * `name`: `VARCHAR(100)` (Not Null, Unique)
  * `created_at`: `TIMESTAMPTZ` (Default: `now()`)
* **Indexes**:
  * `job_tags_name_idx`: B-tree index on `name`
* **RLS Policies**:
  * `SELECT`: `true` (any authenticated user can view global tags)
  * `INSERT`: `true` (any authenticated user can insert tags)

---

### Table 8: `public.job_tag_map` (Junction table)
* **Purpose**: Junction map binding jobs to relevant tags. Enforces data protection by validating job ownership.
* **Columns**:
  * `job_id`: `UUID` (Primary Key, Foreign key referencing `public.jobs(id) ON DELETE CASCADE ON UPDATE CASCADE`)
  * `tag_id`: `UUID` (Primary Key, Foreign key referencing `public.job_tags(id) ON DELETE CASCADE ON UPDATE CASCADE`)
  * `created_at`: `TIMESTAMPTZ` (Default: `now()`)
* **Indexes**:
  * `job_tag_map_job_id_idx`: B-tree index on `job_id`
  * `job_tag_map_tag_id_idx`: B-tree index on `tag_id`
* **RLS Policies**:
  * `SELECT`: `EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.user_id = auth.uid())`
  * `INSERT`: `EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.user_id = auth.uid())`
  * `DELETE`: `EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.user_id = auth.uid())`
