# Engineering Standards - Offerly

This document defines the team-wide conventions, directory rules, deployment parameters, and standards for version control, environments, and logging.

---

## 1. Naming Conventions

### 1.1 Folder Naming
- **Frontend / General**: Use lowercase, kebab-case (e.g., `components/user-profile/`, `features/job-search/`).
- **Backend / Python Modules**: Use lowercase, snake_case (e.g., `app/database/`, `app/repositories/`).
- **DevOps / Config folders**: Use lowercase, kebab-case (e.g., `.github/workflows/`, `infrastructure/supabase/`).

### 1.2 File Naming
- **Frontend TS/JS (Logic/Utilities)**: Use kebab-case (e.g., `api-client.ts`, `use-local-storage.ts`).
- **Frontend React Components**: Use PascalCase (e.g., `Button.tsx`, `KanbanBoard.tsx`).
- **Backend Python files**: Use snake_case (e.g., `session.py`, `user_repository.py`).
- **Styles**: Use kebab-case for custom stylesheets (e.g., `globals.css`).

### 1.3 Component Naming (React)
- **PascalCase** must be used for all React components.
- Component folder names must match the primary component (e.g., a folder `JobCard/` contains `JobCard.tsx`, `JobCard.test.tsx`, and `index.ts`).
- Hooks must begin with the prefix `use` (e.g., `useAuth.ts`, `useWindowDimensions.ts`).

---

## 2. Git & Version Control Standards

### 2.1 Branch Naming Conventions
All branch names must follow this format: `<type>/<issue-id>-<short-description>`.
- **`feat/`**: New feature development (e.g., `feat/OFF-102-resume-parser`).
- **`fix/`**: Bug resolution (e.g., `fix/OFF-204-jwt-expiry`).
- **`refactor/`**: Code structure updates (no functional changes) (e.g., `refactor/OFF-99-db-pooling`).
- **`docs/`**: Documentation updates (e.g., `docs/OFF-10-srs-revision`).
- **`chore/`**: Maintenance tasks, library upgrades, or tooling updates (e.g., `chore/OFF-44-next-upgrade`).

### 2.2 Git Commit Message Standards
We follow the **Conventional Commits** specification. The format of a commit is:
`type(scope): description` (lowercase, imperative tone, present tense, no period at end).

#### Types
- `feat`: A new feature.
- `fix`: A bug fix.
- `docs`: Documentation changes.
- `style`: Changes that do not affect the meaning of the code (formatting, missing semi-colons).
- `refactor`: A code change that neither fixes a bug nor adds a feature.
- `test`: Adding missing tests or correcting existing tests.
- `chore`: Changes to build systems, tools, or dependencies.

#### Examples
- `feat(auth): integrate supabase oauth login flow`
- `fix(resume): prevent empty skill lists from breaking parser`
- `refactor(db): implement async session context manager`
- `docs(api): update resume submission schema contracts`

---

## 3. Environment Variables Strategy
- **File Distribution**:
  - `.env.example`: Committed template with names only and instruction comments. No active secret keys.
  - `.env.local` / `.env`: Not committed (listed in `.gitignore`). Contains actual local API keys.
- **Frontend Prefixing**:
  - Keys intended for client-side evaluation must be prefixed with `NEXT_PUBLIC_` (e.g., `NEXT_PUBLIC_SUPABASE_URL`).
  - Secure keys (like `SUPABASE_SERVICE_ROLE_KEY`) must not be prefixed to prevent exposure in bundle assets.
- **Backend Configuration**:
  - Environment variables must be loaded via Pydantic's `BaseSettings` class (`app/core/config.py`).
  - Accessing `os.environ` directly in business logic is prohibited; variables must be fetched from the instantiated settings module.

---

## 4. Logging Standards

### 4.1 Log Levels
- **`DEBUG`**: Diagnostic information useful for local development and tracking code execution (e.g., database query parameters, API request inputs).
- **`INFO`**: Confirming standard operation milestones (e.g., server initialization, user login, cache hit ratios).
- **`WARNING`**: Non-blocking issues or unexpected behaviors (e.g., deprecation warnings, API rate limit close-outs, transient failures).
- **`ERROR`**: Blocking errors affecting current request flow (e.g., database connection loss, LLM API timeouts, exception blocks).
- **`CRITICAL`**: Failures affecting the entire application (e.g., complete database unreachable, core disk out of space).

### 4.2 Logging Format (JSON)
In production, logs must be output in structured JSON formats to facilitate processing by cloud log collectors. Every log entry must include:
```json
{
  "timestamp": "2026-07-02T13:54:12Z",
  "level": "ERROR",
  "module": "app.services.resume",
  "request_id": "req-99f2b8-93",
  "message": "AI Resume parsing failed",
  "exception": "APIConnectionError: Connection timed out"
}
```

---

## 5. Error Handling Architecture
- **Fail Fast**: Validate inputs immediately using Pydantic on the backend and zod/TypeScript on the frontend.
- **Global Exception Filter**: Backend utilizes custom middlewares/handlers to catch generic exceptions, translate them into uniform JSON responses, and hide detailed stack traces from end-users.
- **Explicit Error Classes**: Define custom exception classes in the backend (e.g., `DomainException`, `EntityNotFoundException`).
- **Graceful UI Recovery**: Use React Error Boundaries to catch client failures and display recovery views instead of crashing the application page.

---

## 6. Testing Standards
- **Coverage Minimums**:
  - Core Business logic (`services/`): $\ge 85\%$ coverage.
  - Repositories and Data access layer: $\ge 70\%$ coverage using mock databases.
  - Frontend components: $\ge 60\%$ coverage focused on critical user paths.
- **Testing Tools**:
  - **Backend**: Pytest with `pytest-asyncio` and `unittest.mock`.
  - **Frontend**: Vitest / Jest alongside React Testing Library. Playwright for end-to-end user-flow validation.
- **Mocks**: External third-party calls (Gemini/Claude APIs, Stripe integration, Mail providers) must be fully mocked in the test suites.

---

## 7. Documentation Maintenance Rules
- Code modifications modifying endpoints, schemas, or models must be reflected in corresponding specifications (`docs/api/`, `docs/database/`) in the same pull request.
- All public functions in Python must include Google-style docstrings:
  ```python
  def optimize_resume(resume_id: str, job_description: str) -> dict:
      """Tailors a user's resume bullet points to match a target job.

      Args:
          resume_id: Unique identifier for the source resume.
          job_description: Plaintext description of the target opportunity.

      Returns:
          A dictionary containing updated resume elements and match scores.

      Raises:
          EntityNotFoundException: If the resume_id does not exist.
      """
  ```
- Frontend functions must be annotated using standard TSDoc conventions.
