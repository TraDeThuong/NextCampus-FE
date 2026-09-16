# Quy Ước Lập Trình Frontend (Frontend Guidelines)

Áp dụng cho Next.js 16 App Router, React 19 và Tailwind CSS 4.

---

## 1. Next.js 16 App Router & React 19

- **Phân định Server Component vs Client Component**:
  - Mặc định giữ các Page và Layout là **Server Component** để tối ưu hóa SEO và tốc độ tải trang ban đầu.
  - Chỉ thêm chỉ thị `'use client'` ở đầu file khi component thực sự cần:
    * Sử dụng React Hooks (`useState`, `useEffect`, `useContext`).
    * Sử dụng TanStack Query hooks hoặc React Hook Form.
    * Lắng nghe sự kiện người dùng (`onClick`, `onChange`, `onSubmit`).
    * Thao tác với trình duyệt (window, document, localStorage).
- **Tránh "Client Boundary Bleed"**: Tách nhỏ các phần tương tác (như form, modal, button dropdown) thành component con có `'use client'`, giữ layout cha là Server Component.
- **Quản lý Route Groups**:
  - `app/[locale]/(auth)/`: Dành cho trang xác thực.
  - `app/[locale]/(onboarding)/`: Dành cho form nộp đơn công khai.
  - `app/[locale]/(dashboard)/admin/`: Phân hệ quản trị.
  - `app/[locale]/(dashboard)/leader/`: Phân hệ quản lý nhóm/TTS.
  - `app/[locale]/(dashboard)/intern/`: Phân hệ thực tập sinh.

---

## 2. Quy ước Giao diện & Tailwind CSS 4

- **Design Tokens**:
  - Sử dụng các class màu sắc và biến CSS chuẩn hóa trong `app/globals.css`.
  - **KHÔNG** sử dụng mã màu hex tùy tiện (như `bg-[#1a2b3c]`) nếu không phải trường hợp đặc biệt đã được thống nhất.
- **Responsive Mobile-First**:
  - Mọi layout, bảng biểu, modal phải hỗ trợ tốt trên thiết bị di động (`sm:`, `md:`, `lg:`, `xl:`).
  - Với bảng dữ liệu lớn (Table), cung cấp thanh cuộn ngang `overflow-x-auto` hoặc chuyển sang dạng thẻ (Card list) trên màn hình nhỏ.
- **Micro-interactions & UX Polish**:
  - Nút bấm phải có trạng thái hover, active, focus-visible và disabled rõ ràng.
  - Sử dụng transitions nhẹ nhàng (`transition-all duration-200`).
  - Nút tải phải có loading spinner (`animate-spin`) và thuộc tính `disabled` trong lúc gửi request.
- **Khả năng tiếp cận (Accessibility - a11y)**:
  - Nút chỉ chứa icon bắt buộc phải có thuộc tính `aria-label`.
  - Tuyệt đối không gắn sự kiện `onClick` lên thẻ `<div>` hoặc `<span>` thuần túy nếu không có `role="button"` và `tabIndex={0}`. Ưu tiên dùng thẻ `<button type="button">`.
