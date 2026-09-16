# Bộ Hướng Dẫn Agent Của NexCampus Frontend

Thư mục này quản lý toàn bộ quy ước kỹ thuật, quyết định kiến trúc và bộ nhớ dài hạn dành cho AI Agent khi làm việc trong repository `NexCampus-FE/`.

## Cấu trúc thư mục

```text
NexCampus-FE/.agents/
├── README.md              # Sơ đồ và hướng dẫn bảo trì
├── project.md             # Bối cảnh, công nghệ và cấu trúc runtime Next.js 16
├── memory.md              # Các quyết định bền vững đã được xác nhận của Frontend
└── rules/
    ├── architecture.md    # Phân tầng: Page -> Hook -> Service -> Axios
    ├── frontend.md        # Quy ước Next.js 16 App Router, Client vs Server components, Tailwind 4
    ├── tech-defaults.md   # TypeScript strict, Zod form, Date/Time Asia/Ho_Chi_Minh
    └── workflow.md        # Quy trình khảo sát, code, lint, build và bàn giao
```

## Nguyên tắc bảo trì
- Khi chốt một quyết định UI/UX hoặc kiến trúc mới có hiệu lực dài lâu (VD: quy ước icon, padding, token), ghi nhận ngay vào `memory.md`.
- File `AGENTS.md` tại thư mục gốc của repo là cổng chào tự động nạp các tài liệu trong thư mục này.
