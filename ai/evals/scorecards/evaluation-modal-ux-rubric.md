# Rubric Đánh Giá UX: Modal Đánh Giá Tuần AI (Evaluation Modal UX Rubric)

Áp dụng cho modal tạo/sửa đánh giá tuần tại `app/[locale]/(dashboard)/leader/weekly-evaluation`:

## Các tiêu chí nghiệm thu bắt buộc (Pass/Fail Criteria)

1. **Nút "Nhận gợi ý từ AI"**:
   - Vị trí: Đặt nổi bật ở đầu form cạnh tiêu đề chọn tuần.
   - Khi click: Nút hiển thị loader icon + disabled.
   - Khi hoàn tất: Điền đồng loạt 12 tiêu chí + gắn nhãn badge "AI".

2. **Cơ chế "Dùng nhận xét của AI"**:
   - Link/Nút phụ cạnh nhãn "Nhận xét": Bấm vào là copy chuỗi comment AI vào Textarea mà không xóa các dữ liệu khác.
   - Textarea vẫn cho phép gõ thêm, xóa bớt nội dung tự do.

3. **Tính điểm tức thì (Real-time Calculation)**:
   - Khi các mức điểm thay đổi (do AI điền hoặc Leader chỉnh), điểm tổng trung bình và điểm 3 nhóm con tự động cập nhật ngay trên thanh tiến độ.

4. **Trường hợp lỗi từ server**:
   - Bắt lỗi Axios 500/502 -> Toast: *"Chưa thể kết nối AI. Bạn hãy chấm điểm thủ công nhé."*
   - Không reset các ô điểm người dùng đã chọn trước đó.
