# Changelog - Offerly

All notable changes to the **Offerly** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.3.0] - 2026-07-08

This release covers the complete implementation of the Resume Management & Review Editor pipeline (Sprint 3 Modules 3.1 to 3.5), including dynamic editor routing page, Zod schema-based validation layers, swappable AI providers and factory adapters, and runtime stability enhancements.

### Added
- **Dynamic Resume Editor**: Dedicated routing page `/resumes/[id]` loaded with tabular dynamic subsections (`PersonalInfo`, `Summary`, `Skills`, `Education`, `Experience`, `Projects`, `Certifications`, `Languages`, `Links`).
- **Inline Validation & Normalization**: Form validators checking email syntaxes and URL formats. Auto-normalizes URLs lacking protocols to `https://` and drops case-insensitive duplicate skills.
- **AI Provider Layer**: Abstract swappable `BaseLLMProvider` interface with specialized API adapters for Google Gemini and Anthropic Claude APIs.
- **Dynamic Prompt Compiler**: Created `PromptCompiler` tool loading txt templates (`resume-parsing.txt`, `resume-tailoring.txt`, `ats-scoring.txt`) and compiling variables dynamically.
- **Route Guarding**: Deep dirty verification checking stringified differences against raw state, backed by dialog confirmations.

### Changed
- **Database RLS Policies**: Recreated active resumes update policies to enforce `auth.uid() = user_id` without checks on `deleted_at`, enabling soft-deletes.

### Fixed
- **PDF parser crash**: Refactored `utils/parser.ts` to instantiate the class-based constructor of `pdf-parse` v2.4.5.
- **Next.js Hydration mismatch**: Added client-side mounting gates to `ResumeList` view.

## [0.1.0-alpha.1] - 2026-07-02

This release establishes the core repository foundations, system documents, coding guidelines, and agile sprint roadmap structures for the Offerly platform.

### Added
- **System Documentation**:
  - `MASTER_PLAN.md`: Establishes the product vision, features scope, design goals, folder organization maps, and tech stack specification.
  - `SRS.md`: Outlines user personas, detailed functional requirements, and strict non-functional constraints (performance, security, and scalability metrics).
  - `ENGINEERING_STANDARDS.md`: Defines folder/file naming rules, Git branch/commit conventions (Conventional Commits), environment strategies, logging JSON formats, and testing thresholds.
  - `CODING_GUIDELINES.md`: Sets coding parameters for Next.js 15 (React 19 Server/Client boundaries), strict TypeScript compile configurations, async Python/FastAPI structures, and SOLID implementation guides.
  - `API_CONVENTIONS.md`: Sets standards for REST endpoint paths, API versioning, error structures, and parameters for pagination, sorting, and filtering.
  - `CHANGELOG.md`: Initialized changelog configuration to track code lifecycle additions and modifications.
- **Repository Metadata**:
  - Initialized markdown task checklists to monitor initialization progress.
