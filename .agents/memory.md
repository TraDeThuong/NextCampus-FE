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

- **2026-09-17 — Tối ưu Chiều rộng Sidebar Bên Phải (Borderless Right Sidebar / Panel)**:
  - **Quy tắc**: Toàn bộ các thành phần sidebar bên phải (Right Sidebar, panel chi tiết bên phải, cột hành động/thông tin phụ) **tuyệt đối không sử dụng viền bao quanh (outer border / border bao ngoài container)** nhằm tối đa hóa diện tích và chiều rộng hiển thị nội dung.
  - **Pattern chuẩn**: Thiết kế bố cục liền mạch (borderless / seamless layout), không bọc bên ngoài bằng các khung viền hộp (`border`, `border-white/10`, `border-slate-200`) gây lãng phí không gian hiển thị; ưu tiên dùng khoảng cách tự nhiên (`gap-6`), padding hợp lý hoặc nền mờ tinh tế để phân chia khu vực.

  - **Đa ngôn ngữ & Quy chuẩn Placeholder cho Dropdown ("Tất cả" / "All")**: 
    * Mọi dropdown bộ lọc (`FilterSelect`) chỉ cần hiển thị duy nhất **"Tất cả"** (đối với tiếng Việt) hoặc **"All"** (đối với tiếng Anh) làm placeholder / option mặc định khi chưa chọn.
    * **Tuyệt đối KHÔNG nối thêm tên trường** (như *"Tất cả phòng ban"*, *"Tất cả vị trí"*, *"Tất cả trạng thái"*, *"Tất cả vai trò"*...) vì nhãn (`label`) phía trên ô đã thể hiện rõ ngữ cảnh trường dữ liệu.
    * **Tinh giản nhãn bộ lọc (Concise Filter Labels)**: Nhãn (`label`) của các ô lọc phải thật ngắn gọn, súc tích, loại bỏ các từ dư thừa như *"Trạng thái"*, *"được gán"* (ví dụ: dùng *"Lời mời"*, *"Đơn"*, *"Phòng ban"*, *"Vị trí"* thay vì *"Trạng thái lời mời"*, *"Trạng thái đơn"*...).
    * `FilterSelect` tự động phân giải: `placeholder ?? (locale === "vi" ? "Tất cả" : "All")`. Khi gọi `FilterSelect`, không cần truyền prop `placeholder` phức tạp trừ trường hợp đặc biệt.

- **2026-09-18 — Hiệu Ứng Hover & Bố Cục Mobile Thẻ Thống Kê (Stat Cards Micro-interactions & Mobile Grid)**:
  - **Hiệu ứng Micro-interaction**: Toàn bộ thẻ thống kê sử dụng `<MetalCard>` (tại `/admin/admin-team`, `/admin/leaders`, `/admin/interns`, `/admin/onboarding`, `MeetingStats`, `InternTaskStats`...) bắt buộc có hiệu ứng tương tác vi mô đồng bộ khi hover. Hộp chứa Icon BẮT BUỘC có các lớp: `transition-all duration-500 group-hover:rotate-6 group-hover:scale-110`. Khi hover thẻ, icon xoay nhẹ 6 độ và phóng to 1.1x kết hợp dải sáng kim loại quét qua (`group-hover:left-[130%]`) của `MetalCard`.
  - **Bố cục Mobile (Tối thiểu 2 thẻ / hàng & Xử lý số lượng thẻ lẻ)**:
    * Trên màn hình di động (`< md`), lưới thống kê **BẮT BUỘC hiển thị tối thiểu 2 thẻ trên một hàng** (`grid grid-cols-2 gap-3 sm:gap-4 md:...`). Tuyệt đối KHÔNG để `grid` mặc định rơi về 1 cột đơn dọc làm chiếm chiều dài trang.
    * **Xử lý số lượng lẻ (`cards.length % 2 !== 0`)**: Nếu tổng số thẻ là số lẻ (ví dụ 3, 5, 7 thẻ), **thẻ đầu tiên BẮT BUỘC chiếm toàn bộ hàng đầu tiên trên giao diện mobile (`col-span-2 md:col-span-1`)** để làm thẻ Headline KPI chủ đạo. Các thẻ còn lại tự động ghép thành từng cặp 2 thẻ / hàng đều đặn, không để lại khoảng trống khuyết lẻ ở hàng cuối.
  - **Responsive Sizing chuẩn cho Thẻ Thống kê 2 cột mobile**:
    * Padding thẻ: `p-4 sm:p-5 lg:p-6`
    * Kích thước số: `text-2xl sm:text-4xl lg:text-5xl font-bold leading-none`
    * Khung chứa Icon: `h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 rounded-xl sm:rounded-2xl` kèm `shrink-0`
    * Icon SVG: `h-5 w-5 sm:h-6 sm:w-6`
    * Tiêu đề: `text-[11px] sm:text-xs font-medium uppercase tracking-[0.1em] sm:tracking-[0.2em] text-muted truncate`
    * Thanh kẻ ngang: `mt-3 sm:mt-4 h-[2px] w-10 sm:w-16 rounded-full`

- **2026-09-18 — Quy Chuẩn Phân Trang Đồng Bộ Cho Bảng Dữ Liệu (Standardized Table Pagination)**:
  - **Đồng bộ URL (URL-first State)**: Tham số `page` và `limit` bắt buộc đồng bộ hai chiều với URL search query (`?page=1&limit=10`) qua `useSearchParams()` và `router.push()`. Khi người dùng gõ tìm kiếm hoặc đổi filter, bắt buộc tự động reset về `page=1`.
  - **Vị trí Footer `<Table.Footer>`**: Toàn bộ bảng dữ liệu đặt cụm điều khiển phân trang bên trong `<Table.Footer>`.
  - **Điều kiện hiển thị `{meta && meta.totalPages > 1 && (`**: Tự động ẩn thanh footer khi dữ liệu chỉ có 1 trang (`meta.totalPages <= 1`, tức số dòng ≤ limit mặc định 10) để giữ giao diện bảng tinh gọn; tự động xuất hiện khi dữ liệu sang trang thứ 2 trở lên.
  - **Hiển thị thông tin & Nút bấm chuẩn**:
    * Bên trái: Chuỗi định dạng `next-intl` động: `t("...pagination", { page: meta.page, totalPages: meta.totalPages, total: meta.total })` (*"Trang X / Y (Tổng Z nhân sự/bản ghi)"*). Tuyệt đối không hardcode text.
    * Bên phải: Nút `ChevronLeft` (`disabled={meta.page <= 1}`) và `ChevronRight` (`disabled={meta.page >= meta.totalPages}`) kèm style Cyberpunk viền `border-white/10 bg-white/[0.03] text-muted hover:border-white/20 hover:text-foreground disabled:opacity-30`.

- **2026-09-18 — Nút Làm Mới Dữ Liệu Bảng (Standardized Table Reload Button - `Table.ReloadButton`)**:
  - **Mục đích**: Cung cấp nút làm mới dữ liệu cục bộ cho toàn bộ bảng dữ liệu mà **tuyệt đối KHÔNG tải lại toàn trang (không F5, không `window.location.reload()`)**, bảo toàn nguyên vẹn URL search params, trạng thái mở modal và phiên làm việc.
  - **Cơ chế hoạt động**: Sử dụng trực tiếp hàm `refetch()` và cờ `isFetching` từ hook TanStack Query (e.g., `useApplicationInvites`, `useLeaders`, `useUsers`, `useInterns`, `useDepartments`, `useRegulations`, `useActivityLogs`, `useTasks`, `useWeeklyEvaluations`).
  - **Thành phần dùng chung**: `<Table.ReloadButton onReload={refetch} isReloading={isFetching} />` (tích hợp sẵn trong compound component `<Table>`: `Table.ReloadButton`).
  - **Vị trí chuẩn hóa**: Đặt tại ô tiêu đề cột cuối cùng của `<Table.Header>` (cột thao tác / Actions column header ở góc trên bên phải của bảng).
    * Lý do: Vị trí góc trên cùng bên phải là chuẩn UX quen thuộc nhất, thẳng hàng tự nhiên với các icon thao tác của từng dòng bên dưới, luôn hiển thị cố định khi cuộn bảng nhờ sticky header (`sticky top-0`), không chiếm dụng diện tích của thanh công cụ/filter phía trên.
  - **Giao diện & Trạng thái**:
    * Kích thước nhỏ gọn `h-7 w-7`, bo góc `rounded-lg`, hiệu ứng hover phát sáng cyan `hover:bg-white/5 hover:text-cyan-400`, micro-interaction nhấn `active:scale-90`.
    * Icon `RotateCw` tự động xoay tròn liên tục khi dữ liệu đang được tải ngầm (`animate-spin text-cyan-400` khi `isReloading={true}`), đồng thời tự động vô hiệu hóa (`disabled`) để chống spam request.
    * Tích hợp tooltip và `aria-label` tự động theo ngôn ngữ: *"Làm mới dữ liệu"* (vi) / *"Refresh data"* (en).

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

- **2026-09-18 — Tách Biệt Nhân Sự Ban Quản Trị & Tập Trung Hóa Gán Vai Trò (Role Assignment Centralization)**:
  - **Phân hệ `/admin/admin-team`**: Chỉ quản lý đội ngũ Ban Quản Trị (những vai trò quản trị hệ thống). Không hiển thị nhân sự `LEADER` và `INTERN` tại đây. Luôn tự động gắn `excludeRoles="LEADER,INTERN"` vào query params và truy vấn thống kê.
  - **Bỏ cột vai trò & Bỏ lọc vai trò ở `/admin/admin-team`**: Vì trang này chỉ dành cho Ban Quản Trị, cột vai trò và bộ lọc vai trò bị loại bỏ để bảng thoáng rộng và tập trung.
  - **Tập trung hóa đổi vai trò về `/admin/roles`**: Thao tác gán vai trò người dùng được quy tụ 100% về trang `/admin/roles` qua modal `RoleUsersModal` mở từ cột/nút "Thành viên" của từng vai trò. Xóa bỏ nút "Đổi vai trò" phân tán ở từng hàng `AdminTeamRow`.


