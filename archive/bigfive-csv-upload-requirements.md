# Big Five CSV Upload, Import, and Results Display – Requirements

## 1. Overview

Enable users to upload their Big Five personality assessment results via CSV files. The system must accurately parse, validate, and store these results in the database, associating them with the authenticated user's unique ID. Users must be able to view their scores, clearly organized by category (main traits) and subcategory (facets), within the application UI.

---

## 2. User Stories

### 2.1. As a user:
- I want to upload my Big Five assessment results as CSV files.
- I want my results to be securely stored and linked to my user account.
- I want to see my scores, organized by main categories and subcategories, in a clear, accessible UI.
- I want to be notified if my upload fails or the file format is invalid.

### 2.2. As an admin/developer:
- I want to ensure only valid, well-formed CSVs are accepted.
- I want to prevent duplicate or conflicting uploads for the same test/user.
- I want to log and handle errors gracefully.

---

## 3. Functional Requirements

### 3.1. File Upload (Frontend)
- Provide a UI for users to select and upload one or more CSV files.
- Allow users to specify which test/assessment the upload corresponds to (if not auto-detected).
- Display upload progress and clear success/error messages.

### 3.2. File Parsing & Validation (Backend)
- Accept multipart/form-data POST requests with CSV files and user ID (from session/JWT).
- Parse CSVs, distinguishing between main category and subcategory files by content.
- Validate:
  - Required columns: `category`, `You`
  - All scores are integers in [0, 100]
  - No duplicate categories per user/test
- Reject files with missing/invalid data, returning clear error messages.

### 3.3. Database Storage
- Store each result row as a record in the `bigfive_results` table.
- Fields: id (UUID), userId (from session/JWT), userTestId, category, score, resultType ('category' or 'subcategory'), timestamp.
- Enforce uniqueness on (userId, userTestId, category, resultType).

### 3.4. API Endpoints
- **POST /api/bigfiveResults/import**: Accepts CSV(s), parses, validates, and stores results.
- **GET /api/bigfiveResults?testId=...**: Returns all results for a user/test, grouped by resultType.
- **GET /api/bigfiveResults/userTests**: Lists all test IDs for the authenticated user.

### 3.5. Results Display (Frontend)
- Show a list of the user's uploaded test IDs.
- For each test, display:
  - Main categories (traits) and their scores (table or chart)
  - Subcategories (facets) and their scores (table or chart)
- Clearly indicate if no results are available.

### 3.6. Security & Privacy
- Only allow authenticated users to upload/view their own results.
- Validate user identity via JWT/session on all API endpoints.
- Sanitize all file and input data to prevent injection attacks.

### 3.7. Error Handling & UX
- Show clear, actionable error messages for upload/parse/validation failures.
- Prevent duplicate uploads for the same test/user unless explicitly allowed.
- Log all errors for audit and debugging.

### 3.8. Extensibility
- Design for future support of additional assessments (e.g., 16PF, Holland Code).
- Allow for additional metadata (e.g., test date, source).

---

## 4. Non-Functional Requirements

- **Performance:** Import and display should be responsive for typical file sizes (<100 rows).
- **Accessibility:** UI must be accessible (WCAG 2.1 AA).
- **Maintainability:** Code should be modular, well-documented, and covered by tests.
- **Scalability:** Support multiple concurrent uploads and large user bases.

---

## 5. Implementation Review & Recommendations

### 5.1. Current Implementation

- **Backend:** API routes for import and retrieval exist; results are stored in SQLite via TypeORM.
- **Frontend:** Results are displayed by testId, grouped by category/subcategory.
- **Gaps:**
  - No user authentication or userId linkage in results (only userTestId).
  - No frontend file upload UI for CSVs.
  - Error handling and validation are basic; no user feedback for upload errors.
  - TypeORM warnings and critical dependencies in logs.
  - No uniqueness enforcement on (userId, userTestId, category, resultType).
  - No timestamp or metadata on results.

### 5.2. Recommendations

- **User Authentication:** Integrate authentication and link results to userId (from session/JWT).
- **File Upload UI:** Build a user-facing upload form for CSVs, with progress and error feedback.
- **Validation:** Add strict backend validation for CSV structure and data.
- **Error Handling:** Improve error messages and frontend feedback.
- **Database Schema:** Add userId and timestamp fields; enforce uniqueness constraints.
- **Security:** Ensure all endpoints require authentication and sanitize inputs.
- **Testing:** Add unit/integration tests for import, validation, and display logic.
- **TypeORM Warnings:** Investigate and resolve critical dependency warnings in build logs.

---

## 6. Acceptance Criteria

- [ ] Users can upload CSVs and see their results, organized by category/subcategory.
- [ ] Results are linked to the authenticated user and test ID.
- [ ] Invalid files are rejected with clear error messages.
- [ ] Only authenticated users can access their own results.
- [ ] All requirements above are met and verified by tests.

---

## 7. References

- [Big Five Model – Wikipedia](https://en.wikipedia.org/wiki/Big_Five_personality_traits)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/api-routes)
- [TypeORM Docs](https://typeorm.io/)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/standards-guidelines/wcag/)