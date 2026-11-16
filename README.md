## 📌 Mục tiêu

Xây dựng ứng dụng **To-do List** gồm frontend (Vue.js), backend (Node.js + Express) và MySQL làm database.

---

## 🧱 Yêu cầu kỹ thuật

- **Frontend:** Vue3 (ưu tiên) hoặc tuỳ chọn
- **Backend:** Node.js + Express
- **Database:** MySQL
- **API giao tiếp:** RESTful (sử dụng Axios để gọi API)
- **Triển khai:** Local (hoặc Docker nếu bạn muốn)

---

## 🛠 Chức năng yêu cầu

### 1. Quản lý công việc (To-do)

- [ ] **Thêm công việc mới**
  - Nhập tiêu đề công việc, mô tả (tùy chọn), ngày hết hạn
- [ ] **Xem danh sách công việc**
  - Hiển thị toàn bộ danh sách công việc
  - Có thể lọc theo trạng thái (Chưa hoàn thành / Đã hoàn thành)
- [ ] **Chỉnh sửa công việc**
  - Cập nhật tiêu đề, mô tả, hoặc đánh dấu đã hoàn thành
- [ ] **Xoá công việc**
  - Xoá 1 task khỏi hệ thống

---

## 🧪 Testing

Repo có bộ test **Playwright + TypeScript** trong [`e2e/`](e2e/):

- **25 tests** (16 API + 9 UI), tất cả pass.
- Bao phủ CRUD, validation, filter, pagination, archive/restore, soft delete và error paths.
- Chạy với MySQL tạm thời (`mysql-memory-server`), seed dữ liệu xác định, one-command runner.
- Test plan và defect log: [`e2e/TEST_PLAN.md`](e2e/TEST_PLAN.md).

```bash
cd e2e
npm install
npx playwright install chromium
npm test
```

Kết quả hiện tại: **25 passed**. Hai defect đã phát hiện và ghi lại:

- Unarchive một todo pending đang trả về `completed`.
- Resource không tồn tại trả `400` thay vì `404`.

Chi tiết root cause + evidence nằm trong [`e2e/TEST_PLAN.md`](e2e/TEST_PLAN.md) và [`e2e/README.md`](e2e/README.md).

---

## 🚀 Chạy local

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npx knex migrate:latest
npm run dev
```

Backend chạy tại `http://localhost:3000`.

### 2. Frontend

```bash
cd frontend/todos
npm install
npm run dev
```

Frontend chạy tại `http://localhost:5173`.

### 3. MySQL

Dùng MySQL local hoặc Docker:

```bash
cd backend
docker compose up -d
```

Cập nhật `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE_NAME` trong `backend/.env`.

---

## 📁 Cấu trúc

```
backend/            Express API, Knex migrations, repositories
frontend/todos/     Vue 3 + Vuetify UI
e2e/                Playwright API + UI tests, test plan, runner
```

