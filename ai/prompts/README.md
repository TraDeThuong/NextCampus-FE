# Thư mục `NexCampus-FE/ai/prompts/` — Quy Chuẩn Hiển Thị & Trải Nghiệm AI

Thư mục này quản lý toàn bộ các quy tắc hiển thị, tiêu chuẩn tương tác người dùng (UI/UX) và các system prompts hỗ trợ tính năng AI trên giao diện NexCampus.

## Cấu trúc thư mục

```text
prompts/
├── system/      # Quy tắc nền tảng về hiển thị UI/UX cho từng tính năng AI
├── tasks/       # Nhiệm vụ cụ thể phía client (khởi tạo sẵn)
└── tools/       # Công cụ client-side (khởi tạo sẵn)
```

## Các tài liệu chính
- `ai-evaluation-ui-rules.md`: Hướng dẫn hiển thị gợi ý 12 tiêu chí, badge AI, đối chiếu điểm và nhận xét minh bạch.
- `ai-task-allocation-ui-rules.md`: Hướng dẫn hiển thị ứng viên Owner/Support, banner cảnh báo rủi ro quá tải (HIGH/MEDIUM/LOW).
- `ai-safety-and-ux-guidelines.md`: Quy chuẩn Human-in-the-loop, loading states, error toast fallback và bảo mật dữ liệu console.
