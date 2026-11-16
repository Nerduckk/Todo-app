# Todo App — Playwright E2E/API Portfolio

A self-contained Playwright + TypeScript test suite for a Vue 3 + Node/Express + MySQL Todo app.

**25 tests: 16 API + 9 UI — all passing.**

The suite is designed to be runnable from a clean checkout with one command. It starts an ephemeral MySQL database, runs migrations, seeds deterministic data, boots the backend and frontend, runs Playwright, and cleans up.

## What it covers

### API (16 tests)

- Pagination metadata and page math
- Missing `page` validation
- Create todo (happy path) and list verification
- Create validation: missing title, missing `expires_at`
- Get by id
- Unknown id (documents a known 400-vs-404 defect)
- Update todo and update validation
- Complete todo
- Archive / unarchive (documents the unarchive status defect)
- Soft delete / restore
- Permanent delete
- Status filters: pending, completed, archived
- Pagination without overlapping pages

### UI (9 tests)

- Seeded list renders with 10 rows and pagination
- Filter by completed status
- Paginate to page 2
- Open todo detail
- Create todo from the add dialog (including date picker)
- Edit todo title
- Complete todo from the table
- Archive / unarchive via the archived page
- Soft delete / restore via the deleted page

## Quick start

```bash
cd data/job-search/portfolio/todo-app/e2e
npm install
npx playwright install chromium
npm test
```

> First run downloads an ephemeral MySQL 8.0 binary (via `mysql-memory-server`) and the Playwright Chromium build. Later runs reuse the cache.

Run only one layer:

```bash
npm run test:api
npm run test:ui
```

Open the HTML report:

```bash
npm run report
```

## How the runner works

`scripts/run-e2e.mjs`:

1. Starts an ephemeral MySQL instance on a random port.
2. Runs the backend's Knex migration.
3. Seeds 15 deterministic rows (12 pending, 1 completed, 1 archived, 1 deleted).
4. Starts the Express API on `http://127.0.0.1:3000`.
5. Starts the Vue/Vite app on `http://127.0.0.1:5173`.
6. Runs `playwright test` with `BASE_URL` and `API_URL`.
7. Kills the servers and stops MySQL.

No Docker or local MySQL installation is required.

## Test data

| Title | Status | Flags |
|---|---|---|
| Pending task 01–12 | pending | visible in `all` / `pending` |
| Completed task | completed | `completed_at` set |
| Archived task | archived | `is_archived = 1` |
| Deleted task | pending | `is_deleted = 1` |

API tests create their own records with unique titles and clean them up with `DELETE /delete-permanently/:id`. UI tests do the same through the API helper.

## Defects found

1. **Unarchive restores pending todos as completed.**
   - `Todo.unarchiveTodo()` calls `this.getTodoById(id)` without `await`.
   - `foundTodo.completed_at` is `undefined`, and `undefined !== null` is true, so the completed branch always runs.
   - Test: `unarchives a pending todo (known issue: status becomes completed)`.

2. **Missing resources return 400 instead of 404.**
   - `getTodoByIdAsync()` throws `NotFoundError` without importing it, then the catch block wraps the error in `BadRequestError`.
   - Test: `returns 400 for an unknown id (known issue: should be 404)`.

3. **Detail response omits `is_deleted` / `is_archived`.**
   - `TodoResponseDto` does not expose these fields, so tests verify state through the list endpoints instead.

4. **Seed file uses UUID strings for an auto-increment integer id.**
   - The repo's `db/seeds/todos.js` inserts `faker.string.uuid()` into `todos.id`.
   - The portfolio uses its own deterministic seed rows instead.

5. **Create returns HTTP 200 instead of 201.**
   - Current API contract returns `SuccessResponse` with the default 200 status.

These are documented as **known issues** in the tests where relevant; the suite deliberately asserts current behavior so it stays green while the defects are visible.

## Testability change in the app

The only app change is adding `aria-label` attributes to the icon-only action buttons in `frontend/todos/src/components/table/TodoTable.vue`:

- `Lưu trữ công việc` / `Khôi phục công việc`
- `Hoàn thành công việc`
- `Xem chi tiết công việc`
- `Sửa công việc`
- `Xóa công việc` / `Xóa vĩnh viễn`

This improves accessibility and makes the UI tests resilient without relying on button order or CSS colors. No behavior changed.

## Structure

```
e2e/
  playwright.config.ts
  scripts/run-e2e.mjs
  tests/
    api/
      smoke.spec.ts
      todos.spec.ts
    helpers/
      api.ts
    ui/
      todos.spec.ts
```

## Limitations

- UI tests run on Chromium only.
- Ports 3000 and 5173 must be free.
- The app hardcodes `http://localhost:3000/api/v1`, so the backend must use port 3000.
- First run is slower because MySQL and Chromium are downloaded.
- No visual regression or accessibility audit yet; `aria-label` support makes both easier to add.

## Next additions

- Cross-browser project (Firefox/WebKit).
- GitHub Actions workflow with MySQL service, artifact upload, and HTML report.
- A11y checks with `@axe-core/playwright`.
- Seed/reset API for faster test isolation.
