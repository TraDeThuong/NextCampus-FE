# Quy Trình Phát Triển & Kiểm Tra Frontend (Frontend Development Workflow)

Áp dụng cho mọi tác vụ lập trình và bảo trì trên `NexCampus-FE/`.

---

## 1. Bước 1: Khảo Sát & Phân Tích Tác Động (Survey & Impact Analysis)

Trước khi viết hoặc sửa đổi bất kỳ dòng code nào:
1. **Xác định Route & Phân quyền**:
   - Xác định route nằm trong nhóm nào: `(auth)`, `(dashboard)/admin`, `(dashboard)/leader`, `(dashboard)/intern`, hay `(onboarding)`.
   - Kiểm tra vai trò người dùng (Role-based access) và điều kiện hiển thị UI.
2. **Xác định 4 tầng kiến trúc liên quan**:
   - `Page / Component`: Giao diện cần sửa hoặc tạo mới.
   - `Hook (TanStack Query)`: Custom hook phụ trách cache, invalidate hoặc mutate dữ liệu.
   - `Service`: Hàm gọi API backend tương ứng trong thư mục `services/`.
   - `Types`: DTO payload và response trong thư mục `types/`.
3. **Đối chiếu UI/UX & Memory**:
   - Đọc kỹ `.agents/memory.md` để đảm bảo tuân thủ các quyết định đã chốt:
     * Khóa quy ước icon + heading: Không dùng flex trực tiếp trên `<h1>`-`<h3>`, bọc icon + heading vào `div.flex.items-center.gap-2` kèm `shrink-0`.
     * Ô tìm kiếm: Không dùng icon kính lúp bên trong, áp dụng `px-5 py-3` để đồng bộ thẳng hàng với FilterSelect.
     * Xác thực: Token in-memory, cookie refresh HTTP-only.

---

## 2. Bước 2: Triển Khai Theo Chuẩn Kiến Trúc (Implementation)

1. **Tuân thủ phân tầng nghiêm ngặt**:
   - Không gọi `axiosInstance` trực tiếp từ component/page. Luôn qua tầng `Service -> Hook`.
   - Giữ Server Component làm mặc định trừ khi cần state/event/lifecycle client (`'use client'`).
2. **Sử dụng Design Token Tailwind CSS 4**:
   - Sử dụng các biến màu CSS semantic từ `app/globals.css` (e.g., `bg-background`, `text-foreground`, `border-border`, `bg-primary`).
   - Không hardcode màu sắc tuỳ tiện; tái sử dụng các component chuẩn trong `components/ui/`.
3. **Xử lý toàn diện các trạng thái giao diện**:
   - Luôn xử lý đủ 4 trạng thái: `isLoading` (Skeleton), `isError` (Empty/Retry block), `isEmpty` (EmptyState), và `data` thành công.
   - Không để giao diện bị "vỡ layout" (CLS) khi tải bất đồng bộ.
4. **Không can thiệp file sinh tự động**:
   - Tuyệt đối không chỉnh sửa `.next/`, `node_modules/`, `next-env.d.ts`, `tsconfig.tsbuildinfo`, `.env*`.
   - Sử dụng duy nhất `pnpm` làm package manager.

---

## 3. Bước 3: Kiểm Tra Chất Lượng (Quality Verification)

Sau khi hoàn thiện code:
1. **Kiểm tra cú pháp & Types**:
   - Chạy lệnh kiểm tra lint:
     ```bash
     pnpm run lint
     ```
   - Đảm bảo không có lỗi TypeScript type checking hoặc unused imports/vars nghiêm trọng.
2. **Kiểm tra Responsiveness**:
   - Kiểm tra hiển thị trên các breakpoint: Mobile (`< 768px`), Tablet (`768px - 1024px`), Desktop (`> 1024px`).
3. **Kiểm tra Tương Tác & Lỗi mạng**:
   - Kiểm tra trạng thái disable của nút bấm khi đang mutate (tránh double submit).
   - Kiểm tra hiển thị thông báo lỗi lịch sự qua `toast.error()` khi backend trả mã `400`, `401`, `403`, `409`, `500`.

---

## 4. Bước 4: Bàn Giao & Ghi Nhận (Handoff & Memory Update)

1. **Tóm tắt thay đổi**:
   - Liệt kê rõ các component, hook, service đã tạo hoặc chỉnh sửa.
   - Nêu rõ các route ảnh hưởng và hướng dẫn kiểm thử thủ công (manual test steps).
2. **Cập nhật Memory nếu có thay đổi kiến trúc lớn**:
   - Nếu có quyết định kỹ thuật mới hoặc quy chuẩn UI mới được thống nhất với người dùng, ghi nhận ngay vào `.agents/memory.md`.
