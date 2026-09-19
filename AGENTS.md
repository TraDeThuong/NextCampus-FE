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
   - **Sidebar bên phải (Right Sidebar / Cột phụ / Panel chi tiết)**: Tuyệt đối **KHÔNG có viền bao quanh (loại bỏ hoàn toàn outer border / border container xung quanh)** nhằm giải phóng và tối ưu tối đa chiều rộng không gian hiển thị nội dung. Áp dụng phong cách bố cục liền mạch (borderless / seamless layout), phân tách bằng khoảng cách tự nhiên (`gap`) hoặc nền phụ tinh gọn, không bọc trong các thẻ card viền hộp kín làm chật hẹp giao diện.
   - **Chuẩn hóa Component & Form & Table**: Bắt buộc tuân thủ đủ 6 trạng thái thành phần (Normal, Hover, Focus, Active, Disabled, Loading), xử lý vỡ bảng (overflow, fixed/flex width, scroll/card list mobile, sticky header), menu giới hạn `max-h-60`, form hiển thị viền đỏ + icon + text lỗi rõ ràng theo [`.agents/rules/ui-ux-checklist.md`](file:///d:/NodeJS/NexCampus/NexCampus-FE/.agents/rules/ui-ux-checklist.md).
   - **Chuẩn hóa Dropdown & Quản trị Vai trò**: Tuyệt đối **KHÔNG dùng thẻ HTML native `<select>`** thô cứng cho trạng thái bảng hay form; luôn dùng `InlineSelect` (với portal và flip placement chống clipping khi bảng có `overflow-hidden`) hoặc `Select`. Mọi dropdown bộ lọc (`FilterSelect`): placeholder / option mặc định khi chưa chọn chỉ cần ghi duy nhất **"Tất cả"** (đối với tiếng Việt) hoặc **"All"** (đối với tiếng Anh), tuyệt đối không nối thêm tên trường (như *"Tất cả phòng ban"*, *"Tất cả trạng thái"*...). `FilterSelect` tự động xử lý mặc định `placeholder ?? (locale === "vi" ? "Tất cả" : "All")`. Phân hệ `/admin/admin-team` chỉ quản lý nhân sự Ban Quản Trị (loại bỏ cột vai trò và lọc vai trò, tự động loại trừ `LEADER`, `INTERN`); việc gán/đổi vai trò quy tụ 100% về `/admin/roles` qua modal thành viên vai trò.
   - **Thẻ Thống Kê (Stat Cards / MetalCard) & Responsive Mobile**:
     * **Hiệu ứng Micro-interaction**: Toàn bộ thẻ thống kê `<MetalCard>` bắt buộc có hiệu ứng đồng bộ: icon container phải có `transition-all duration-500 group-hover:rotate-6 group-hover:scale-110`. Tuyệt đối không để icon tĩnh.
     * **Bố cục Mobile (Tối thiểu 2 thẻ / hàng & Xử lý số lượng lẻ)**: Trên giao diện di động (`< md`), lưới thống kê **BẮT BUỘC hiển thị tối thiểu 2 thẻ trên một hàng** (`grid grid-cols-2 gap-3 sm:gap-4 md:...`). Tuyệt đối KHÔNG để `grid` mặc định rơi về 1 cột dọc làm chiếm chiều dài màn hình. **Đặc biệt: Nếu tổng số thẻ thống kê là số lẻ (`cards.length % 2 !== 0`), thẻ đầu tiên BẮT BUỘC chiếm trọn vẹn toàn bộ hàng đầu tiên trên mobile (`col-span-2 md:col-span-1`)** để đóng vai trò thẻ KPI chủ đạo (Headline KPI), các thẻ còn lại ghép thành từng cặp 2 thẻ / hàng đều đặn. Thiết kế thẻ phải responsive tương ứng: padding `p-4 sm:p-5 lg:p-6`, số `text-2xl sm:text-4xl lg:text-5xl`, icon box `h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14` kèm `shrink-0` và tiêu đề thẻ có `truncate` hoặc `line-clamp-2`.
   - **Quy chuẩn Phân Trang Đồng Bộ (Standardized Table Pagination)**:
     * **Đồng bộ URL (URL-first State)**: Phân trang luôn đồng bộ qua URL query params (`?page=1&limit=10`) bằng `useSearchParams()` và `router.push()`. Khi thay đổi bộ lọc tìm kiếm (Search/Filter), bắt buộc tự động reset về `page=1`.
     * **Cấu trúc Footer Bảng (`<Table.Footer>`)**: Toàn bộ bảng dữ liệu đặt phân trang trong `<Table.Footer>`. Bọc trong điều kiện `{meta && meta.totalPages > 1 && (` để tự động ẩn khi chỉ có 1 trang (≤ 10 dòng) giữ giao diện tinh gọn, và tự động hiện khi từ trang thứ 2 trở lên.
     * **Thành phần & Giao diện chuẩn**: Bên trái hiển thị thông tin trang bản địa hóa `t("...pagination", { page: meta.page, totalPages: meta.totalPages, total: meta.total })` (*"Trang X / Y (Tổng Z bản ghi)"*), bên phải là cụm nút `ChevronLeft` (`disabled={meta.page <= 1}`) và `ChevronRight` (`disabled={meta.page >= meta.totalPages}`) phong cách Cyberpunk viền `border-white/10`. Tuyệt đối không hardcode text phân trang.
   - **Quy chuẩn Nút Làm Mới Dữ Liệu Bảng (Standardized Table Reload Button - `Table.ReloadButton`)**:
     * **Mục đích**: Cho phép người dùng làm mới dữ liệu cục bộ tức thì thông qua TanStack Query `refetch()` mà **tuyệt đối KHÔNG tải lại toàn trang (không F5, không `window.location.reload()`)**, bảo toàn URL search query, bộ lọc và trạng thái modal.
     * **Vị trí chuẩn hóa**: Đặt tại ô tiêu đề cột cuối cùng của `<Table.Header>` (cột thao tác / Actions column header ở góc trên bên phải của bảng). Vị trí này trực quan, thẳng hàng với action buttons của từng dòng và cố định trong sticky header.
     * **Thành phần & Trạng thái**: Sử dụng `<Table.ReloadButton onReload={refetch} isReloading={isFetching} />`. Nút nhỏ gọn `h-7 w-7` bo góc `rounded-lg`, hover phát sáng `hover:text-cyan-400`, micro-interaction nhấn `active:scale-90`. Khi `isReloading` (tương ứng `isFetching`), icon xoay `animate-spin text-cyan-400` và tự động `disabled` tránh spam click. Tự động hỗ trợ tooltip & `aria-label` đa ngôn ngữ ("Làm mới dữ liệu" / "Refresh data").
   - **Quy Chuẩn Chọn Ngày Tháng (Standardized DatePicker & DateRangePicker)**:
     * **Tuyệt đối cấm `<input type="date">` native**: Không bao giờ sử dụng thẻ native `<input type="date">` thô sơ của trình duyệt ở bất kỳ trang hay bộ lọc nào (như `/admin/onboarding`, `LeaderTaskFilters`, `ActivityLogFilter`...).
     * **Bắt buộc dùng `DatePicker` / `DateRangePicker`**: Luôn nhập khẩu và sử dụng từ `@/components/ui/DatePicker`.
     * **Tiêu chuẩn UI/UX**:
       - Giao diện Cyberpunk Glassmorphism (`backdrop-blur-2xl border border-white/10 shadow-2xl bg-[#0c1322]/95`).
       - Popover hiển thị qua `createPortal(..., document.body)`, tự động tính vị trí và lật hướng (`flip`) chống tràn màn hình hoặc bị cắt bởi container `overflow-hidden`.
       - Lưới lịch tương tác chuẩn 7 ngày (T2..CN / Mo..Su), đánh dấu chấm xanh cho Today.
       - Highlight khoảng ngày chọn (Start: gradient tròn trái, End: gradient tròn phải, Middle: cyan wash).
       - Hiệu ứng xem trước khoảng ngày khi hover (Hover Range Preview) tạo phản hồi trực quan sinh động.
       - Tích hợp sẵn thanh phím tắt nhanh (Presets: Hôm nay, 7 ngày qua, 30 ngày qua, Tuần này, Tháng này).
       - Hiển thị ngày tháng người dùng theo định dạng chuẩn `DD/MM/YYYY`, lưu trữ và đồng bộ URL query params / API chuẩn ISO `YYYY-MM-DD`.
       - Tự động đóng khi nhấn phím `Escape` hoặc click ra ngoài.
   - **Quy Chuẩn Chống Tràn Màn Hình Dropdown & Popover Trên Mobile**:
     * **Nguyên tắc**: Mọi Dropdown / Popover (đặc biệt là `DatePicker`, `DateRangePicker`, `NotificationDropdown`, `FilterSelect`) trên giao diện di động (`< sm`) **TUYỆT ĐỐI KHÔNG để rơi vào tình trạng tràn mép trái/phải hoặc mất hút dưới đáy màn hình**.
     * **NotificationDropdown trên Mobile**: Không dùng `absolute right-0 w-80` vì nút chuông không nằm ở sát mép phải màn hình (bị profile link đẩy sang trái) khiến menu bị đẩy lùi sang trái và tràn ra ngoài màn hình. Trên mobile, bắt buộc dùng `fixed left-3 right-3 top-[76px] max-w-[calc(100vw-24px)] sm:absolute sm:top-full sm:left-auto sm:right-0 sm:w-96` để menu trải đều trọn vẹn màn hình với lề 12px hai bên.
     * **DatePicker / DateRangePicker trên Mobile**: Tự động tính toán chiều rộng responsive `Math.min(340, window.innerWidth - 20)` và căn giữa màn hình (`Math.round((vw - popoverWidth) / 2)`). Chiều cao tự động kẹp trong viewport `max-h-[calc(100dvh-20px)] overflow-y-auto`. Hàng presets chọn nhanh phải cuộn ngang (`overflow-x-auto`) thay vì wrap nhiều dòng đẩy lịch xuống dưới.
   - **Quy Chuẩn Menu Thao Tác Bảng (Table 3-Dots Action Menu / `MoreVertical`)**:
     * **Chống clipping & che khuất**: Bảng có `overflow-hidden` và `overflow-x-auto`, vì vậy menu thao tác bắt buộc gắn qua `createPortal(..., document.body)` kèm `zIndex: 9999` để không bao giờ bị cắt cụt bởi container bảng hay footer.
     * **Lật vị trí thông minh (`flip placement`) & Kẹp chiều cao**: Tự động đo đạc khoảng cách trên và dưới nút trigger (`spaceBelow`, `spaceAbove`). Khi `spaceBelow < ESTIMATED_HEIGHT && spaceAbove > spaceBelow`, menu tự động mở ngược lên trên (`openUpward`), kẹp `maxHeight` theo không gian viewport thực tế và bật `overflowY: "auto"` chống mất hút dưới đáy màn hình.
     * **Chống tràn mép ngang**: Luôn kẹp tọa độ `left = Math.max(8, Math.min(rect.right - MENU_WIDTH, vw - MENU_WIDTH - 8))` để menu không bao giờ tràn ra ngoài mép phải khi người dùng cuộn ngang bảng hoặc dùng điện thoại.
     * **Tính vị trí đồng bộ khi click**: Gọi `updateMenuPosition()` ngay trước khi `setMenuOpen(true)` trong hàm `toggleMenu` để ngăn chặn hiện tượng menu chớp/nhấp nháy ở vị trí tĩnh `{}` trong frame render đầu tiên.
     * **Đầy đủ phím tắt & Trải nghiệm cảm ứng**: Lắng nghe phím `Escape` để đóng menu và trả focus về nút trigger; hỗ trợ sự kiện `touchstart` bên cạnh `mousedown` để đóng menu khi chạm ra ngoài trên mobile; tự động đóng khi nút trigger cuộn ra ngoài màn hình.
     * **Tuyệt đối không để menu rỗng**: Mọi trạng thái bản ghi (bao gồm `UNUSED`, `ACTIVE`, `USED`, `EXPIRED`, `REVOKED`...) đều phải có các thao tác tương ứng (ít nhất luôn có nút "Xem chi tiết" / "Xem đơn ứng tuyển").
   - **Đa ngôn ngữ & Theme**: Tuyệt đối không hardcode text tiếng Việt/Anh trực tiếp; dùng `useTranslations()`. Chế độ Theme (Sáng/Tối/Theo hệ thống) điều khiển qua class `.dark` trên thẻ `<html>` và token semantic Tailwind 4 theo [`.agents/rules/i18n-and-theming.md`](file:///d:/NodeJS/NexCampus/NexCampus-FE/.agents/rules/i18n-and-theming.md).

4. **Bảo vệ mã nguồn & File hệ thống**:
   - Tuyệt đối không chỉnh sửa hoặc xóa các file/thư mục sinh tự động: `.next/`, `node_modules/`, `next-env.d.ts`, `tsconfig.tsbuildinfo`, `.env*`.
   - Dùng duy nhất `pnpm` làm package manager.
   - Lệnh kiểm tra chất lượng trước khi hoàn thành: `pnpm run lint`.
