# Software Requirements Specification (SRS) - Offerly

This document defines the complete product specifications, user personas, system boundaries, and architectural requirements for **Offerly**, a production-grade AI Career Copilot.

---

## 1. Introduction

### 1.1 Purpose
This document provides a detailed specification of both the functional and non-functional requirements for the Offerly platform. It serves as the baseline agreement between stakeholders, developers, designers, and testers.

### 1.2 Scope
Offerly is an intelligent SaaS platform designed to enhance the professional development and job-hunting processes of job seekers. The core platform ingests documents, matches them semantically against real-time job listings, compiles target-focused resume alterations, and maintains a structured application lifecycle dashboard.

### 1.3 Definitions & Abbreviations
- **ATS**: Applicant Tracking System. System used by recruiters to filter resumes based on keyword matching and layout standards.
- **LLM**: Large Language Model. The cognitive processing unit of our matching and text generation services (Gemini/Claude).
- **JWT**: JSON Web Token. Standardized token structure used to secure transactions between frontend client and backend APIs.
- **RLS**: Row-Level Security. Database security model enforcing user-boundary protection directly at the database engine level.
- **Cosine Similarity**: Mathematical metric measuring similarity between two vector projections (used for semantic matching).

---

## 2. User Roles & Personas

- **Job Seeker (Candidate)**: The primary consumer of the system. Can create profiles, upload resumes, trigger optimizations, search job listings, view compatibility scores, and update application tracking boards.
- **System Administrator (Admin)**: System staff managing global configurations, monitoring server health, reviewing platform usage telemetry, and modifying matching constraints.
- **Recruiter (Future Persona)**: Employers search-screening suitable candidates based on anonymous profile scores and directly matching opportunities with candidate preferences.

---

## 3. Functional Requirements

### 3.1 Authentication & Profile Management
- **FR-AUTH-01**: The system must support registration and authentication via Email/Password and OAuth Providers (Google, GitHub) using Supabase Auth.
- **FR-AUTH-02**: Authentication tokens (JWTs) must be included in the header of all backend requests and validated on each transaction.
- **FR-USER-01**: Users must be able to complete a onboarding profile detailing their target roles, experience level, salary range, and target locations.

### 3.2 Resume Parser & Storage
- **FR-RES-01**: Users must be able to upload resume documents in PDF, DOCX, or Markdown formats.
- **FR-RES-02**: The AI parsing engine must extract structural blocks (Contact Details, Work Experience, Projects, Skills, and Education) and convert them into standardized JSON formats.
- **FR-RES-03**: The parsed resume data must be editable in the frontend app interface and version-saved in the database.

### 3.3 AI-Powered Resume Builder & Tailoring
- **FR-AI-01**: The system must support resume optimization relative to a target job description.
- **FR-AI-02**: The system must compile a comparison matrix showing skill gaps, keyword recommendations, and language edits.
- **FR-AI-03**: Users must be able to generate customized bullet points for specific jobs that align with target requirements while maintaining factual integrity.
- **FR-AI-04**: The system must support export of tailored resumes as clean Markdown, JSON, or PDF formats.

### 3.4 Job Discovery & Semantic Matching
- **FR-JOB-01**: The system must aggregate and search-index job opportunities, filtering by location, pay, experience level, and metadata tags.
- **FR-JOB-02**: The backend matching service must parse the job listing and generate high-dimensional text embeddings.
- **FR-JOB-03**: The system must compute cosine similarity scores between candidate profiles and job embeddings, translating scores into a percentage matching rate (0-100%).
- **FR-JOB-04**: The system must provide a breakdown of the match score: critical skills found, missing skills, and structural mismatch indicators.

### 3.5 Kanban Application Tracker
- **FR-TRK-01**: The system must generate an application tracking board with stages: `Bookmarked`, `Applied`, `Interviewing`, `Offer Received`, `Rejected`, and `Archived`.
- **FR-TRK-02**: Users must be able to drag-and-drop job application cards between lifecycle stages.
- **FR-TRK-03**: Users must be able to add custom notes, salary packages, interview locations, date schedules, and contact lists to application cards.

---

## 4. Non-Functional Requirements

### 4.1 Performance & Latency
- **NFR-PERF-01**: The API endpoint latency (excluding LLM generation calls) must not exceed 200ms for standard CRUD operations under average load.
- **NFR-PERF-02**: The frontend application must achieve a Google Lighthouse performance score of $\ge 90$ on desktop interfaces.
- **NFR-PERF-03**: Long-running AI operations (such as document ingestion and full resume tailoring) must be handled asynchronously or return streamed responses.

### 4.2 Security & Data Protection
- **NFR-SEC-01**: All data transmissions between client and server must be encrypted via TLS 1.3.
- **NFR-SEC-02**: Access to PostgreSQL tables must be protected using Row-Level Security (RLS) policies, verifying the user's UUID from the JWT.
- **NFR-SEC-03**: Sensitive variables (API credentials, secret keys) must be loaded dynamically from environment files and never checked into source control.
- **NFR-SEC-04**: Uploaded documents must be scanned for malicious payloads and stored securely inside isolated bucket paths.

### 4.3 Scalability & Reliability
- **NFR-SCAL-01**: The backend services must be stateless to allow dynamic scaling across multiple container instances (GCP Cloud Run / AWS ECS).
- **NFR-SCAL-02**: Database connections must be managed using robust connection pooling mechanisms to support high concurrency.
- **NFR-SCAL-03**: Vector storage and similarity computations must support indexing (e.g., pgvector HNSW index) to maintain search performance under large catalogs.

### 4.4 Usability & Accessibility
- **NFR-USE-01**: The UI must be fully responsive, supporting devices from 360px mobile screens to large desktop monitors.
- **NFR-USE-02**: The user interface must align with WCAG 2.1 AA accessibility guidelines, ensuring readable contrasts, keyboard-navigable dialogs, and screen-reader support.

---

## 5. System Constraints & Boundaries
- **API Token Limits**: The system is subject to the rate limits and cost structures of external LLM APIs (Gemini/Claude). Optimization strategies must minimize LLM call loops.
- **File Upload Limits**: Ingested resumes must be restricted to a maximum size of 5MB per upload.
- **State Limits**: The system does not maintain persistent state in server memory; all persistence relies on Supabase PostgreSQL.

---

## 6. Future Enhancements
- **Auto-Apply Automations**: Browser extension integrations mapping parsed JSON fields directly to external application forms.
- **Interview Simulation**: Dynamic audio/visual preparation sessions reviewing candidate answers against job requirements.
- **Direct Employer Pipeline**: Letting recruitment teams purchase access to high-scoring candidates matching anonymous profiles.
