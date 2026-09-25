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

---

## Chạy Kiểm Thử Tự Động (Automated Evaluation Runner)

Dự án cung cấp bộ script kiểm thử tự động toàn diện tại [`scripts/run-ai-evals.ts`](file:///d:/NodeJS/NexCampus/NexCampus-FE/scripts/run-ai-evals.ts).

### Lệnh thực thi:

```bash
pnpm run test:ai
```

### Các Suite được kiểm tra tự động:
1. **Weekly Evaluation AI Scenarios (`ai/evals/tests/test-ai-evaluation-ui-scenarios.json`)**:
   - `TC_UI_EVAL_01`: Điền tự động 12 tiêu chí, tính toán điểm 3 nhóm, gán 12 AI badge.
   - `TC_UI_EVAL_02`: Phục hồi lỗi an toàn khi API 502/Timeout, toast cảnh báo, không crash màn hình.
   - `TC_UI_EVAL_03`: Human-in-the-loop: Gỡ bỏ badge khi Leader can thiệp sửa điểm, tính lại điểm tức thì.
2. **Task Allocation AI Scenarios (`ai/evals/tests/test-ai-allocation-ui-scenarios.json`)**:
   - `TC_UI_ALLOC_01`: Cảnh báo quá tải khi tải >= 80% (riskLevel = HIGH, banner đỏ).
   - `TC_UI_ALLOC_02`: Xử lý an toàn khi Support null, không crash, banner xanh LOW.
   - `TC_UI_ALLOC_03`: Kiểm tra tỷ lệ 4 trọng số (Workload 30%, Skill 25%, Performance 25%, Learning 20%).
3. **Task Prompts Integrity & Schema (`ai/prompts/tasks/*.md`)**:
   - Kiểm tra tính đầy đủ cấu trúc 6 phần, Persona, Input JSON, Output Schema, Business Logic.
4. **Chấm điểm Frontend AI UX Scorecard 100 Điểm**:
   - Tự động đánh giá 5 nhóm tiêu chuẩn UX và ghi nhận telemetry trace vào `ai/evals/traces/`.

