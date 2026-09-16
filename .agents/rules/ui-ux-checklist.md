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
   - Phân trang: Hiển thị rõ số dòng đang xem (VD: "Hiển thị 1-10 trên 120 kết quả"), nút Previous/Next tự động disable khi ở trang đầu/trang cuối, hiển thị nút số trang gọn gàng.
   - Trạng thái rỗng (**Empty State**): Khi bảng không có dữ liệu, hiển thị hình minh họa hoặc icon trang trống kèm thông điệp rõ ràng (VD: *"Chưa có công việc nào"*) cùng nút kêu gọi hành động (Call To Action - CTA) như *"Tạo công việc mới"*.
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
   - **Ngày tháng (Datepicker)**: Sử dụng calendar popover trực quan, hiển thị ngày theo định dạng tiếng Việt `DD/MM/YYYY`, khóa không cho chọn ngày bất hợp lệ (quá khứ, cuối tuần) theo nghiệp vụ.

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
