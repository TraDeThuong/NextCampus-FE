# Thư mục `NexCampus-FE/ai/evals/` — Kiểm Định Chất Lượng Giao Diện AI

Thư mục này thiết lập các tiêu chuẩn đánh giá và kịch bản kiểm thử trải nghiệm người dùng (UX) khi tương tác với các tính năng AI trên frontend NexCampus.

## Cấu trúc thư mục

```text
evals/
├── tests/           # Kịch bản kiểm thử hành vi UI (loading, auto-fill, error toast)
├── traces/          # Nhật ký telemetry đo đạc độ trễ và tỷ lệ chấp nhận gợi ý
└── scorecards/      # Bảng chấm điểm 100 điểm cho UI/UX tích hợp AI
```

## Các tài liệu chính
- `frontend-ai-ux-scorecard-100.md`: Bảng chấm điểm chuẩn 100 điểm với 5 tiêu chí: Trạng thái tải (25đ), Minh bạch nhãn AI (25đ), Quyền kiểm soát của con người (20đ), Xử lý lỗi an toàn (20đ), Thẩm mỹ & Accessibility (10đ). Ngưỡng đạt: **>= 80/100**.
- `evaluation-modal-ux-rubric.md`: Rubric chuyên biệt cho Modal đánh giá tuần.
- `task-allocation-modal-ux-rubric.md`: Rubric chuyên biệt cho Modal phân công công việc.
