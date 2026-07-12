# MediBridge Smart Medicine Redistribution – System Improvement Plan

This document outlines a comprehensive, prioritized technical improvement plan for the **MediBridge** platform. These improvements cover architecture, security, database performance, OCR pipeline robustification, frontend user experience, automated testing, and operational readiness.

---

## Executive Summary
MediBridge is a healthcare MVP designed to reduce medicine waste and facilitate the safe redistribution of surplus medicines. To prepare this platform for enterprise or real-world production readiness, several key technical debt items, security vulnerabilities, reliability concerns, and feature enhancements must be resolved.

This plan details concrete technical solutions categorized into six primary pillars:
1. **Backend API Security & Resiliency**
2. **Database Performance, Auditing & Schema Hardening**
3. **Advanced OCR Pre-processing & Parse Accuracy**
4. **Frontend Architecture & UX Polishing**
5. **Testing Strategy & CI/CD Pipelines**
6. **Production & Operational Readiness Checklist**

---

## 1. Backend API Security & Resiliency

### 1.1 Refresh Token Rotation (RTR) & Revocation
*   **Current State**: Refresh tokens are stored in the `refresh_tokens` table. However, there is no automatic rotation (re-issuing a new refresh token whenever an access token is refreshed) or detection of refresh token reuse.
*   **Actionable Solution**:
    *   Implement **Refresh Token Rotation (RTR)**: when `/api/auth/refresh` is called, revoke the old refresh token and return a new pair of access and refresh tokens.
    *   If a revoked refresh token is presented, trigger an automatic security alarm and revoke all active refresh tokens for that user ID immediately (preventing potential session hijackers).

### 1.2 Rate Limiting & Denial of Service (DoS) Protection
*   **Current State**: Basic rate-limiting is used, but it's in-memory, which doesn't scale across multiple instances/containers and can cause high memory usage under heavy load.
*   **Actionable Solution**:
    *   Transition `express-rate-limit` to use a **Redis-backed store** (`rate-limit-redis`) to ensure distributed rate limiting.
    *   Apply stricter thresholds specifically on auth endpoints:
        *   `/api/auth/login` & `/api/auth/register`: Max 5 attempts per 15 minutes per IP.
        *   `/api/medicines/upload` (File upload / OCR processing): Max 10 uploads per hour per user/IP.

### 1.3 CORS and HTTP Security Headers (Helmet)
*   **Current State**: Helmet and CORS middleware are configured, but require production hardening.
*   **Actionable Solution**:
    *   Restrict CORS `origin` in production to the specific domain of the Next.js frontend, avoiding wildcard `*` origins.
    *   Configure `Helmet` CSP (Content Security Policy) specifically to allow images from the configured Firebase storage bucket domain and GCP OCR endpoints.

---

## 2. Database Performance, Auditing & Schema Hardening

### 2.1 Soft Deletes for Medicines and Requests
*   **Current State**: Deleting or rejecting records can lead to orphaned records or loss of audit/historical context.
*   **Actionable Solution**:
    *   Add a `deleted_at TIMESTAMPTZ` column to the `medicines` and `donation_requests` tables.
    *   Modify queries to filter out soft-deleted records (`WHERE deleted_at IS NULL`) by default, preserving historical database integrity for compliance reporting.

### 2.2 Comprehensive Foreign Key Indexing
*   **Current State**: Essential foreign keys exist, but some common join fields and queries lack index coverage.
*   **Actionable Solution**:
    *   Ensure compound indexes exist for frequent admin queries:
        ```sql
        CREATE INDEX IF NOT EXISTS idx_medicines_status_expiry
        ON medicines(status, expiry_date);
        ```
    *   Index the `created_at` field on `audit_logs` and `medicines` to optimize dashboard analytics queries.

### 2.3 Hardened Postgres Constraints & Audit Trail Integrity
*   **Current State**: Quantity can be updated arbitrarily without double-entry validation.
*   **Actionable Solution**:
    *   Add a check constraint on `quantity`: `CHECK (quantity >= 0)`.
    *   Enforce a DB-level trigger on `audit_logs` to ensure audit entries cannot be updated or deleted (`BEFORE UPDATE OR DELETE ON audit_logs ROLLBACK`).

---

## 3. Advanced OCR Pre-processing & Parse Accuracy

### 3.1 Advanced Image Pre-processing
*   **Current State**: Tesseract/GCP Vision processes raw images directly. This can result in poor parsing if shadows, low contrast, or skewed angles are present.
*   **Actionable Solution**:
    *   Enhance `imagePreprocess.js` utilizing `sharp` to execute three sequential operations before forwarding to Google Cloud Vision or Tesseract:
        1.  **Grayscaling**: Reduce noise from color channels.
        2.  **Binarization (Thresholding)**: Convert to sharp black-and-white to amplify character edges.
        3.  **Resizing / Deskewing**: Scale up low-resolution labels and correct slight orientation angles.

### 3.2 Fuzzy Name Matching Engine
*   **Current State**: Medicine name extraction is reliant on regex, resulting in missed matches if OCR reads "PARACETAM0L" (zero instead of O) or "ASPIRlN" (lowercase L instead of uppercase I).
*   **Actionable Solution**:
    *   Integrate fuzzy string matching (e.g. Levenshtein Distance or Jaro-Winkler via `fuse.js` or `natural` library).
    *   Cross-reference extracted OCR name suggestions against an authoritative open-source drug database (e.g., FDA drug list, RxNorm API, or a local Postgres lookup table of standard formulations) to suggest the corrected medicine name with a confidence score.
    *   Example implementation pattern:
        ```javascript
        const levenshtein = require('fast-levenshtein');
        function findBestDrugMatch(extractedName, drugDatabase) {
          let bestMatch = null;
          let minDistance = 3; // Max tolerance threshold
          for (const drug of drugDatabase) {
            const dist = levenshtein.get(extractedName.toLowerCase(), drug.toLowerCase());
            if (dist < minDistance) {
              minDistance = dist;
              bestMatch = drug;
            }
          }
          return { bestMatch, distance: minDistance };
        }
        ```

### 3.3 Low-Confidence Handlers & Smart Fallbacks
*   **Current State**: Standard fallbacks default back to manual input without highlighting exact error areas.
*   **Actionable Solution**:
    *   If the OCR confidence falls below 70%, automatically flag the record with a status of `low_confidence_ocr`.
    *   In the frontend pharmacist queue, visually highlight the low-confidence fields in red or yellow, drawing immediate human attention to the specific value that needs correction.

---

## 4. Frontend Architecture & UX Polishing

### 4.1 Global State Management & API Cache Optimization
*   **Current State**: The frontend uses standard local component state and Prop Drilling. This leads to duplicate API requests.
*   **Actionable Solution**:
    *   Adopt **TanStack Query (React Query)** or **SWR** for frontend data fetching.
    *   This provides instant caching of medicine requests, automatic revalidation, and loading states out of the box.

### 4.2 Comprehensive Accessibility & Responsive Layouts
*   **Current State**: Custom components lack consistent ARIA labels and screen-reader accessibility, and tables/charts overflow on mobile views.
*   **Actionable Solution**:
    *   Ensure all ShadCN primitives are integrated with full Radix UI accessibility features.
    *   Introduce horizontal scroll containers for large dashboard tables on mobile viewport sizes (`overflow-x-auto`).
    *   Include high-contrast mode variations for visually impaired healthcare operators.

---

## 5. Testing Strategy & CI/CD Pipelines

### 5.1 Playwright E2E Integration Testing
*   **Current State**: Tests are currently limited to basic Jest unit and mock integration files. There are no automated tests checking user journeys.
*   **Actionable Solution**:
    *   Configure **Playwright** inside the `frontend` directory.
    *   Author automated test scripts for the three primary user workflows:
        1.  **Donor Journey**: Login → Drag-and-drop Upload Medicine → Confirm Suggested Details.
        2.  **Pharmacist Journey**: Login → View Pending Queue → Verify Details → Approve/Reject.
        3.  **Receiver Journey**: Login → Search Marketplace → Filter Expiring Items → Issue Medicine Request.

### 5.2 Mock Service Worker (MSW) for API Mocking
*   **Current State**: Frontend depends on static mock data files (`frontend/src/services/mock-data.ts`) when decoupled from the backend.
*   **Actionable Solution**:
    *   Set up **MSW (Mock Service Worker)** to mock REST endpoints directly in the browser during local development or E2E tests, allowing seamless offline frontend development.

---

## 6. Production & Operational Readiness Checklist

### 6.1 Winston / Morgan Structured JSON Logging
*   **Current State**: Simple `console.log` is used throughout the API. This makes tracking errors in production log aggregation suites extremely difficult.
*   **Actionable Solution**:
    *   Integrate `winston` for logging. Produce standardized JSON outputs containing `timestamp`, `level`, `requestId`, `userId`, and `message`.
    *   Pipe HTTP requests through `morgan` configured to output JSON formatted logs in production.

### 6.2 Health & Dependency Monitoring
*   **Current State**: Simple check `/api/health` exists but does not test real-time connectivity of database or OCR API keys.
*   **Actionable Solution**:
    *   Enhance the health-check controller to verify database connection latency, check write/read permissions, and confirm external services (Firebase and GCP Vision) are reachable.

### 6.3 Deployment & Environment Variables Hardening
*   **Security Priority**: Use this list to review all deployment target variables (e.g. Render, Vercel, Neon):

| Environment Variable | Description | Recommended Production Setting |
|---|---|---|
| `NODE_ENV` | Mode of operation | `production` |
| `DATABASE_URL` | Neon PG string | Must have `?sslmode=require` |
| `JWT_SECRET` | Access token signer | Multi-character cryptographically secure string |
| `JWT_REFRESH_SECRET` | Refresh token signer | Distinct multi-character secure string |
| `CORS_ORIGIN` | Authorized origins | Restricted to production frontend domain |
| `DEV_OCR_FALLBACK` | Fallback flag | Set to `false` in production |
| `OCR_ENGINE` | Active OCR scanner | Set to `google_vision` |

---

## Prioritized Implementation Roadmap

1.  **Phase 1 (Security & Core Integrity)**: Refresh Token Rotation, Helmet, CORS, and DB trigger protections.
2.  **Phase 2 (Accuracy & Intelligence)**: `sharp` image pre-processing, Jaro-Winkler/Levenshtein fuzzy matching, drug database lookup integrations.
3.  **Phase 3 (UX & Scale)**: TanStack Query, Radix accessibility, responsive overflows.
4.  **Phase 4 (Validation & Coverage)**: E2E Playwright tests and Winston structured logs.
