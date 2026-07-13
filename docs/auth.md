# Auth — NexCampus Frontend

## Cấu trúc thư mục

```
src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx              ← nền tối + căn giữa toàn trang
│   │   └── login/
│   │       └── page.tsx            ← entry point, render <Login />
│   │
│   └── (dashboard)/
│       ├── admin/dashboard/        ← ADMIN sau login
│       ├── leader/dashboard/       ← LEADER sau login
│       └── intern/dashboard/       ← INTERN sau login
│
├── components/auth/
│   ├── Login.tsx                   ← card trắng bọc form
│   ├── LoginForm.tsx               ← form: email, password, remember me, submit
│   ├── LoginHeader.tsx             ← logo + "Welcome Back"
│   └── PasswordInput.tsx           ← ô password + nút show/hide
│
├── hooks/
│   └── useLogin.ts                 ← react-hook-form + mutation gọi API
│
├── services/
│   └── auth.service.ts             ← POST /auth/login
│
├── types/
│   └── auth.ts                     ← LoginPayload, LoginSuccessResponse, ...
│
└── lib/
    └── axios.ts                    ← baseURL = http://localhost:8888/api/v1
```

## Luồng hoạt động

```
User nhập email + password
       │
       ▼
LoginForm → useLogin.handleSubmit()
       │
       ▼
authService.login({ email, password })
       │  POST /api/v1/auth/login
       ▼
Backend kiểm tra email, bcrypt.compare(password)
       │
       ├─ Sai → 401 { code: "INVALID_CREDENTIALS" } → toast error
       │
       └─ Đúng → 200 { accessToken, refreshToken, user: { role } }
                     │
                     ├─ Lưu token vào localStorage (remember me) hoặc sessionStorage
                     ├─ Lưu user object
                     ├─ toast.success("Signed in successfully!")
                     └─ Redirect:
                           ADMIN  → /admin/dashboard
                           LEADER → /leader/dashboard
                           INTERN → /intern/dashboard
```

## Liên kết Backend

| Frontend | Backend |
|----------|---------|
| `lib/axios.ts` → `baseURL` | `NexCampus-BE` port `8888` |
| `services/auth.service.ts` → `POST /auth/login` | `auth.controller.ts` → `auth.service.ts` |
| `types/auth.ts` | `auth.dto.ts` |

**Backend trả về:**
```json
{
  "success": true,
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "user": {
      "id": "uuid",
      "email": "admin@nexcampus.local",
      "fullName": "Admin",
      "role": "ADMIN"
    }
  }
}
```

## Test

### Tài khoản test

| Email | Password | Role | Dashboard |
|-------|----------|------|-----------|
| `admin@nexcampus.local` | `Admin@123456` | ADMIN | `/admin/dashboard` |
| `leader@nexcampus.local` | `Leader@123456` | LEADER | `/leader/dashboard` |
| `intern@nexcampus.local` | `Intern@123456` | INTERN | `/intern/dashboard` |

### Cách test

```bash
# 1. Backend
cd NexCampus-BE
npx prisma db push && npx prisma db seed   # migrate + seed data
npm run dev                                  # chạy port 8888

# 2. Frontend
cd nexcampus-fe
npm run dev                                  # chạy port 3000

# 3. Mở http://localhost:3000/login

# 4. Test API trực tiếp
curl -X POST http://localhost:8888/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nexcampus.local","password":"Admin@123456"}'
```

### Các trường hợp test

| # | Input | Kết quả mong đợi |
|---|-------|-----------------|
| 1 | Đúng email + password | Redirect về dashboard theo role |
| 2 | Sai password | Toast error "Invalid credentials" |
| 3 | Email không tồn tại | Toast error "Invalid credentials" |
| 4 | Bỏ trống email/password | Validation error trên form |
| 5 | Check "Remember me" | Token lưu trong localStorage (F12 → Application) |
| 6 | Không check "Remember me" | Token lưu trong sessionStorage |
