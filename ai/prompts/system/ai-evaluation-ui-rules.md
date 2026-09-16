# Quy Tắc Hiển Thị Giao Diện Gợi Ý Đánh Giá Tuần (AI Evaluation UI Rules)

Quy chuẩn dành cho các component thuộc module Đánh giá tuần (`app/[locale]/(dashboard)/leader/weekly-evaluation`):

## 1. Trạng thái Gợi ý & Nhãn "AI"
- Khi Leader bấm **"Nhận gợi ý từ AI"** trong modal tạo/sửa đánh giá:
  - Hiển thị trạng thái loading spinner trên nút ("Đang phân tích báo cáo ngày...").
  - Tự động điền các mức điểm gợi ý vào 12 bộ chọn mức điểm.
  - Các mức điểm trùng khớp với gợi ý AI được gắn thêm **Badge "AI"** nhỏ màu xanh indigo bên cạnh nhãn điểm để Leader nhận biết.
- Nếu Leader tự tay click đổi sang mức điểm khác:
  - Badge "AI" ở mức cũ biến mất, tiêu chí đó được đánh dấu là "Leader đã điều chỉnh".

## 2. Nhận xét & Tính Minh Bạch (Transparency)
- Hiển thị nút liên kết nhanh **"Dùng nhận xét của AI"** ngay cạnh ô nhập Textarea Nhận xét. Khi bấm, chép nội dung gợi ý vào ô nhập.
- Trên trang Chi tiết đánh giá (`/leader/weekly-evaluation/[id]`):
  - Hiển thị cột so sánh **"Điểm thực tế"** cạnh **"AI đề xuất"** để thấy sự cân nhắc của Leader.
  - Nếu Leader đã sửa nhận xét khác với AI, hiển thị thêm mục mở rộng dạng accordion: **"Nhận xét gốc từ AI"** để minh bạch phần nào do AI gợi ý, phần nào do con người chỉnh sửa.

## 3. Quyền hạn của Thực tập sinh (Intern View)
- Intern chỉ được xem kết quả đánh giá, biểu đồ tiến bộ 6 tuần gần nhất và bấm nút **"Đã xem đánh giá"**.
- Tuyệt đối **KHÔNG** hiển thị các nút gọi AI hoặc các ô chỉnh sửa điểm trên giao diện của Intern.
