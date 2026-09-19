# Quy Chuẩn Trạng Thái & Thành Phần UI/UX (Component States & UI/UX Checklist)

> **BẮT BUỘC ĐỌC & TUÂN THỦ**: Bất kỳ AI trợ lý lập trình nào trước khi xây dựng, chỉnh sửa hoặc kiểm thử bất kỳ thành phần giao diện (Component, Page, Form, Table...) trên `NexCampus-FE` đều phải đối chiếu và đáp ứng đầy đủ các tiêu chuẩn dưới đây.

---

## 🌟 1. Trạng thái chung của mọi thành phần (Component States)

Bất kỳ thành phần tương tác nào (`Button`, `Card`, `Input`, `Select`, `Tab`, `MenuItem`...) cũng **BẮT BUỘC** có đủ 6 trạng thái sau:

1. **Normal / Default**:
   - Trạng thái bình thường khi người dùng chưa tương tác.
   - Màu sắc, viền, bóng đổ và độ tương phản đạt chuẩn WCAG AA.
2. **Hover**:
   - Kích hoạt khi người dùng di chuột qua (chỉ áp dụng cho Desktop qua prefix `hover:`).
   - Biến đổi màu nền nhẹ nhàng (`transition-colors duration-200`, ví dụ: `hover:bg-primary/90`, `hover:border-primary/50`), con trỏ chuột dạng `cursor-pointer`.
3. **Focus / Focus-Visible**:
   - Kích hoạt khi người dùng dùng phím `Tab` để di chuyển đến hoặc đang click chọn vào (tối quan trọng cho Accessibility / a11y).
   - Hiển thị viền outline rõ ràng: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`.
4. **Active / Pressed**:
   - Kích hoạt khi người dùng đang nhấn chuột hoặc giữ ngón tay trên màn hình cảm ứng (`active:scale-[0.98]` hoặc `active:bg-primary/80`).
   - Tạo cảm giác phản hồi xúc giác ngay lập tức cho người dùng.
5. **Disabled**:
   - Kích hoạt khi thành phần bị khóa hoặc không đủ quyền tương tác.
   - Giảm độ mờ (`opacity-50`), đổi con trỏ chuột (`cursor-not-allowed`), vô hiệu hóa mọi sự kiện click (`pointer-events-none`) và có thuộc tính `disabled` hoặc `aria-disabled="true"`.
6. **Loading**:
   - Trạng thái đang tải hoặc đang gửi dữ liệu lên server (ví dụ: nút "Gửi", "Lưu", "Nộp bài").
   - Tự động thay thế hoặc bổ sung icon quay tròn (`<Loader2 className="w-4 h-4 animate-spin" />`), khóa không cho bấm tiếp (`disabled={isLoading}`), giữ nguyên kích thước của nút để tránh giật layout.

---

## 📅 2. Bảng dữ liệu (Table)

Table là thành phần dễ bị "vỡ" giao diện nhất khi lên code. Phải kiểm tra và xử lý triệt để 6 yếu tố:

1. **Độ dài dữ liệu (Text Overflow)**:
   - Khi văn bản trong một ô quá dài: Không làm vỡ layout cột.
   - Áp dụng cắt bớt hiển thị dấu ba chấm (`truncate` hoặc `line-clamp-1`/`line-clamp-2`) kèm `title="..."` hoặc component `<Tooltip>` để người dùng có thể hover xem toàn bộ nội dung.
2. **Độ rộng cột (Column Width)**:
   - Quy định rõ ràng:
     * Cột có độ rộng cố định (**Fixed width**): Cột Checkbox (`w-12`), Cột Số thứ tự / ID (`w-16`), Cột Trạng thái / Badge (`w-32`), Cột Thao tác / Actions (`w-24` hoặc `w-28`).
     * Cột tự co giãn (**Flexible width**): Cột Tên công việc, Tiêu đề, Mô tả (`min-w-[200px] flex-1`).
3. **Hiển thị trên Mobile (Responsive)**:
   - Bảng biểu phải được bọc trong container cuộn ngang: `<div className="w-full overflow-x-auto">`.
   - Với màn hình nhỏ (`< 768px`), ưu tiên chuyển đổi bảng sang dạng thẻ danh sách (**Card list**) hiển thị dọc để tối ưu trải nghiệm chạm vuốt trên di động.
4. **Sắp xếp & Lọc (Sort & Filter)**:
   - Icon sắp xếp (mũi tên tăng/giảm `ArrowUpDown`, `ArrowUp`, `ArrowDown`) đặt ngay cạnh tiêu đề cột cho phép sort.
   - Khi bộ lọc (Filter) được áp dụng: Phải hiển thị huy hiệu (Badge) số lượng filter đang active, nút "Xóa tất cả bộ lọc", và highlight trạng thái đang lọc trên giao diện.
5. **Phân trang (Pagination) & Trạng thái rỗng (Empty state)**:
   - **Phân trang chuẩn (`<Table.Footer>`)**:
     * Luôn đồng bộ URL params: `?page=1&limit=10`. Reset về `page=1` khi tìm kiếm hoặc lọc.
     * Đặt trong `<Table.Footer>`, bọc điều kiện `{meta && meta.totalPages > 1 && (` (ẩn footer khi chỉ có 1 trang để bảng gọn gàng, tự động hiện khi `totalPages > 1`).
     * Bên trái: Hiển thị chuỗi bản địa hóa `t("...pagination", { page: meta.page, totalPages: meta.totalPages, total: meta.total })` (*"Trang X / Y (Tổng Z bản ghi)"*).
     * Bên phải: Nút `ChevronLeft` (`disabled={meta.page <= 1}`) và `ChevronRight` (`disabled={meta.page >= meta.totalPages}`) kèm style Cyberpunk viền `border-white/10 bg-white/[0.03]`.
   - **Trạng thái rỗng (Empty State)**: Khi bảng không có dữ liệu, hiển thị hình minh họa hoặc icon trang trống kèm thông điệp rõ ràng (VD: *"Chưa có công việc nào"*) cùng nút kêu gọi hành động (Call To Action - CTA) như *"Tạo công việc mới"*.
6. **Cố định hàng/cột (Sticky Head/Column)**:
   - Dòng tiêu đề bảng luôn giữ cố định khi cuộn nội dung dài: `<thead className="sticky top-0 bg-background z-10 shadow-sm">`.
   - Cột đầu tiên (Tên/ID) hoặc cột cuối (Thao tác) có thể dùng `sticky left-0` / `sticky right-0` kèm nền màu để không bị chồng chữ khi cuộn ngang.

---

## 🔽 3. Menu thả xuống (Dropdown / Select)

1. **Chiều dài danh sách (Max Height & Scrollbar)**:
   - Tuyệt đối không để menu kéo dài vô tận khi có nhiều mục.
   - Bắt buộc giới hạn chiều cao tối đa và bật cuộn nội dung: `max-h-60 overflow-y-auto`. Thanh cuộn thiết kế gọn gàng, tinh tế.
2. **Tìm kiếm (Searchable)**:
   - Khi danh sách vượt quá 8-10 mục (như danh sách nhân sự, trường học, vị trí tuyển dụng), bắt buộc tích hợp ô tìm kiếm lọc nhanh (Search input) ở ngay đầu menu thả xuống.
3. **Chọn nhiều (Multi-select)**:
   - Khi cho phép chọn nhiều mục: Thiết kế đi kèm ô Checkbox cạnh từng item, hiển thị tổng số mục đã chọn, và render các Badge (thẻ tag) có icon xóa `x` bên trong ô input chính.
4. **Vị trí hiển thị (Placement & Flip)**:
   - Sử dụng Popper / Floating UI hoặc Radix Select để menu tự động tính toán vị trí.
   - Khi Dropdown nằm ở sát đáy màn hình, menu phải tự động mở ngược lên trên (`side="top"`) để không bị tràn hay khuất ngoài viewport.
5. **Trường hợp chữ quá dài**:
   - Từng item trong dropdown nếu text quá dài phải được xử lý `truncate` kèm tooltip, tránh làm phình độ rộng của popover ra toàn màn hình.
6. **Hiển thị trên Mobile (Mobile Viewport & Overflow Protection)**:
   - **Chống tràn mép trái/phải**: Tuyệt đối không dùng `absolute right-0` với chiều rộng cố định lớn (như `w-80`, `w-96`) khi nút kích hoạt nằm thụt lùi vào giữa header/toolbar, vì sẽ làm menu bị dạt sang trái và tràn ra khỏi mép trái màn hình điện thoại.
   - **Pattern chuẩn cho Dropdown Header (như `NotificationDropdown`)**: Trên mobile dùng `fixed left-3 right-3 top-[76px] max-w-[calc(100vw-24px)]`, trên desktop dùng `sm:absolute sm:top-full sm:right-0 sm:w-96`.
   - **Pattern chuẩn cho DatePicker / Popovers**: Chiều rộng responsive `Math.min(340, window.innerWidth - 20)` và tự động căn giữa `left = Math.max(10, Math.round((vw - popoverWidth) / 2))`. Chiều cao kẹp `max-h-[calc(100dvh-20px)] overflow-y-auto` để không bao giờ bị cắt mất nút action ở đáy màn hình.
7. **Menu Thao Tác Trong Bảng (Table 3-Dots Action Menu / `MoreVertical`)**:
   - **Chống Clipping & Che Khuất**: Menu thao tác trong bảng bắt buộc gắn qua `createPortal(..., document.body)` với `zIndex: 9999` để thoát khỏi container bảng có `overflow-hidden` và `overflow-x-auto`.
   - **Lật Vị Trí Thông Minh (`flip placement`)**: Tự động so sánh không gian trên và dưới: khi `spaceBelow < ESTIMATED_HEIGHT && spaceAbove > spaceBelow`, menu lật ngược lên trên (`openUpward`). Kẹp `maxHeight` theo không gian viewport thực tế và bật `overflowY: "auto"`.
   - **Chống Tràn Mép Ngang**: Căn lề kẹp an toàn `left = Math.max(8, Math.min(rect.right - MENU_WIDTH, vw - MENU_WIDTH - 8))` chống tràn mép phải màn hình khi cuộn bảng hoặc trên mobile.
   - **Tính Tọa Độ Đồng Bộ Khi Click**: Gọi `updateMenuPosition()` trước khi bật `setMenuOpen(true)` trong hàm `toggleMenu` tránh chớp vị trí ban đầu `{}`.
   - **Phím Tắt & Cảm Ứng**: Đóng khi bấm `Escape` (trả focus về trigger), đóng khi chạm ngoài (`mousedown`, `touchstart`), tự đóng khi nút trigger cuộn ra ngoài viewport.
   - **Không Bao Giờ Rỗng**: Luôn hỗ trợ đủ các trạng thái dữ liệu (kể cả `UNUSED`) và có fallback "Xem chi tiết".

---

## 📝 4. Form & Ô nhập liệu (Input Fields)

1. **Thông báo lỗi (Error / Validation)**:
   - Khi input không hợp lệ: Đổi viền input sang màu đỏ (`border-destructive focus-visible:ring-destructive`).
   - Hiển thị thông báo lỗi ngay dưới ô nhập liệu kèm icon cảnh báo nhỏ: `<p className="text-xs text-destructive flex items-center gap-1 mt-1"><AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errorMsg}</p>`.
2. **Placeholder vs Value**:
   - Phân biệt rõ ràng độ tương phản:
     * Chữ gợi ý (Placeholder): Màu xám nhạt (`text-muted-foreground placeholder:text-muted-foreground/60`).
     * Chữ người dùng nhập vào (Value): Màu đậm, sắc nét, tương phản cao (`text-foreground font-medium`).
3. **Ký tự bắt buộc (Required Fields)**:
   - Trường bắt buộc phải có dấu sao đỏ `*` cạnh nhãn: `<label className="text-sm font-medium">Tiêu đề <span className="text-destructive">*</span></label>`.
4. **Định dạng đặc biệt**:
   - **Mật khẩu (Password)**: Bắt buộc có nút toggle icon mắt (Eye / EyeOff) để ẩn/hiện mật khẩu.
   - **Số (Number Input)**: Ẩn nút mũi tên mặc định xấu xí của trình duyệt (`[appearance:textfield]`), tích hợp nút tăng giảm tuỳ chỉnh hoặc validate số nguyên/số thực rõ ràng.
   - **Ngày tháng (DatePicker & DateRangePicker)**:
      * **Tuyệt đối CẤM `<input type="date">` native** trên toàn bộ hệ thống vì không tương thích Cyberpunk theme và gây vỡ layout trên các hệ điều hành khác nhau.
      * **Bắt buộc sử dụng `DatePicker` / `DateRangePicker`** từ `@/components/ui/DatePicker`.
      * **Quy cách UI/UX**:
        - Popover gắn qua `createPortal(..., document.body)` chống bị che cắt bởi container `overflow-hidden`.
        - Tự động phát hiện mép viewport để lật ngược lên trên (`flip`) hoặc căn lề phải (`align="right"`).
        - Đóng mượt mà khi bấm phím `Escape` hoặc click ra ngoài (`mousedown`).
        - Lưới lịch 7 ngày trực quan (`T2..CN` / `Mo..Su`), đánh dấu chấm phát sáng Today.
        - Khoảng ngày chọn có gradient highlight (bắt đầu bo tròn trái, kết thúc bo tròn phải, giữa phủ cyan nhẹ).
        - Hiệu ứng **Hover Range Preview** xem trước dải ngày trước khi click chốt.
        - Tích hợp thanh phím tắt chọn nhanh (Presets: Hôm nay, 7 ngày, 30 ngày, Tuần này, Tháng này).
        - Hiển thị ngày tháng người dùng theo định dạng chuẩn `DD/MM/YYYY`, lưu trữ và gửi API chuẩn ISO `YYYY-MM-DD`.
5. **Đồng Bộ Chiều Cao Các Ô Cùng Hàng (Uniform Field Height Across Rows - BẮT BUỘC)**:
   - **Quy tắc bất biến**: Mọi ô nhập liệu (`Input`, `Select`, `DatePicker`, các nút radio chọn dạng card button...) khi đặt trên **cùng một hàng** (`grid-cols-2`, `grid-cols-3`...) **BẮT BUỘC PHẢI CÓ CHIỀU CAO BẰNG NHAU TUYỆT ĐỐI**. Tuyệt đối không để xảy ra tình trạng ô cao ô thấp làm lệch lạc hàng lối.
   - **Kích thước chuẩn hóa**:
     * Chiều cao ô nhập / nút chọn: `h-[42px] sm:h-[46px]` (padding `px-4 py-2.5 sm:py-3 text-sm rounded-xl`).
     * Nhãn label: Đồng bộ dùng class `text-xs sm:text-sm font-medium text-foreground/90 select-none flex items-center gap-1` kèm dấu sao đỏ `*` nếu required. Tuyệt đối không nhét thêm icon tự chế vào nhãn làm lệch dòng nhãn.
     * Khoảng cách giữa nhãn và ô nhập: Đồng bộ `gap-1.5`.
     * Thông báo lỗi: Đồng bộ `text-xs text-danger flex items-center gap-1.5 mt-0.5 animate-fadeIn` kèm icon `<AlertCircle className="w-3.5 h-3.5 shrink-0" />`.

---

## 📱 5. Hệ thống lưới & Đáp ứng (Grid & Responsive)

1. **Breakpoints chuẩn hóa**:
   - Mobile nhỏ / tiêu chuẩn: `< 640px` (sm) hoặc `375px - 425px`.
   - Tablet: `768px` (md) đến `1024px` (lg).
   - Desktop tiêu chuẩn: `1024px` (lg) đến `1280px` (xl).
   - Desktop màn hình rộng: `1440px` trở lên (`2xl:`).
2. **Thay đổi Layout mượt mà**:
   - Khi thu nhỏ màn hình:
     * Thanh điều hướng / Sidebar chuyển thành menu ngăn kéo di động (**Drawer / Sheet / Hamburger menu**).
     * Bố cục lưới 4 cột chuyển thành 2 cột trên tablet (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`).
     * Các form 2 cột chuyển thành 1 cột xếp dọc trên mobile (`grid-cols-1 md:grid-cols-2`).
     * Nút thao tác nhóm (Action bar) từ hàng ngang chuyển thành menu thả xuống ba chấm `...` (MoreHorizontal) trên mobile.
3. **Quy chuẩn Sidebar Bên Phải (Right Sidebar / Cột phụ / Panel chi tiết)**:
   - **Không có viền bao quanh (Borderless Container)**: Bỏ hoàn toàn viền bao quanh (`border`, `border-white/10`, `border-slate-200` ở container ngoài cùng) cho khu vực sidebar/panel bên phải để tối ưu tối đa chiều rộng (width) hiển thị nội dung, tránh hiện tượng khung lồng trong khung gây chật chội.
   - **Phân tách không gian**: Phân tách với vùng nội dung chính bằng khoảng cách layout tự nhiên (`gap-6` / `gap-8`) hoặc lớp phủ nền nhẹ/mờ, giữ cho giao diện thoáng đãng, hiện đại.

---

## 🎨 6. Hệ thống thiết kế (Design System) & Tài nguyên

1. **Typography (Chữ viết)**:
   - Sử dụng font chữ hiện đại (Inter / Roboto / Plus Jakarta Sans).
   - Phân cấp kích thước font rõ ràng:
     * Heading: `text-2xl font-bold` (H1), `text-xl font-semibold` (H2), `text-lg font-medium` (H3).
     * Body: `text-base` hoặc `text-sm` với khoảng cách dòng thoáng đãng (`leading-relaxed`).
     * Caption / Subtext: `text-xs text-muted-foreground`.
2. **Color Palette (Bảng màu thống nhất)**:
   - Màu chủ đạo (**Primary**): Nhận diện thương hiệu NexCampus.
   - Màu phụ (**Secondary / Muted**): Phông nền phụ, viền thẻ card, ô tìm kiếm.
   - Màu trạng thái nghiệp vụ chuẩn:
     * Thành công (**Success**): Xanh lá (`text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40`).
     * Cảnh báo (**Warning**): Vàng / Hổ phách (`text-amber-600 bg-amber-50 dark:bg-amber-950/40`).
     * Lỗi / Nguy hiểm (**Error / Destructive**): Đỏ (`text-destructive bg-destructive/10`).
     * Thông tin (**Info**): Xanh dương / Cyan (`text-sky-600 bg-sky-50 dark:bg-sky-950/40`).
3. **Icons & Images (Hình ảnh & Biểu tượng)**:
   - Sử dụng thống nhất bộ icon vector SVG từ thư viện **`lucide-react`**, kích thước chuẩn `w-4 h-4` (nút/inline) hoặc `w-5 h-5` (heading/card header).
   - Thêm `shrink-0` cho icon khi đặt cạnh text để tránh bị co méo.
   - Hình ảnh minh họa (Illustrations / Avatars) có placeholder loading, tỉ lệ khung hình cố định (`aspect-video`, `aspect-square`) và xử lý fallback nếu link ảnh hỏng.
4. **Thẻ Thống Kê & Hiệu Ứng Hover (Stat Cards & Micro-interactions)**:
   - Toàn bộ thẻ thống kê dùng `<MetalCard>` (dashboard, admin-team, leaders, interns, onboarding...) bắt buộc có hiệu ứng micro-interaction đồng bộ khi hover.
   - Khung chứa icon BẮT BUỘC có các lớp: `transition-all duration-500 group-hover:rotate-6 group-hover:scale-110`.
   - Kết hợp với hiệu ứng nâng nhẹ (`hover:-translate-y-1`) và dải sáng kim loại quét qua (`group-hover:left-[130%]`) của `MetalCard` để tạo cảm giác sống động, thống nhất toàn hệ thống.
   - **Bố cục Mobile (Tối thiểu 2 thẻ / hàng & Xử lý số lượng lẻ)**:
     * Trên màn hình di động (`< md`), lưới thống kê **BẮT BUỘC hiển thị tối thiểu 2 thẻ trên một hàng**: `grid grid-cols-2 gap-3 sm:gap-4 md:...` thay vì chỉ để `grid` mặc định rơi về 1 cột dọc làm chiếm diện tích màn hình.
     * **Xử lý số lượng thẻ lẻ (`cards.length % 2 !== 0`)**: Khi tổng số thẻ là số lẻ (3, 5, 7 thẻ...), **thẻ đầu tiên BẮT BUỘC chiếm trọn vẹn toàn bộ hàng đầu tiên trên mobile (`col-span-2 md:col-span-1`)** để làm thẻ Headline KPI, các thẻ còn lại ghép đôi 2 thẻ / hàng đều đặn.
     * **Sizing responsive tối ưu cho 2 cột trên mobile**:
       - Padding thẻ: `p-4 sm:p-5 lg:p-6`
       - Kích thước số hiển thị: `text-2xl sm:text-4xl lg:text-5xl font-bold leading-none`
       - Khung chứa icon: `h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 rounded-xl sm:rounded-2xl` kèm `shrink-0`
       - Kích thước icon: `h-5 w-5 sm:h-6 sm:w-6`
       - Tiêu đề card: `text-[11px] sm:text-xs font-medium uppercase tracking-[0.1em] sm:tracking-[0.2em] text-muted truncate` (hoặc `line-clamp-2`)
       - Đường line phân cách: `mt-3 sm:mt-4 h-[2px] w-10 sm:w-16 rounded-full`

