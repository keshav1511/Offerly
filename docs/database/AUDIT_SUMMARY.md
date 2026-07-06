# Offerly — Sprint 2 Database Schema Audit Summary

This document summarizes the complete structural metrics of the verified Sprint 2 Database Layer.

---

## 1. Schema Objects Count

| Object Type | Count | Description |
| :--- | :--- | :--- |
| **Tables** | 13 | Core entity tables, bridge tables, and audit logs. |
| **Views** | 2 | Aggregated analytics and listing query views. |
| **Functions** | 9 | Triggers helpers, status routers, and stable metrics functions. |
| **Triggers** | 9 | Automatic update tracking and status logs. |
| **Custom Enums** | 6 | Domain constraints (priority, statuses, employment types). |
| **RLS Policies** | 42 | Policies restricting row reads/writes to data owners. |

---

## 2. Directory of Tables

1. `profiles`: Candidate profile metadata and target career parameters.
2. `companies`: Private target companies cataloged by candidates.
3. `jobs`: Job listings containing salary bounds, work modes, and titles.
4. `resumes`: Versioned resume text contents and ATS matching statistics.
5. `notes`: Study plans and interview preparation notebooks linked to jobs.
6. `application_history`: Historical transition logs of jobs progression.
7. `job_tags`: Global tags registry lookup for skills and categories.
8. `job_tag_map`: Junction bridge table linking jobs to tags.
9. `saved_jobs`: User bookmarked jobs lists.
10. `job_skills`: Normalized taxonomy table of skills.
11. `job_skill_map`: Junction bridge table linking jobs to skills.
12. `applications`: User job tracking logs containing status and salary.
13. `application_events`: Append-only transition audit logs.

---

## 3. Directory of Views

1. `application_dashboard`: Calculates user application state totals and average resume ATS score.
2. `job_overview`: Joins target jobs with employer names and total applications count.

---

## 4. Directory of Functions

1. `handle_updated_at()`: Synchronizes `updated_at` column values to `now()`.
2. `handle_new_user()`: Inserts default user profiles when auth registers.
3. `handle_application_status_change()`: Dispatches status changes logs into event tables.
4. `application_count_by_status(user_uuid)`: Group counts applications by status.
5. `wishlist_count(user_uuid)`: Counts wishlist items.
6. `active_interviews(user_uuid)`: Counts interview stages.
7. `offers_received(user_uuid)`: Counts offer stages.
8. `average_ats_score(user_uuid)`: Aggregates average ATS score of active resumes.
9. `latest_application(user_uuid)`: Extracts latest application row columns.

---

## 5. Security Validation
- All tables have **Row Level Security (RLS) enabled**.
- Under no circumstances can a user read, insert, update, or delete records belonging to another user.
- Views leverage the underlying RLS policies of profiles, jobs, and applications to maintain strict session security boundaries.
