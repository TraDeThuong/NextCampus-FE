# Quy Tắc Hiển Thị Đề Xuất Phân Bổ Công Việc (AI Task Allocation UI Rules)

Quy chuẩn dành cho các component modal phân công task (`app/[locale]/(dashboard)/leader/tasks`):

## 1. Hiển thị Ứng viên Đề xuất
- **Owner đề xuất**: Được highlight rõ ràng kèm tỷ lệ phần trăm tương thích (`compatibilityScore%`) và badge vai trò màu xanh dương (`bg-blue-100 text-blue-800`).
- **Support đề xuất**: Được hiển thị với badge màu tím (`bg-purple-100 text-purple-800`) kèm lý do kèm cặp/học tập.

## 2. Cảnh báo Mức độ Rủi ro (Risk Level Banner)
- **Rủi ro cao (`HIGH`)**:
  - Khi ứng viên có `activeTaskDays + estDays >= 80% maxWorkloadDays`.
  - Hiển thị banner cảnh báo viền đỏ nổi bật (`border-l-4 border-red-500 bg-red-50 text-red-700`).
  - Text: *"Cảnh báo quá tải: Ứng viên đã vượt 80% công suất tối đa của Task Group. Cân nhắc đổi Owner hoặc giảm tải task khác."*
- **Rủi ro vừa phải (`MEDIUM`)**: Banner vàng (`border-amber-500 bg-amber-50 text-amber-700`).
- **Rủi ro an toàn (`LOW`)**: Banner xanh lá (`border-emerald-500 bg-emerald-50 text-emerald-700`).

## 3. Lý do & Cơ hội học tập (Explainability)
- Hiển thị danh sách 2-3 gạch đầu dòng giải thích lý do backend đề xuất (kinh nghiệm module, điểm code, thời gian trống).
- Ô hiển thị mục **Cơ hội học tập (Learning Opportunity)** giúp Leader nắm được giá trị phát triển nhân sự khi giao việc này.

## 4. Quyền quyết định cuối cùng (Human-in-the-loop)
- AI chỉ đóng vai trò **gợi ý**. Giao diện phải cung cấp nút chọn thủ công (Dropdown chọn Intern khác) để Leader có quyền thay đổi Owner/Support theo ý muốn trước khi bấm nút "Lưu phân công".
