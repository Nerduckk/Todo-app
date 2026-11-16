# Test Plan — Todo App

**Version:** 1.0  
**Date:** 2026-11-16  
**Tester:** Lê Anh Việt  
**Application:** Vue 3 + Node/Express + MySQL Todo app (public clone)  
**Test types:** API, UI E2E, negative/validation, regression

## 1. Objective

Verify the core todo lifecycle and the API contract, then document defects that affect data integrity or API semantics.

## 2. Scope

**In scope**
- Create, read, update, complete, archive/unarchive, soft delete/restore, permanent delete
- Pagination and status filters
- Validation: required title, required expiry date, required page
- UI: list, filter, pagination, detail, create, edit, complete, archive, delete/restore

**Out of scope**
- Authentication/authorization (the app has none)
- Performance/load testing
- Cross-browser matrix (Chromium only in this version)
- Visual regression and accessibility audit (next iteration)

## 3. Environment

| Item | Value |
|---|---|
| Runtime | Node.js 24 |
| API | `http://127.0.0.1:3000/api/v1` |
| UI | `http://127.0.0.1:5173` |
| Database | Ephemeral MySQL 8.0 (`mysql-memory-server`) |
| Browser | Chromium (Playwright) |
| Test data | 15 deterministic rows (12 pending, 1 completed, 1 archived, 1 deleted) |

## 4. Test approach

- **API tests** use Playwright's `request` context and assert status codes, response envelope, validation messages, state transitions, filters, and pagination.
- **UI tests** use role/aria-label selectors and assert user-visible behavior, including the date picker and table actions.
- Each test creates its own records with unique titles and removes them with `DELETE /delete-permanently/:id`.
- One worker, sequential execution, to avoid shared-state races.

## 5. Test matrix

### API

| ID | Area | Priority | Scenario | Expected |
|---|---|---|---|---|
| API-01 | Pagination | P1 | List page 1, size 5 | 200; ≤5 items; metadata present |
| API-02 | Validation | P1 | List without `page` | 400; “Page is required” |
| API-03 | Create | P1 | Valid title + expiry | 200; item appears in list |
| API-04 | Validation | P1 | Create without title | 400; “Title is required” |
| API-05 | Validation | P1 | Create without expiry | 400; “Expires at is required” |
| API-06 | Read | P1 | Get by existing id | 200; correct fields |
| API-07 | Error handling | P2 | Get by unknown id | 404 (current: 400 — BUG-02) |
| API-08 | Update | P1 | Update title/description/status | 200; persisted |
| API-09 | Validation | P1 | Update without title | 400; “Title is required” |
| API-10 | Lifecycle | P1 | Complete todo | status completed; `completed_at` set |
| API-11 | Lifecycle | P2 | Unarchive pending todo | status pending (current: completed — BUG-01) |
| API-12 | Lifecycle | P1 | Soft delete then restore | removed from `all`; present in `deleted`; restored |
| API-13 | Lifecycle | P1 | Permanent delete | 200; subsequent GET fails |
| API-14 | Filters | P1 | pending / completed / archived | only matching status |
| API-15 | Pagination | P2 | Page 1 vs page 2, size 5 | no overlap; total matches |
| API-16 | Smoke | P0 | Health check | 200; metadata returned |

### UI

| ID | Area | Priority | Scenario | Expected |
|---|---|---|---|---|
| UI-01 | List | P1 | Load home | 10 rows; pagination visible |
| UI-02 | Filter | P1 | Select “Hoàn thành” | completed row visible; pending hidden |
| UI-03 | Pagination | P2 | Go to page 2 | page 2 rows visible |
| UI-04 | Detail | P1 | Open detail | title + description match |
| UI-05 | Create | P1 | Add via dialog + date picker | dialog closes; new row visible |
| UI-06 | Edit | P1 | Change title and save | redirect; new title visible |
| UI-07 | Complete | P1 | Click complete | status chip “Hoàn thành” |
| UI-08 | Archive | P2 | Archive then unarchive | leaves home; appears in Archived; leaves Archived |
| UI-09 | Delete | P2 | Soft delete then restore | leaves home; appears in Deleted; restored |

## 6. Defect log

### BUG-01 — Unarchive restores a pending todo as completed

- **Severity:** High
- **Priority:** High
- **Area:** API / lifecycle
- **Steps:**
  1. Create a pending todo.
  2. `PATCH /todos/archive/:id`.
  3. `PATCH /todos/unarchive/:id`.
  4. `GET /todos/get-by-id/:id`.
- **Expected:** `status = pending`
- **Actual:** `status = completed`
- **Root cause:** `unarchiveTodo()` reads `completed_at` from a Promise instead of awaiting the row. `undefined !== null` is true, so the completed branch always runs.
- **Evidence:** `tests/api/todos.spec.ts` → “unarchives a pending todo (known issue: status becomes completed)”.

### BUG-02 — Missing resource returns 400 instead of 404

- **Severity:** Medium
- **Priority:** Medium
- **Area:** API / error handling
- **Steps:**
  1. `GET /todos/get-by-id/99999999`.
- **Expected:** HTTP 404
- **Actual:** HTTP 400 with “Failed to get todo by id…”
- **Root cause:** `NotFoundError` is not imported in `todo.service.js`; the catch block also wraps it in `BadRequestError`.
- **Evidence:** `tests/api/todos.spec.ts` → “returns 400 for an unknown id (known issue: should be 404)”.

### BUG-03 — Detail response omits `is_deleted` / `is_archived`

- **Severity:** Low
- **Priority:** Low
- **Area:** API contract
- **Expected:** Detail response exposes the same state flags as list responses.
- **Actual:** `TodoResponseDto` only exposes id, title, description, status, timestamps.
- **Impact:** Clients cannot determine soft-delete/archive state from the detail endpoint alone; tests use list filters instead.

### BUG-04 — Seed inserts UUID into an auto-increment integer id

- **Severity:** Low
- **Priority:** Low
- **Area:** Developer tooling
- **Expected:** `npx knex seed:run` works from a clean database.
- **Actual:** `db/seeds/todos.js` uses `faker.string.uuid()` for `todos.id`, which is an auto-increment integer.
- **Workaround:** The portfolio uses its own deterministic seed rows.

### BUG-05 — Create returns 200 instead of 201

- **Severity:** Low
- **Priority:** Low
- **Area:** API semantics
- **Expected:** `201 Created` for a successful create.
- **Actual:** `200 OK` via `SuccessResponse` default.

## 7. Exit criteria

- All P0/P1 automated tests pass.
- No open blocker/critical defects.
- Known issues are documented with reproduction steps and evidence.
- Test run is reproducible with `npm test`.
- Results: **25/25 passing** (16 API + 9 UI); 2 functional defects documented.

## 8. Risks and assumptions

- Tests assume the app's hardcoded API port 3000 and Vite port 5173.
- The ephemeral MySQL startup adds ~10–30 seconds on first run.
- The app has no auth, so authorization scenarios are out of scope.
- UI selectors rely on `aria-label` added to icon buttons; behavior is unchanged.
