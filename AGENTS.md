# NexCampus Frontend Agent Guide

Tài liệu hướng dẫn dành cho AI trợ lý lập trình làm việc trên repository `NexCampus-FE/`.

---

## 1. Phạm Vi & Tài Liệu Bắt Buộc Đọc

Phạm vi tác vụ: Toàn bộ mã nguồn, cấu hình và tài nguyên trong thư mục `NexCampus-FE/`.

Trước khi thực hiện bất kỳ thay đổi nào, AI trợ lý **BẮT BUỘC** phải đọc và tuân thủ các tài liệu quy chuẩn trong thư mục `.agents/`:

1. [`.agents/project.md`](file:///d:/NodeJS/NexCampus/NexCampus-FE/.agents/project.md): Bản đồ kiến trúc dự án, stack công nghệ (Next.js 16.2.9, React 19.2.4, Tailwind CSS 4, TanStack Query v5), phân vùng Route groups (`(auth)`, `(dashboard)`, `(onboarding)`).
2. [`.agents/memory.md`](file:///d:/NodeJS/NexCampus/NexCampus-FE/.agents/memory.md): Tổng hợp các quyết định kỹ thuật và quy chuẩn UI/UX bền vững đã được thống nhất và kiểm chứng.
3. [`.agents/rules/architecture.md`](file:///d:/NodeJS/NexCampus/NexCampus-FE/.agents/rules/architecture.md): Quy chuẩn phân tầng 4 lớp (`Page/Component -> Domain Hook -> Service -> Axios Instance`) và quản lý cache Query keys.
4. [`.agents/rules/frontend.md`](file:///d:/NodeJS/NexCampus/NexCampus-FE/.agents/rules/frontend.md): Quy ước chi tiết về Next.js App Router, Server vs Client Components, Design tokens Tailwind 4.
5. [`.agents/rules/ui-ux-checklist.md`](file:///d:/NodeJS/NexCampus/NexCampus-FE/.agents/rules/ui-ux-checklist.md): **Bộ checklist UI/UX bắt buộc**: 6 trạng thái component (Default, Hover, Focus, Active, Disabled, Loading), Table (overflow, responsive, sticky), Dropdown (max-height, search, multi-select), Form input (error, placeholder, required), Responsive breakpoints và Design system.
6. [`.agents/rules/i18n-and-theming.md`](file:///d:/NodeJS/NexCampus/NexCampus-FE/.agents/rules/i18n-and-theming.md): **Quy chuẩn i18n & Theme**: Chuyển đổi ngôn ngữ Anh - Việt qua `next-intl` (font tiếng Việt riêng, cấm hardcode chuỗi), chế độ Theme Sáng / Tối / Theo hệ thống (class `.dark`, script chống nhấp nháy FOUC, semantic tokens Tailwind 4).
7. [`.agents/rules/tech-defaults.md`](file:///d:/NodeJS/NexCampus/NexCampus-FE/.agents/rules/tech-defaults.md): Tiêu chuẩn TypeScript `strict`, Form validation Zod, xử lý múi giờ `Asia/Ho_Chi_Minh`.
8. [`.agents/rules/workflow.md`](file:///d:/NodeJS/NexCampus/NexCampus-FE/.agents/rules/workflow.md): Quy trình 4 bước: Khảo sát -> Triển khai -> Kiểm tra chất lượng (`pnpm run lint`) -> Bàn giao.

---

## 2. Hệ Thống 4 Thư Mục AI Client-Side (`ai/`)

Khi làm việc với các tính năng có yếu tố AI (Gợi ý đánh giá thực tập tuần, Đề xuất phân công công việc, Phân bổ task group), phải đọc và tuân thủ cấu trúc tại thư mục `ai/`:

- [`ai/prompts/`](file:///d:/NodeJS/NexCampus/NexCampus-FE/ai/prompts/): Quy chuẩn hiển thị gợi ý AI trên giao diện (`ai-evaluation-ui-rules.md`, `ai-task-allocation-ui-rules.md`, `ai-safety-and-ux-guidelines.md`).
- [`ai/data/`](file:///d:/NodeJS/NexCampus/NexCampus-FE/ai/data/): Đặc tả giao diện gốc (`raw/`) và cấu hình UI chuẩn hóa (`processed/evaluation-criteria-ui-config.json`, `task-allocation-ui-config.json`).
- [`ai/agents/`](file:///d:/NodeJS/NexCampus/NexCampus-FE/ai/agents/): Danh mục định nghĩa và giao tiếp agent phía Client.
- [`ai/evals/`](file:///d:/NodeJS/NexCampus/NexCampus-FE/ai/evals/): Bộ tiêu chí đánh giá trải nghiệm người dùng với AI (`scorecards/frontend-ai-ux-scorecard-100.md`, rubric, kịch bản test mock và telemetry).

---

## 3. Các Nguyên Tắc Bất Di Bất Dịch (Non-negotiable Rules)

1. **Luồng dữ liệu 4 tầng**:
   - `Page / Component` ➔ `Custom Hook (TanStack Query)` ➔ `Service (services/*.ts)` ➔ `Axios Client (lib/axios.ts)`.
   - Tuyệt đối không gọi axios trực tiếp trong Component.
2. **Cơ chế xác thực & Phân quyền**:
   - Access token lưu trong **RAM (in-memory)**, refresh token chạy ngầm qua **HTTP-only cookie** với cơ chế chia sẻ `refreshPromise` tránh race condition.
   - Thực tập sinh (`INTERN`) chỉ xem điểm đánh giá tuần và bấm "Xác nhận đã xem", tuyệt đối không có form nhập/chỉnh sửa điểm số.
3. **Quy chuẩn UI/UX đã khóa**:
   - **Icon + Heading**: Tuyệt đối **KHÔNG đặt `flex` trực tiếp lên thẻ heading** (`<h1>`-`<h3>`). Phải bọc icon và heading trong một `<div className="flex items-center gap-2">` riêng kèm `shrink-0` cho icon.
   - **Ô tìm kiếm (Search input)**: Không đặt icon kính lúp bên trong ô input; dùng padding `px-5 py-3` để đồng bộ hoàn toàn với các ô `FilterSelect`.
   - **Chuẩn hóa Component & Form & Table**: Bắt buộc tuân thủ đủ 6 trạng thái thành phần (Normal, Hover, Focus, Active, Disabled, Loading), xử lý vỡ bảng (overflow, fixed/flex width, scroll/card list mobile, sticky header), menu giới hạn `max-h-60`, form hiển thị viền đỏ + icon + text lỗi rõ ràng theo [`.agents/rules/ui-ux-checklist.md`](file:///d:/NodeJS/NexCampus/NexCampus-FE/.agents/rules/ui-ux-checklist.md).
   - **Đa ngôn ngữ & Theme**: Tuyệt đối không hardcode text tiếng Việt/Anh trực tiếp; dùng `useTranslations()`. Chế độ Theme (Sáng/Tối/Theo hệ thống) điều khiển qua class `.dark` trên thẻ `<html>` và token semantic Tailwind 4 theo [`.agents/rules/i18n-and-theming.md`](file:///d:/NodeJS/NexCampus/NexCampus-FE/.agents/rules/i18n-and-theming.md).

4. **Bảo vệ mã nguồn & File hệ thống**:
   - Tuyệt đối không chỉnh sửa hoặc xóa các file/thư mục sinh tự động: `.next/`, `node_modules/`, `next-env.d.ts`, `tsconfig.tsbuildinfo`, `.env*`.
   - Dùng duy nhất `pnpm` làm package manager.
   - Lệnh kiểm tra chất lượng trước khi hoàn thành: `pnpm run lint`.

