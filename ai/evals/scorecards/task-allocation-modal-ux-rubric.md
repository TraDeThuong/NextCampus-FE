# Rubric Đánh Giá UX: Modal Phân Công Task AI (Task Allocation Modal UX Rubric)

Áp dụng cho modal gợi ý phân công công việc tại `app/[locale]/(dashboard)/leader/tasks`:

## Các tiêu chí nghiệm thu bắt buộc (Pass/Fail Criteria)

1. **Hiển thị Badge Rủi ro Quá tải (`riskLevel`)**:
   - Nếu `riskLevel === "HIGH"`: Bắt buộc render Banner màu đỏ kèm icon `AlertTriangle` và dòng cảnh báo vượt 80% tải.
   - Nếu `riskLevel === "LOW"`: Render Badge màu xanh lá an toàn.

2. **Khả năng chọn người thay thế**:
   - Mặc dù AI đề xuất Owner và Support, giao diện phải hiển thị dưới dạng ô Dropdown có thể chọn bất kỳ Intern nào khác trong nhóm.

3. **Hiển thị lý do & cơ hội học tập**:
   - Hiển thị danh sách gạch đầu dòng ngắn gọn, không bị tràn màn hình (overflow), hỗ trợ responsive trên mobile/tablet.

4. **Nút Xác nhận & Hủy**:
   - Nút "Áp dụng phân công": Gọi API phân công.
   - Nút "Hủy": Đóng modal và giữ nguyên trạng thái task cũ.
