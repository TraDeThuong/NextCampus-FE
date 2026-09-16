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

---

## 3. Bộ Checklist UI/UX Bắt Buộc Cho Mọi Thành Phần

Chi tiết tại tài liệu chuyên biệt: [`.agents/rules/ui-ux-checklist.md`](file:///d:/NodeJS/NexCampus/NexCampus-FE/.agents/rules/ui-ux-checklist.md). Trước khi hoàn thiện bất kỳ giao diện nào, AI phải rà soát đủ 6 yếu tố:
1. **Trạng thái Component (Component States)**: Đầy đủ 6 trạng thái: Normal, Hover, Focus/Focus-visible, Active/Pressed, Disabled, Loading (spinner + disable).
2. **Bảng dữ liệu (Table)**: Xử lý Text Overflow (`truncate` + tooltip), Column Width (cố định vs co giãn), Mobile responsive (cuộn ngang hoặc card list), Sort & Filter (badge, clear filter), Phân trang & Empty state, Sticky header/column.
3. **Menu thả xuống (Dropdown / Select)**: Chiều cao tối đa (`max-h-60 overflow-y-auto`), ô tìm kiếm bên trong khi danh sách dài, multi-select với checkbox và badges, tự động mở ngược lên (`side="top"`) khi ở đáy màn hình.
4. **Form & Ô nhập liệu (Input Fields)**: Viền đỏ + câu lỗi + icon cảnh báo khi invalid; phân biệt màu placeholder vs value; dấu sao đỏ `*` bắt buộc; nút ẩn/hiện mật khẩu, format số và datepicker chuẩn.
5. **Hệ thống lưới & Đáp ứng (Grid & Responsive)**: Breakpoints chuẩn (`sm`, `md`, `lg`, `xl`, `2xl`), layout tự co giãn (4 cột -> 2 cột -> 1 cột), drawer menu trên mobile.
6. **Hệ thống thiết kế (Design System) & Tài nguyên**: Typography chuẩn cấp độ, bảng màu semantic NexCampus, icon SVG Lucide đồng bộ kèm `shrink-0`.

