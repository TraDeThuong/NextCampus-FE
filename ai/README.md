# NexCampus Frontend AI Architecture (`NexCampus-FE/ai`)

Thư mục `ai/` của `NexCampus-FE` được xây dựng theo chuẩn cấu trúc 4 thư mục dành cho ứng dụng web hiện đại, quản lý toàn bộ trải nghiệm người dùng, quy chuẩn hiển thị và kiểm định giao diện cho các tính năng AI của NexCampus.

---

## 1. Cấu trúc 4 thư mục

```text
ai/
├── prompts/       # Quản lý quy chuẩn UI/UX, nhãn AI và hướng dẫn tương tác
├── data/          # Quản lý tài liệu giao diện gốc (raw) và cấu hình hiển thị JSON (processed)
├── agents/        # Cấu hình kỹ năng hỗ trợ người dùng trực tiếp trên giao diện (skills/tools)
└── evals/         # Kiểm thử hành vi UI, telemetry đo độ trễ và thang điểm UX 100 điểm
```

---

## 2. Chi tiết các thành phần

### 1. `prompts/`
- `system/ai-evaluation-ui-rules.md`: Hướng dẫn hiển thị gợi ý đánh giá tuần, tự động gắn badge "AI" vào các mức điểm tương ứng, so sánh điểm gốc vs điểm điều chỉnh của Leader.
- `system/ai-task-allocation-ui-rules.md`: Hướng dẫn hiển thị đề xuất phân công, banner cảnh báo rủi ro quá tải (`HIGH` viền đỏ), tỷ lệ tương thích.
- `system/ai-safety-and-ux-guidelines.md`: Quy chuẩn Human-in-the-loop (không auto-save), trạng thái loading chống spam click, toast thông báo lỗi 502/timeout không làm trắng màn hình.

### 2. `data/`
- `raw/`: Lưu trữ các bản đặc tả màn hình (`task`, `weekly-evaluation`, `dashboard`).
- `processed/evaluation-criteria-ui-config.json`: Cấu hình 12 tiêu chí, 3 nhóm, tooltip giải thích, 5 mức xếp loại (`TOT`, `KHA`, `TB`, `TBY`, `YEU`) kèm màu sắc Tailwind CSS tương ứng.
- `processed/task-allocation-ui-config.json`: Cấu hình nhãn rủi ro (`HIGH`, `MEDIUM`, `LOW`) và màu sắc hiển thị.

### 3. `agents/`
- Chuẩn bị sẵn thư mục `skills/` và `tools/` đón đầu cho các tính năng Client-side AI Co-pilot trong tương lai.

### 4. `evals/`
- `scorecards/frontend-ai-ux-scorecard-100.md`: Bảng chấm điểm 100 điểm cho trải nghiệm AI (Ngưỡng đạt: >= 80 điểm).
- `tests/`: Kịch bản test UI khi AI trả về kết quả thành công, khi AI timeout/lỗi 502, khi người dùng can thiệp sửa điểm.
- `traces/sample-fe-ai-telemetry.json`: Mẫu telemetry đo thời gian render và tỷ lệ chấp thuận gợi ý của Leader.
