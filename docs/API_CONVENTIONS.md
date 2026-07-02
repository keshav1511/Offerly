# API Conventions - Offerly

This document defines the REST API standards, JSON structures, error formats, validation rules, authentication headers, and paging conventions for all communication between the Offerly frontend and backend systems.

---

## 1. REST Endpoint Conventions

### 1.1 URI Path Design
- Endpoint paths must represent resources as plural nouns (e.g., `/api/v1/resumes`, `/api/v1/jobs`).
- Actions must be mapped to HTTP verbs rather than declared in URL paths.
- Nested resources represent hierarchical relationships:
  - `GET /api/v1/users/{user_id}/applications` fetches applications associated with a specific user.
  - `POST /api/v1/resumes/{resume_id}/optimizations` triggers optimization for a specific resume.

### 1.2 HTTP Verbs mapping
- **`GET`**: Retrieve a resource or catalog. Must be idempotent and safe.
- **`POST`**: Create a new resource or trigger an action (e.g., parsing a document).
- **`PUT`**: Replace an existing resource in its entirety.
- **`PATCH`**: Apply partial modifications to a resource.
- **`DELETE`**: Remove a resource.

---

## 2. API Versioning Strategy
- Version routing is defined directly in the URL prefix using the major version code:
  `https://api.offerly.com/api/v1/...`
- Breaking changes require incrementing the version suffix to `/v2/`. Non-breaking changes (new optional fields, new endpoints) must be integrated into the existing major version route.

---

## 3. Authentication & Header Specs
- Authenticated requests must include the JWT in the standard HTTP header:
  `Authorization: Bearer <jwt_token>`
- Response payloads containing user configurations must return standard cache protection headers:
  `Cache-Control: no-store, max-age=0`

---

## 4. Response Payload Conventions

### 4.1 Success Response Wrapper (Single Resource)
```json
{
  "status": "success",
  "data": {
    "id": "res-981-ab",
    "title": "Senior Software Architect Resume",
    "created_at": "2026-07-02T13:54:33Z"
  }
}
```

### 4.2 Success Response Wrapper (Catalog / Multiple Resources)
All catalog responses must include pagination metadata in a `pagination` block:
```json
{
  "status": "success",
  "data": [
    {
      "id": "job-101",
      "company": "Offerly Tech",
      "title": "Backend Engineer"
    }
  ],
  "pagination": {
    "total_records": 1250,
    "limit": 10,
    "offset": 0,
    "has_next": true,
    "has_previous": false
  }
}
```

---

## 5. Pagination, Filtering & Sorting

### 5.1 Pagination
- We support **Offset-based Pagination** for standard lists and **Cursor-based Pagination** for high-velocity feeds (like real-time jobs boards).
- Query keys:
  - `limit`: Number of items to return (default: `20`, maximum: `100`).
  - `offset`: Offset starting point (for offset-based).
  - `cursor`: Unique string pointer (for cursor-based).

### 5.2 Filtering
- Filter query keys must match model properties using logical filters:
  - `GET /api/v1/jobs?location=Remote&experience_level=Senior`

### 5.3 Sorting
- Sorting criteria are specified in the `sort` query parameter using the format: `field:direction` (e.g., `asc` or `desc`).
- Support multiple sort columns using comma separation:
  - `GET /api/v1/jobs?sort=created_at:desc,salary:desc`

---

## 6. HTTP Status Codes

- **`200 OK`**: Successful read or update execution.
- **`201 Created`**: Successful creation of a resource.
- **`204 No Content`**: Successful execution of delete / blank action.
- **`400 Bad Request`**: Request failed due to invalid body context (non-validation related).
- **`401 Unauthorized`**: Token missing, expired, or invalid signature.
- **`403 Forbidden`**: Valid token, but user does not have permission to access the target resource (RLS check failed).
- **`404 Not Found`**: Target resource does not exist.
- **`422 Unprocessable Entity`**: Input data validation failed (e.g., missing required fields, wrong formats).
- **`429 Too Many Requests`**: Rate limits exceeded.
- **`500 Internal Server Error`**: Unexpected system failure on the server.
- **`503 Service Unavailable`**: Database or critical third-party service is offline.

---

## 7. Standard Error Response Structure
All error payloads must follow a unified structure to make frontend parsing predictable.

```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "One or more input values are invalid.",
    "details": [
      {
        "field": "email",
        "issue": "Invalid email address format."
      }
    ],
    "timestamp": "2026-07-02T13:54:33Z"
  }
}
```

### Standard Error Codes
- `RESOURCE_NOT_FOUND`: Specified ID does not exist.
- `UNAUTHORIZED`: Authentication missing or failed.
- `FORBIDDEN`: User lacks access rights.
- `VALIDATION_FAILED`: Request validation errors.
- `RATE_LIMIT_EXCEEDED`: API throttling active.
- `EXTERNAL_SERVICE_FAILURE`: LLM/Supabase APIs failed or returned errors.
- `INTERNAL_SERVER_ERROR`: Generic system error on the backend.
