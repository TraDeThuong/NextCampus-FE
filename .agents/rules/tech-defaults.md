# Quy Ước Kỹ Thuật Mặc Định Frontend (Frontend Tech Defaults)

Áp dụng cho `NexCampus-FE/`.

---

## 1. TypeScript

- Bật chế độ `strict` và tuyệt đối **TRÁNH dùng `any`**.
- Mọi entity, payload gửi đi và response trả về từ backend phải được định nghĩa tường minh trong thư mục `types/`:
  - Khớp với DTO và enum của Backend v2 (`TaskPriority`, `AssignmentStatus`, `RatingLevel`, `ApplicationStatus`).
- Sử dụng type imports rõ ràng: `import type { User } from '@/types/user'`.

---

## 2. Form & Validation

- Sử dụng bộ đôi **React Hook Form** + **Zod**:
  ```tsx
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  ```
- Toàn bộ form submit phải được validate trước ở client bằng Zod schema tương đồng với Backend để tránh gửi request không hợp lệ.
- Hiển thị thông báo lỗi ngay dưới từng trường nhập liệu bằng text đỏ nhỏ (`text-sm text-red-500`).

---

## 3. Quản lý Lỗi & Thông Báo (Error & Toasts)

- Thông báo người dùng sử dụng thư viện `react-hot-toast`:
  - Thao tác thành công: `toast.success('...')`.
  - Thao tác thất bại: `toast.error(error?.response?.data?.message || 'Có lỗi xảy ra')`.
- Không để lộ chi tiết kỹ thuật hoặc stack trace lên toast thông báo cho người dùng.

---

## 4. Xử lý Ngày Tháng & Múi Giờ

- Múi giờ chuẩn: `Asia/Ho_Chi_Minh` (UTC+7).
- Khi gửi ngày lên backend, dùng định dạng chuẩn ISO 8601 (`toISOString()`) hoặc định dạng ngày nghiệp vụ `YYYY-MM-DD`.
- Khi hiển thị, định dạng theo phong cách tiếng Việt thân thiện: `DD/MM/YYYY` hoặc `HH:mm DD/MM/YYYY`.

---

## 5. Dependency & File sinh tự động

- Sử dụng package manager `pnpm` (`pnpm-lock.yaml`).
- Tuyệt đối **KHÔNG chỉnh sửa hoặc commit** các thư mục/file sinh tự động:
  - `.next/`
  - `node_modules/`
  - `next-env.d.ts`
  - `tsconfig.tsbuildinfo`
  - `.env*` (chỉ tham chiếu cấu hình qua biến môi trường công khai `NEXT_PUBLIC_*`).
