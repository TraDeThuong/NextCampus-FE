# Bộ Nhớ Dự Án Frontend (NexCampus-FE Memory)

Chỉ lưu các quyết định kiến trúc và UI/UX đã được xác nhận, có hiệu lực lâu dài cho toàn bộ phiên làm việc của Frontend.

---

## 1. Quyết định UI/UX đã xác nhận

- **2026-07-31 — Căn chỉnh Icon + Heading (Icon & Heading Alignment)**:
  - **TUYỆT ĐỐI KHÔNG** đặt `flex items-center gap-2` trực tiếp lên thẻ heading `<h1>`/`<h2>`/`<h3>` vì heading là block element, khiến icon bị lệch hàng hoặc vỡ layout.
  - **Pattern chuẩn**: Bọc icon và heading trong một thẻ `<div>` riêng:
    ```tsx
    <div className="flex items-center gap-2">
      <Icon className="w-5 h-5 shrink-0 text-primary" />
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
    ```
  - Luôn thêm `shrink-0` vào icon để icon không bao giờ bị méo/thu nhỏ khi tiêu đề dài.

- **2026-07-31 — Ô Search Input Padding & Đồng bộ Filter**:
  - Khi ô Search đặt cạnh các dropdown filter (như Status filter), **KHÔNG** dùng icon kính lúp kèm padding sâu `pl-11` vì sẽ làm placeholder bị thụt vào quá sâu lệch hàng với text của dropdown.
  - **Pattern chuẩn**: Bỏ icon kính lúp, áp dụng padding đồng bộ `px-5 py-3` để placeholder thẳng hàng tuyệt đối với văn bản của `FilterSelect`.

- **2026-08-08 — Giao diện Khóa công việc đã hoàn thành**:
  - Khi assignment ở trạng thái `DONE`, giao diện tự động ẩn hoặc vô hiệu hóa (`disabled`) các nút chỉnh sửa task, nút đổi phân công, thêm/xóa attachment.
  - Hiển thị tooltip hoặc badge: *"Công việc đã hoàn thành, không thể sửa đổi."*

- **2026-08-08 — Luồng nộp bài và báo bị chặn (Intern UI)**:
  - Nút "Bắt đầu làm" chỉ hiện khi task ở `TODO`.
  - Nút "Nộp bài" và "Báo bị chặn" chỉ kích hoạt khi task ở `IN_PROGRESS`.
  - Khi bị từ chối duyệt (task quay về `TODO`), nút "Nộp bài" phải bị khóa, bắt buộc Intern bấm "Bắt đầu làm" trước khi có thể nộp lại.

- **2026-08-02 — Đánh giá tuần (Intern View)**:
  - Thực tập sinh không có quyền tự chấm điểm hoặc chỉnh sửa 12 tiêu chí.
  - Giao diện của Intern chỉ hiển thị điểm số, nhận xét và nút **"Đã xem đánh giá"**. Khi bấm, nút chuyển thành nhãn xanh *"Đã xác nhận xem lúc [thời gian]"*.

- **2026-09-16 — Chuẩn hóa Trạng Thái Thành Phần & UI/UX Checklist**:
  - Mọi interactive component (Button, Card, Input...) bắt buộc có đủ 6 trạng thái: Normal, Hover, Focus-visible, Active/Pressed, Disabled, Loading.
  - Mọi Table phải có xử lý text overflow (`truncate` + tooltip), chiều rộng cột cố định/co giãn, cuộn ngang/chuyển card list trên mobile, sticky header/column, phân trang và empty state.
  - Dropdown/Select phải có `max-h-60 overflow-y-auto`, searchable khi danh sách dài, flip placement khi chạm đáy màn hình.
  - Form validation: Viền đỏ + icon cảnh báo + thông báo lỗi, placeholder tương phản rõ với value, dấu sao đỏ `*` bắt buộc, nút ẩn/hiện mật khẩu.
  - Chi tiết quy chuẩn được quy định tại `.agents/rules/ui-ux-checklist.md`.


---

## 2. Quyết định Kỹ thuật & Luồng Dữ Liệu

- **2026-07-28 — Cơ chế Xác thực & Refresh Token**:
  - Access token được lưu trong bộ nhớ RAM (`in-memory`), không lưu vào `localStorage` để chống tấn công XSS.
  - Refresh token lưu trong `HTTP-only cookie`.
  - Axios interceptor khi bắt mã lỗi `401 Unauthorized` sử dụng chung một `refreshPromise` duy nhất để tránh gửi nhiều request refresh đồng thời khi nhiều API chạy song song.

- **2026-08-02 — Xử lý Ngày tháng & Múi giờ**:
  - Toàn bộ date picker, hiển thị lịch và kiểm tra hạn chót tuân thủ múi giờ chuẩn `Asia/Ho_Chi_Minh` (UTC+7).
  - Ngày bắt đầu thực tập (`startDate`) trên form onboarding không được chọn ngày trong quá khứ và không được rơi vào thứ Bảy hoặc Chủ nhật.

- **2026-09-14 — Trải nghiệm AI Client-side (Human-in-the-loop)**:
  - Mọi kết quả từ AI (gợi ý đánh giá 12 tiêu chí, đề xuất phân công task) chỉ được điền vào form ở dạng xem trước (Draft).
  - Leader bắt buộc phải có quyền chỉnh sửa và chủ động bấm nút "Lưu" thì mới gửi request cập nhật vào database.
  - Khi AI service lỗi (timeout/502), hiển thị toast thông báo nhẹ nhàng và cho phép tiếp tục thao tác thủ công, không làm crash giao diện.

- **2026-09-16 — Đa Ngôn Ngữ (i18n) & Chuyển Đổi Theme (Light / Dark / System)**:
  - **i18n**: Hỗ trợ 2 ngôn ngữ `vi` (mặc định) và `en` qua `next-intl`. Dùng `useLocaleSwitcher()` để đổi `document.documentElement.lang` và URL qua `history.replaceState` không reload trang. Font tiếng Việt riêng (`--font-heading-vi`, `--font-body-vi`) để đảm bảo hiển thị chuẩn dấu thanh. Tuyệt đối không hardcode text tiếng Việt/Anh trực tiếp trong code.
  - **Theme**: 3 chế độ `light`, `dark`, `system`. Class `.dark` trên thẻ `<html>`, lưu lựa chọn trong `localStorage` key `nexcampus-theme`. Khi chọn `system` phải lắng nghe media query `(prefers-color-scheme: dark)`. Bắt buộc có script inline chống nhấp nháy FOUC trong `<head>`. Sử dụng semantic CSS tokens (`bg-background`, `text-foreground`, `border-border`) thay vì hardcode mã màu.

- **2026-09-17 — Kiến trúc Đa Ngôn Ngữ Feature-Based (i18n)**:
  - Xóa bỏ hoàn toàn việc chia thư mục i18n theo Role (`admin/`, `leader/`, `intern/`).
  - Dữ liệu dịch thuật được tổ chức theo Mô-đun/Tính năng chuẩn hóa (`messages/${locale}/*.json`): `roles.json`, `departments.json`, `tasks.json`, `task-groups.json`, `meetings.json`, `daily-reports.json`, `weekly-evaluations.json`, `users.json`, `onboarding.json`, `emails.json`, `regulations.json`, `dashboards.json`, `activity-logs.json`, `profile.json`, `settings.json`.
  - Bộ nạp `loadLocaleMessages()` trong `i18n/load-messages.ts` hợp nhất tự động và bảo lưu tương thích ngược 100% với các namespace portal cũ.

- **2026-09-17 — Loại Bỏ 3 Roles Cố Định & Triển Khai Dynamic RBAC Toàn Diện**:
  - **Portal & Dashboard Resolution**: Xóa bỏ hoàn toàn việc tính toán URL dashboard theo tên role (`/${role}/dashboard`). Sử dụng hàm chuẩn hóa `getPortalName(role)` và `getDashboardPath(role)` tại `lib/portal.ts`. Các vai trò ngoài `LEADER` và `INTERN` (như `ADMIN`, `HR_MANAGER`, `COORDINATOR`...) tự động ánh xạ an toàn vào portal `/admin/*`.
  - **Kiểm soát Truy cập Tuyến đường (ProtectedRoute)**: Nâng cấp `ProtectedRoute` hỗ trợ thuộc tính `portal` (`"admin" | "leader" | "intern"`) và `requiredPermissions?: string[]`. Tài khoản Superadmin (`ADMIN`) luôn sở hữu toàn quyền bypass.
  - **Hook Phân Quyền UI (useRBAC)**: Cung cấp `{ user, role, permissions, isAdmin, portal, can, canAny, canAll }` tại `hooks/rbac/useRBAC.ts` để kiểm tra phân quyền hạt nhân trên mọi component.
  - **Hiển thị Menu Động theo Permissions**: `AdminSidebar` tự động lọc và chỉ hiển thị các menu tương ứng với permissions thực tế của người dùng, ngoại trừ `ADMIN` hệ thống luôn xem được 100% menu.
  - **Quản Trị Nhân Sự & Form Động**: `AdminTeamFilter` & `AdminTeamTable` tích hợp bộ lọc vai trò động qua `useRoles()`. `CreateUserForm` nạp danh sách vai trò thực tế từ backend thay vì hardcode 2 options.


