# Thư mục `NexCampus-FE/ai/prompts/` — Quy Chuẩn Hiển Thị & Trải Nghiệm AI

Thư mục này quản lý toàn bộ các quy tắc hiển thị, tiêu chuẩn tương tác người dùng (UI/UX) và các system prompts hỗ trợ tính năng AI trên giao diện NexCampus.

## Cấu trúc thư mục

```text
prompts/
├── system/      # Quy tắc nền tảng về hiển thị UI/UX cho từng tính năng AI
├── tasks/       # Nhiệm vụ nghiệp vụ cụ thể (tóm tắt báo cáo, nhận xét, phân công)
└── tools/       # Công cụ client-side (khởi tạo sẵn)
```

## Các tài liệu chính

### 1. Quy chuẩn Hệ thống (`prompts/system/`)
- [`ai-evaluation-ui-rules.md`](file:///d:/NodeJS/NexCampus/NexCampus-FE/ai/prompts/system/ai-evaluation-ui-rules.md): Hướng dẫn hiển thị gợi ý 12 tiêu chí, badge AI, đối chiếu điểm và nhận xét minh bạch.
- [`ai-task-allocation-ui-rules.md`](file:///d:/NodeJS/NexCampus/NexCampus-FE/ai/prompts/system/ai-task-allocation-ui-rules.md): Hướng dẫn hiển thị ứng viên Owner/Support, banner cảnh báo rủi ro quá tải (HIGH/MEDIUM/LOW).
- [`ai-safety-and-ux-guidelines.md`](file:///d:/NodeJS/NexCampus/NexCampus-FE/ai/prompts/system/ai-safety-and-ux-guidelines.md): Quy chuẩn Human-in-the-loop, loading states, error toast fallback và bảo mật dữ liệu console.

### 2. Prompt Tác vụ Cụ thể (`prompts/tasks/`)
- [`summarize-daily-reports.md`](file:///d:/NodeJS/NexCampus/NexCampus-FE/ai/prompts/tasks/summarize-daily-reports.md): Tóm tắt báo cáo ngày trong tuần, trích xuất điểm nổi bật, blocker và kỷ luật.
- [`generate-weekly-evaluation-feedback.md`](file:///d:/NodeJS/NexCampus/NexCampus-FE/ai/prompts/tasks/generate-weekly-evaluation-feedback.md): Sinh nhận xét đánh giá tuần mang tính xây dựng (Ưu điểm, Điểm hoàn thiện, Mục tiêu tuần tới).
- [`explain-task-allocation.md`](file:///d:/NodeJS/NexCampus/NexCampus-FE/ai/prompts/tasks/explain-task-allocation.md): Phân tích điểm tương thích 4 trọng số và giải thích lý do đề xuất Owner/Support kèm rủi ro tải.
- [`task-group-auto-allocation.md`](file:///d:/NodeJS/NexCampus/NexCampus-FE/ai/prompts/tasks/task-group-auto-allocation.md): Thuật toán phân bổ tự động hàng loạt toàn bộ task trong một Task Group.

