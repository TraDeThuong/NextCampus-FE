# Bản đồ dự án NexCampus Frontend (NexCampus-FE)

## Mục đích

`NexCampus-FE` là ứng dụng giao diện web chính thức của nền tảng quản lý thực tập sinh NexCampus, phục vụ 3 nhóm người dùng chính: **Admin**, **Leader** và **Thực tập sinh (Intern)**, cùng luồng tiếp nhận ứng viên công khai (Onboarding).

## Công nghệ nền tảng

- **Framework**: Next.js 16.2.9 (App Router)
- **Core**: React 19.2.4 + TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS 4 (dùng `@tailwindcss/postcss`, CSS variables token trong `app/globals.css`)
- **Server State**: TanStack React Query v5 (`@tanstack/react-query`)
- **Client State**: React Context (`contexts/AuthContext.tsx`, UI context)
- **Form & Validation**: React Hook Form v7 + Zod (`@hookform/resolvers/zod`)
- **HTTP Client**: Axios với interceptor nạp token in-memory và tự động refresh token
- **Biểu đồ & Icon**: Recharts, Lucide React (`lucide-react`)
- **Đa ngôn ngữ (i18n)**: `next-intl` (route dynamic `app/[locale]/...`, hỗ trợ tiếng Việt `vi` và tiếng Anh `en`, font tiếng Việt riêng)
- **Hệ thống Theme**: 3 chế độ Sáng / Tối / Theo hệ thống (Light / Dark / System), class `.dark` trên `<html>`, lưu `localStorage`, đồng bộ `prefers-color-scheme`
- **Package Manager**: `pnpm`


## Cấu trúc thư mục

```text
app/
├── [locale]/
│   ├── (auth)/             # Đăng nhập, quên mật khẩu, kích hoạt tài khoản
│   ├── (onboarding)/       # Biểu mẫu ứng tuyển công khai theo link invite
│   └── (dashboard)/        # Phân hệ nghiệp vụ chính
│       ├── admin/          # Quản trị hệ thống, phòng ban, nhân sự, audit log
│       ├── leader/         # Phân công task, chấm bài nộp, đánh giá tuần 12 tiêu chí
│       └── intern/         # Báo cáo ngày, xem task, nộp bài, xem đánh giá
├── globals.css             # Design tokens, CSS variables, typography
└── layout.tsx              # Root HTML & locale providers

components/
├── ui/                     # UI components cơ bản tái sử dụng (Button, Input, Modal, Badge...)
└── [domain]/               # Component theo nghiệp vụ cụ thể

hooks/                      # Custom hooks bọc TanStack Query (useTasks, useEvaluations...)
services/                   # API client functions gọi backend qua lib/axios.ts
contexts/                   # AuthContext, ThemeContext
lib/
└── axios.ts                # Axios instance, baseURL (/api/v2 hoặc /api/v1), refresh logic
types/                      # TypeScript definitions khớp DTO của Backend
ai/                         # Cấu trúc 4 thư mục tài nguyên & kiểm định AI Client-side
```

## Luồng dữ liệu chuẩn (Data Flow)

```text
User Action / Page Load
       │
       ▼
React Component / Page
       │
       ▼
Domain Hook (hooks/use*.ts)
[Quản lý cache, loading state, mutation side-effects bằng TanStack Query]
       │
       ▼
API Service (services/*.service.ts)
[Gửi HTTP request, chuẩn hóa payload/response shape]
       │
       ▼
Axios Client (lib/axios.ts)
[Tự động gắn Access Token in-memory, xử lý 401 refresh token cookie]
       │
       ▼
Backend API (/api/v2)
```
