# Coding Guidelines - Offerly

This document defines the language-specific formatting instructions, code composition laws, import parameters, and architectural alignments required of developers working on the Offerly codebase.

---

## 1. Clean Architecture & SOLID Principles

All developer submissions must satisfy the core criteria of Clean Architecture and SOLID design guidelines.

### 1.1 Single Responsibility Principle (SRP)
- **Functions & Classes**: Each module, class, and method must have one, and only one, reason to change.
- **Example**: Do not write a method that simultaneously parses raw text, formats output, and updates a database row. Split this into a parser utility, a formatter utility, and a repository update method.

### 1.2 Open/Closed Principle (OCP)
- Structures must be open for extension but closed for modification.
- **Example**: In our AI module, to introduce a new LLM provider, create a new subclass implementing `BaseLLMProvider` instead of modifying the existing providers or core services.

### 1.3 Liskov Substitution Principle (LSP)
- Derived types must be substituteable for their base types without altering system correctness.
- All LLM adapters must behave identically to the interface definitions, returning parsed schemas or throws expected error wrappers.

### 1.4 Interface Segregation Principle (ISP)
- Avoid fat interfaces. Clients must not be forced to depend on methods they do not use.
- Split multi-purpose services into micro-services/interfaces.

### 1.5 Dependency Inversion Principle (DIP)
- High-level modules must not depend on low-level modules; both must depend on abstractions.
- Business service classes must only import interfaces (`BaseUserRepository`) rather than concrete database classes (`SQLAlchemyUserRepository`).

---

## 2. Frontend Guidelines (Next.js & TypeScript)

### 2.1 React & Next.js 15 App Router
- **Server Components by Default**: All page routes and layouts are Server Components (RSC) by default. Use RSCs to fetch data, perform static rendering, and pass structured values to downstream components.
- **Client Boundary (`use client`)**: Declare the `"use client"` directive at the top of a file *only* when the component:
  - Accesses browser APIs (e.g., `window`, `localStorage`).
  - Utilizes interactivity hooks (e.g., `useState`, `useEffect`, `useReducer`).
  - Implements motion triggers (e.g., Framer Motion).
- **Loading UI**: Use `loading.tsx` to handle loading layouts automatically rather than implementing local tracking states for baseline page loads.

### 2.2 TypeScript strict configurations
- **`noImplicitAny`**: Must be enabled. Do not use the `any` keyword. Use `unknown` if the type is unknown, or declare union types.
- **Interfaces vs Types**:
  - Use `interface` to define public contracts, API payloads, and component props (allows extensions).
  - Use `type` to define unions, intersections, and function signatures.
- **Strict Null Checks**: Always validate if objects are defined before accessing properties. Use optional chaining (`?.`) or explicit logical guards.

### 2.3 Tailwind CSS styling
- Avoid inline styles.
- Maintain readable classes. If class lists become excessively long, use utility classes or separate component files.
- Color palettes must use custom variables defined in `globals.css` (e.g., `bg-primary`, `text-muted-foreground`) to maintain theme compliance automatically.

---

## 3. Backend Guidelines (FastAPI & Python)

### 3.1 Python Style Compliance (PEP 8)
- All Python code must comply with PEP 8.
- Line length limit: **88 characters** (aligned with the Black formatter standard).
- Naming specifications:
  - Class names: `PascalCase`.
  - Functions, methods, and variables: `snake_case`.
  - Constants: `UPPER_CASE_SNAKE_CASE`.

### 3.2 Asynchronous Python (`async/await`)
- Any operation performing file I/O, database queries, or external network requests (e.g., calling Gemini API) must be declared as an asynchronous function using `async def`.
- Do not use blocking libraries (like standard `requests`) inside async contexts; use `httpx` or alternative async network clients instead.

### 3.3 Type Hinting
- Every function parameter and return value must contain explicit type annotations.
- Import annotations from `typing` or use standard types (e.g., `list[str]`, `dict[str, Any]`).
- Run `mypy` before commit checkouts to verify type alignments.

### 3.4 Dependency Injection ready (FastAPI)
- Retrieve configuration settings, DB connections, repositories, and services using FastAPI's dependency injection system `Depends`.
- Do not instantiate services/repositories inline in router endpoints.
- Example:
  ```python
  @router.post("/optimize", response_model=ResumeResponse)
  async def optimize_resume_endpoint(
      payload: OptimizeRequest,
      resume_service: ResumeService = Depends(get_resume_service)
  ):
      return await resume_service.optimize(payload)
  ```

---

## 4. Code Formatting & Tooling

### 4.1 Frontend Tooling
- **Formatter**: Prettier. Must run automatically on save.
- **Linter**: ESLint with next-recommended configurations.
- **Import Ordering**: Group and order imports as follows:
  1. Node built-in modules (e.g., `path`, `fs`).
  2. External framework imports (e.g., `react`, `next`).
  3. Third-party packages (e.g., `framer-motion`, `lucide-react`).
  4. Alias imports mapping to local project components (e.g., `@/components/ui/button`).
  5. Local relative imports (e.g., `./utils`).

### 4.2 Backend Tooling
- **Formatter**: Black.
- **Linter**: Ruff (for rapid code checking and import sorting).
- **Import Sorting**: Organize imports in three groups separated by a blank line:
  1. Standard library imports.
  2. Third-party packages (e.g., `fastapi`, `pydantic`, `sqlalchemy`).
  3. Local application imports (e.g., `app.core.config`, `app.models`).

---

## 5. Comments & Documentation Philosophy

- **Document the "Why", not the "What"**: Code should explain *what* it is doing through clear naming. Use comments to explain *why* a specific approach was chosen (e.g., design workarounds, math formulas).
- **Clean Code > Comments**: Clean up refactoring code instead of writing a comment explaining how a messy block works.
- **TODOs**: All TODO comments must include an owner and reference an issue ID: `# TODO(OFF-102): Implement error fallback for Gemini parsing timeouts`.
