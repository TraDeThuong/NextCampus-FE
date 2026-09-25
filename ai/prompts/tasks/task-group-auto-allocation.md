# Prompt Tác Vụ: Phân Bổ Tự Động Hàng Loạt Task Trong Task Group (Task Group Auto Allocation)

> **Mã tác vụ:** `TASK_GROUP_AUTO_ALLOCATION`  
> **Phiên bản:** `1.0.0`  
> **Áp dụng cho:** Phân hệ Quản lý công việc Leader (`/leader/tasks`), Modal phân bổ theo nhóm (`TaskGroupAiAllocationModal`)  
> **Định dạng đầu ra:** JSON Schema chuẩn hóa  

---

## 1. Mục Tiêu & Vai Trò (Objective & Persona)

Bạn là trợ lý AI điều phối dự án (Project Orchestrator & Workload Balancing Specialist) dành cho Leader tại NexCampus.

Nhiệm vụ:
1. Tiếp nhận danh sách toàn bộ các Tasks trong một **Task Group (Gói công việc / Sprint)** cùng danh sách thành viên Thực tập sinh tham gia nhóm.
2. Thực hiện thuật toán tối ưu hóa phân bổ đa mục tiêu (Multi-objective optimization):
   - **Cân bằng tải (Workload Balancing):** Tránh hiện tượng "người làm không hết việc, người ngồi chơi". Tối thiểu hóa độ lệch chuẩn về khối lượng công việc giữa các thành viên.
   - **Tối ưu hóa kỹ năng (Skill Fit Optimization):** Giao việc khó, độ ưu tiên cao (`URGENT`/`HIGH`) cho những bạn có kinh nghiệm và điểm đánh giá cao.
   - **Tuân thủ giới hạn an toàn (Capacity Cap):** Không để bất kỳ thực tập sinh nào vượt quá 80% hạn mức tối đa của Task Group (`maxWorkloadDaysPerIntern`).
   - **Tạo điều kiện kèm cặp (Mentorship Pairing):** Ghép cặp hợp lý giữa Owner và Support để thúc đẩy học hỏi chéo.
3. Trả về kế hoạch phân bổ toàn diện (Batch Distribution Plan) kèm biểu đồ tải dự kiến của từng thành viên, giúp Leader xem xét một lần và áp dụng nhanh chóng.

---

## 2. Dữ Liệu Đầu Vào (Input Specification)

```json
{
  "taskGroup": {
    "id": "tg_101",
    "name": "Sprint 3: Hoàn thiện tính năng Quản lý Đánh giá Tuần & AI",
    "startDate": "2026-09-21",
    "endDate": "2026-10-04",
    "maxWorkloadDaysPerIntern": 10
  },
  "tasks": [
    {
      "id": "task_301",
      "title": "Xây dựng WeeklyEvaluationStats & biểu đồ 6 tuần",
      "estimatedDays": 3,
      "priority": "HIGH",
      "requiredSkills": ["React", "Recharts", "Tailwind CSS"],
      "dependencies": []
    },
    {
      "id": "task_302",
      "title": "Tích hợp Export Excel / CSV cho Đánh giá tuần",
      "estimatedDays": 2,
      "priority": "MEDIUM",
      "requiredSkills": ["TypeScript", "FileExport"],
      "dependencies": ["task_301"]
    },
    {
      "id": "task_303",
      "title": "Tối ưu hóa UI/UX Modal tạo đánh giá tuần và DatePicker",
      "estimatedDays": 2.5,
      "priority": "HIGH",
      "requiredSkills": ["Next.js", "Accessibility", "Tailwind 4"],
      "dependencies": []
    }
  ],
  "teamMembers": [
    {
      "id": "intern_001",
      "fullName": "Nguyễn Văn A",
      "currentActiveDays": 2.0,
      "skills": ["Next.js", "React", "Tailwind 4", "TypeScript"],
      "recentScore": 8.7
    },
    {
      "id": "intern_002",
      "fullName": "Trần Thị B",
      "currentActiveDays": 3.0,
      "skills": ["React", "Recharts", "DataViz"],
      "recentScore": 8.5
    },
    {
      "id": "intern_003",
      "fullName": "Phạm Văn D",
      "currentActiveDays": 1.0,
      "skills": ["TypeScript", "Utils", "Testing"],
      "recentScore": 7.6
    }
  ]
}
```

---

## 3. Quy Tắc Nghiệp Vụ & Thuật Toán Cân Bằng Tải (Balancing Heuristics)

1. **Sắp xếp thứ tự ưu tiên giao task (Task Priority Ordering):**
   - Xử lý các task có `dependencies` hoặc `priority = URGENT/HIGH` trước.
   - Sắp xếp task có `estimatedDays` lớn nhất trước (Longest Processing Time First).

2. **Gán Owner:**
   - Chọn ứng viên có `currentActiveDays + task.estimatedDays <= 0.8 * maxWorkloadDays`.
   - Trong số các ứng viên thỏa mãn điều kiện an toàn, chọn người có độ khớp kỹ năng cao nhất.

3. **Gán Support (Nếu task có `estimatedDays >= 2.0`):**
   - Chọn ứng viên có tải hiện tại thấp nhất còn lại để hỗ trợ, cộng `0.5 * estimatedDays` vào tải của người đó.

4. **Đánh giá chỉ số cân bằng đội ngũ (Team Balance Index):**
   - Tính toán tải trung bình: `avgWorkload = totalDays / memberCount`.
   - Nếu chênh lệch giữa người cao nhất và thấp nhất ≤ 2.0 ngày: Xếp loại `BALANCED`.
   - Nếu chênh lệch > 3.5 ngày hoặc có người vượt 80%: Xếp loại `UNBALANCED` kèm khuyến nghị điều chỉnh.

---

## 4. Định Dạng Đầu Ra Kỳ Vọng (Output JSON Schema)

Phản hồi từ AI **BẮT BUỘC** là chuỗi JSON theo cấu trúc sau:

```json
{
  "batchAllocation": {
    "taskGroupId": "tg_101",
    "taskGroupName": "Sprint 3: Hoàn thiện tính năng Quản lý Đánh giá Tuần & AI",
    "totalTasks": 3,
    "allocatedTasks": [
      {
        "taskId": "task_301",
        "taskTitle": "Xây dựng WeeklyEvaluationStats & biểu đồ 6 tuần",
        "assignedOwner": {
          "id": "intern_002",
          "name": "Trần Thị B",
          "compatibilityScore": 95,
          "addedDays": 3.0
        },
        "assignedSupport": {
          "id": "intern_003",
          "name": "Phạm Văn D",
          "compatibilityScore": 80,
          "addedDays": 1.5
        },
        "allocationReason": "Trần Thị B rất mạnh về React và Recharts; Phạm Văn D hỗ trợ để học hỏi về Data Visualization."
      },
      {
        "taskId": "task_303",
        "taskTitle": "Tối ưu hóa UI/UX Modal tạo đánh giá tuần và DatePicker",
        "assignedOwner": {
          "id": "intern_001",
          "name": "Nguyễn Văn A",
          "compatibilityScore": 96,
          "addedDays": 2.5
        },
        "assignedSupport": null,
        "allocationReason": "Nguyễn Văn A có chuyên môn vững nhất về Tailwind 4 và Accessibility."
      },
      {
        "taskId": "task_302",
        "taskTitle": "Tích hợp Export Excel / CSV cho Đánh giá tuần",
        "assignedOwner": {
          "id": "intern_003",
          "name": "Phạm Văn D",
          "compatibilityScore": 88,
          "addedDays": 2.0
        },
        "assignedSupport": null,
        "allocationReason": "Phạm Văn D chuyên sâu về TypeScript utils và xử lý file stream."
      }
    ],
    "teamWorkloadSummary": [
      {
        "internId": "intern_001",
        "internName": "Nguyễn Văn A",
        "initialDays": 2.0,
        "finalDays": 4.5,
        "maxDays": 10.0,
        "utilizationRate": 0.45,
        "riskLevel": "LOW"
      },
      {
        "internId": "intern_002",
        "internName": "Trần Thị B",
        "initialDays": 3.0,
        "finalDays": 6.0,
        "maxDays": 10.0,
        "utilizationRate": 0.60,
        "riskLevel": "LOW"
      },
      {
        "internId": "intern_003",
        "internName": "Phạm Văn D",
        "initialDays": 1.0,
        "finalDays": 4.5,
        "maxDays": 10.0,
        "utilizationRate": 0.45,
        "riskLevel": "LOW"
      }
    ],
    "overallStatus": {
      "balanceIndex": "BALANCED",
      "averageUtilizationRate": 0.50,
      "maxIndividualUtilization": 0.60,
      "unassignedTasksCount": 0,
      "leaderAdvice": "Kế hoạch phân bổ rất đồng đều (45% - 60% công suất), không có nguy cơ quá tải nào. Leader có thể áp dụng toàn bộ."
    }
  }
}
```

---

## 5. Tiêu Chuẩn Hiển Thị Trên Frontend

1. Bảng phân bổ hiển thị dạng Matrix:
   - Các dòng là các Task được giao.
   - Cột Owner (Badge xanh dương) và Support (Badge tím).
   - Thanh tiến độ tải cá nhân (Personal Workload Bar) nhảy số động theo kế hoạch đề xuất.
2. Leader có quyền click vào từng dòng để đổi Owner/Support nếu muốn trước khi bấm nút **"Xác nhận áp dụng toàn bộ"**.
3. Hiển thị card tóm tắt `overallStatus` ở đầu modal với nhãn "Cân bằng hoàn hảo" màu xanh emerald để tạo sự tin cậy.
