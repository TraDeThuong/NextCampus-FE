# Thư mục `NexCampus-FE/ai/data/` — Dữ liệu & Cấu hình Giao diện AI

Thư mục này lưu trữ tài liệu đặc tả giao diện và các tệp JSON cấu hình hiển thị (UI configs) cho các tính năng AI phía Client của NexCampus.

## Cấu trúc thư mục

```text
data/
├── raw/                 # Tài liệu đặc tả giao diện gốc
└── processed/           # Cấu hình UI và nhãn hiển thị dạng JSON
```

## 1. `raw/`
Lưu trữ các bản đặc tả giao diện và luồng người dùng (User Flows):
- `2026-08-08_nexcampus-task-spec_v01.md`: Đặc tả màn hình phân công task, ô giao việc inline và modal AI phân bổ.
- `2026-08-08_nexcampus-weekly-evaluation-spec_v01.md`: Đặc tả modal chấm 12 tiêu chí, nút "Nhận gợi ý từ AI", so sánh điểm gốc vs điểm chỉnh sửa.
- `2026-08-08_nexcampus-daily-report-spec_v01.md`: Đặc tả lịch báo cáo ngày và nguồn dữ liệu tuần.

## 2. `processed/`
- `evaluation-criteria-ui-config.json`: Định nghĩa 12 tiêu chí, nhóm I/II/III, tooltip mô tả, nhãn tiếng Việt và màu sắc badge Tailwind CSS theo 5 mức điểm (`TOT`, `KHA`, `TB`, `TBY`, `YEU`).
- `task-allocation-ui-config.json`: Định nghĩa màu sắc và nội dung cảnh báo cho các mức rủi ro quá tải (`HIGH`, `MEDIUM`, `LOW`), nhãn vai trò Owner/Support.
