# Thang Điểm 100 Đánh Giá Trải Nghiệm Giao Diện AI (Frontend AI UX Scorecard)

Tài liệu này xác định các tiêu chí đo lường chất lượng giao diện (UI/UX) khi tích hợp các tính năng AI trong NexCampus Frontend, đảm bảo mang lại trải nghiệm mượt mà, minh bạch và an toàn cho người dùng.

> **NGƯỠNG CHẤP THUẬN (PASS THRESHOLD)**: **>= 80 / 100 điểm**  
> Bất kỳ lỗi nào làm trắng trang (Crash/White Screen) khi API AI lỗi sẽ bị đánh trượt ngay lập tức (FAIL).

---

## Bảng Tiêu Chí Chấm Điểm Tổng Quan

| STT | Nhóm Tiêu Chí | Trọng Số | Mô Tả Trọng Tâm |
|:---:|---------------|:--------:|-----------------|
| 1 | **Xử lý trạng thái tải & Phản hồi (Loading & Responsiveness)** | **25 điểm** | Spinner rõ ràng, disable nút chống spam click, skeleton placeholder |
| 2 | **Minh bạch & Nhận diện nguồn AI (Transparency & Attribution)** | **25 điểm** | Gắn badge "AI" rõ ràng, so sánh điểm gốc vs điểm điều chỉnh |
| 3 | **Khả năng kiểm soát của người dùng (Human Control)** | **20 điểm** | Không auto-save; người dùng sửa được mọi trường trước khi lưu |
| 4 | **Phục hồi lỗi & Thông báo (Error Handling & Graceful Fallback)** | **20 điểm** | Báo lỗi Toast lịch sự khi 500/502/timeout, không làm gián đoạn form |
| 5 | **Tính dễ tiếp cận & Thẩm mỹ (Accessibility & Design Consistency)** | **10 điểm** | Chuẩn token Tailwind, màu tương phản tốt, tooltip giải thích rõ |

---

## Chi Tiết Đánh Giá

### 1. Xử lý trạng thái tải & Phản hồi (25 điểm)
- **25 điểm**: Nút hiển thị spinner và đổi text ("Đang phân tích..."), khóa nút trong lúc gọi API, form không bị giật lag khi kết quả đổ về.
- **10 - 15 điểm**: Có loading nhưng nút vẫn click được (nguy cơ gửi request trùng).
- **0 điểm**: Không có hiệu ứng loading, giao diện bị đơ (freeze) khi chờ API phản hồi.

### 2. Minh bạch & Nhận diện nguồn AI (25 điểm)
- **25 điểm**: Mức điểm gợi ý có badge "AI" nhỏ phân biệt; khi sửa thì mất badge; trang chi tiết hiển thị rõ nhận xét gốc AI và điểm thực tế của Leader.
- **10 - 15 điểm**: Gợi ý xong không có dấu hiệu nhận biết trường nào là AI điền, trường nào con người chọn.
- **0 điểm**: Ẩn giấu hoàn toàn nguồn gốc dữ liệu gợi ý.

### 3. Khả năng kiểm soát của người dùng (20 điểm)
- **20 điểm**: AI chỉ điền vào form; Leader toàn quyền đổi điểm, sửa từng câu chữ nhận xét, bấm "Lưu" thì mới gọi API submit.
- **0 điểm**: Tự động lưu thẳng vào database khi AI phản hồi xong.

### 4. Phục hồi lỗi & Thông báo (20 điểm)
- **20 điểm**: Khi API AI trả về lỗi (timeout, quota limit): hiện toast cảnh báo nhẹ nhàng, cho phép tiếp tục thao tác thủ công.
- **0 điểm**: Ném lỗi uncaught error ra console làm hỏng React component tree, trắng màn hình.

### 5. Thẩm mỹ & Dễ tiếp cận (10 điểm)
- **10 điểm**: Màu sắc badge hài hòa, tuân thủ design system Tailwind 4 trong `app/globals.css`, hỗ trợ cả Dark/Light mode.
