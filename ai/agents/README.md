# Thư mục `NexCampus-FE/ai/agents/` — Quản Lý AI Agent & Kỹ Năng Giao Diện

Thư mục này quản lý các định nghĩa Agent và kỹ năng (skills) hỗ trợ người dùng trực tiếp trên giao diện web (Client-side AI Co-pilot / Assistant).

## Cấu trúc thư mục

```text
agents/
├── skills/      # Kỹ năng hỗ trợ UI tái sử dụng (khởi tạo sẵn)
└── tools/       # Công cụ client tương tác DOM / API (khởi tạo sẵn)
```

## Định hướng phát triển
- `skills/`: Dành cho các kỹ năng AI nâng cao hỗ trợ thao tác nhanh cho Leader:
  - `auto-fill-evaluation`: Kỹ năng tự động điền form và cảnh báo chênh lệch điểm.
  - `task-smart-assign`: Kỹ năng gợi ý ghép cặp nhân sự trực tiếp trên bảng Kanban/Table.
- `tools/`: Các function client-side cho phép AI tương tác an toàn với giao diện:
  - `copy-to-clipboard`: Sao chép nội dung gợi ý vào bộ nhớ đệm.
  - `highlight-element`: Làm nổi bật các trường cần Leader chú ý.
