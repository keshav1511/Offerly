# Offerly — Supabase Local Reset and Seeding Workflow

This document outlines the standard workflow for resetting, migrating, generating types, and seeding the local developer environment.

---

## 1. Local Reset and Migration Application
To reset the local database instance, apply all migrations from a clean state:
```bash
supabase db reset
```
This automatically runs all SQL files in `supabase/migrations/` in chronological order, verifies foreign keys, compiles triggers, and resets RLS states.

---

## 2. Seeding Development Data
To populate the database with mock profiles, companies, jobs, resumes, and bookmarks for local development and QA testing:
```bash
supabase db seed
```
This reads the local file `supabase/seed.sql` and populates the database tables with candidate profiles, jobs, tags, and mock applications.

> [!NOTE]
> Running `supabase db reset` automatically calls the seeding script if `supabase/seed.sql` exists in the project root directory.

---

## 3. TypeScript Schema Generation
To generate TypeScript interfaces mapping to the updated database structure:
```bash
supabase gen types typescript --local --schema public > frontend/lib/supabase/types.ts
```

### Windows Encoding Adjustment
On Windows, PowerShell redirections write file output in UTF-16 encoding by default. This will cause Next.js ESLint compilation steps to fail with a binary formatting error.
To resolve this, run this command in PowerShell to convert the generated types back to standard UTF-8:
```powershell
[System.IO.File]::WriteAllText("frontend/lib/supabase/types.ts", [System.IO.File]::ReadAllText("frontend/lib/supabase/types.ts"))
```

---

## 4. Frontend Type Compilation Check
Finally, compile the static Next.js pages to confirm zero TypeScript or ESLint errors exist:
```bash
cd frontend
npm run build
```

---

## 5. Production Deployment Workflow
To deploy schema enhancements to the live remote project:
1. Repair any legacy migration tracking states (if files were deleted):
   ```bash
   supabase migration repair --status reverted <migration_timestamp>
   ```
2. Push all new migrations:
   ```bash
   supabase db push
   ```
3. Generate remote TypeScript definitions:
   ```bash
   supabase gen types typescript --project-id <supabase_project_id> > frontend/lib/supabase/types.ts
   ```
