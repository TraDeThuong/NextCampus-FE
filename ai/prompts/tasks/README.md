# Thư Mục `NexCampus-FE/ai/prompts/tasks/` — Danh Mục Prompt Tác Vụ Cụ Thể Phía Client

Thư mục này quản lý toàn bộ các bản đặc tả Prompt chi tiết cho từng tác vụ AI nghiệp vụ cụ thể trong hệ thống NexCampus Frontend và Client-side Copilot.

---

## Danh Sách Các Prompt Tác Vụ

| Mã Tác Vụ | File Prompt | Module Áp Dụng | Mô Tả Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `TASK_SUMMARIZE_DAILY_REPORTS` | [`summarize-daily-reports.md`](file:///d:/NodeJS/NexCampus/NexCampus-FE/ai/prompts/tasks/summarize-daily-reports.md) | Leader / Weekly Evaluation | Tóm tắt chuỗi báo cáo ngày (T2 - T6) của TTS, trích xuất điểm nổi bật, khó khăn/blocker và kỷ luật. |
| `TASK_GENERATE_WEEKLY_EVALUATION_FEEDBACK` | [`generate-weekly-evaluation-feedback.md`](file:///d:/NodeJS/NexCampus/NexCampus-FE/ai/prompts/tasks/generate-weekly-evaluation-feedback.md) | Leader / Weekly Evaluation | Sinh nhận xét tuần toàn diện 3 phần (Ưu điểm, Điểm cần cải thiện, Định hướng tuần tới) và quick tags. |
| `TASK_EXPLAIN_TASK_ALLOCATION` | [`explain-task-allocation.md`](file:///d:/NodeJS/NexCampus/NexCampus-FE/ai/prompts/tasks/explain-task-allocation.md) | Leader / Tasks | Phân tích và giải thích đề xuất Owner/Support theo 4 trọng số, tính toán rủi ro quá tải (LOW/MEDIUM/HIGH). |
| `TASK_GROUP_AUTO_ALLOCATION` | [`task-group-auto-allocation.md`](file:///d:/NodeJS/NexCampus/NexCampus-FE/ai/prompts/tasks/task-group-auto-allocation.md) | Leader / Tasks / Task Groups | Phân bổ tự động hàng loạt toàn bộ task trong một Task Group, cân bằng tải và tối ưu kỹ năng đội ngũ. |

---

## Tiêu Chuẩn Thiết Kế Prompt Tác Vụ

Mỗi file prompt trong thư mục này đều được chuẩn hóa theo cấu trúc 6 phần nghiêm ngặt:
1. **Mục Tiêu & Vai Trò (Objective & Persona):** Định vị ngữ cảnh, vai trò trợ lý chuyên môn cao.
2. **Dữ Liệu Đầu Vào (Input Specification):** Schema JSON mô tả cấu trúc payload truyền vào.
3. **Quy Tắc Nghiệp Vụ & Xử Lý Tình Huống (Business Logic & Edge Cases):** Hướng dẫn xử lý trường hợp thiếu dữ liệu, rủi ro cao, không có báo cáo ngày.
4. **Định Dạng Đầu Ra Kỳ Vọng (Output JSON Schema):** Schema JSON chuẩn hóa tuyệt đối để Client/Backend parse an toàn.
5. **Danh Mục Enum Chuẩn:** Quy định các giá trị hữu hạn (`EXCELLENT`, `HIGH`, `TECHNICAL`...).
6. **Tiêu Chuẩn Đánh Giá Trải Nghiệm UI/UX & Scorecard:** Đo lường theo thang điểm 100 của hệ thống.
