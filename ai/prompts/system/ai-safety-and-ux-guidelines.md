# Quy Chuẩn An Toàn & Trải Nghiệm Người Dùng Với AI (AI Safety & UX Guidelines)

Quy định chung cho toàn bộ các tương tác với tính năng AI trên giao diện NexCampus:

## 1. Nguyên Tắc "Con Người Quyết Định" (Human-in-the-loop)
- AI **KHÔNG BAO GIỜ** tự động thực hiện thao tác lưu (Auto-save) dữ liệu vào database mà không có sự xác nhận của người dùng.
- Mọi kết quả từ AI (điểm số, nhận xét, người nhận việc) chỉ được hiển thị ở dạng **Draft / Đề xuất** trên form để Leader rà soát, chỉnh sửa và bấm "Lưu".

## 2. Quản Lý Trạng Thái Chờ & Tải (Loading States)
- Khi gọi API AI (thường mất 1.5s - 4s do LLM sinh text):
  - Khóa (disable) nút gọi để chống double-click gửi nhiều request trùng lặp.
  - Hiển thị spinner hoặc hiệu ứng Skeleton dạng sóng (shimmer) tại các ô dự kiến điền kết quả.
  - Thông điệp thân thiện: *"AI đang phân tích dữ liệu hoạt động trong tuần..."*.

## 3. Xử Lý Lỗi Graceful & Phục Hồi (Error Handling & Fallback)
- Khi AI service gặp lỗi (500, 502, 504 Gateway Timeout hoặc quá tải hạn ngạch Gemini):
  - **KHÔNG** làm crash hoặc trắng trang (White Screen of Death).
  - Bắn thông báo Toast lịch sự: *"Không thể lấy gợi ý từ AI lúc này. Bạn vẫn có thể chấm điểm / phân công thủ công bình thường."*
  - Cho phép người dùng tiếp tục thao tác thủ công mà không bị chặn luồng nghiệp vụ.

## 4. Bảo Vệ Dữ Liệu Riêng Tư (Privacy on UI)
- Không in log raw prompt hoặc token API ra Console trình duyệt (`console.log`).
- Không hiển thị các thông tin nhạy cảm của người dùng khác trên màn hình gợi ý.
