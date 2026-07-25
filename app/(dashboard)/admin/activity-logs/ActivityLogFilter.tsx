"use client";

import FilterSelect from "@/components/ui/FilterSelect";
import MetalCard from "@/components/ui/MetalCard";

const ACTION_OPTIONS = [
  { value: "LOGIN", label: "Đăng nhập (Login)" },
  { value: "LOGOUT", label: "Đăng xuất (Logout)" },
  { value: "CREATE_USER", label: "Tạo người dùng" },
  { value: "UPDATE_USER", label: "Cập nhật người dùng" },
  { value: "DELETE_USER", label: "Xóa người dùng" },
  { value: "CREATE_TASK", label: "Tạo nhiệm vụ" },
  { value: "UPDATE_TASK", label: "Cập nhật nhiệm vụ" },
  { value: "DELETE_TASK", label: "Xóa nhiệm vụ" },
  { value: "ASSIGN_TASK", label: "Giao nhiệm vụ" },
  { value: "CREATE_SUBMISSION", label: "Nộp bài" },
  { value: "REVIEW_SUBMISSION", label: "Đánh giá bài nộp" },
  { value: "CREATE_DAILY_REPORT", label: "Tạo báo cáo ngày" },
  { value: "CREATE_EVALUATION", label: "Tạo đánh giá tuần" },
  { value: "SUBMIT_APPLICATION", label: "Nộp đơn ứng tuyển" },
];

const TARGET_TYPE_OPTIONS = [
  { value: "USER", label: "Người dùng (User)" },
  { value: "TASK", label: "Nhiệm vụ (Task)" },
  { value: "SUBMISSION", label: "Bài nộp (Submission)" },
  { value: "DAILY_REPORT", label: "Báo cáo ngày (Daily Report)" },
  { value: "APPLICATION", label: "Đơn ứng tuyển (Application)" },
  { value: "REGULATION", label: "Quy định (Regulation)" },
  { value: "WEEKLY_EVALUATION", label: "Đánh giá tuần" },
];

const ORDER_OPTIONS = [
  { value: "desc", label: "Mới nhất trước (Newest)" },
  { value: "asc", label: "Cũ nhất trước (Oldest)" },
];

export default function ActivityLogFilter() {
  return (
    <MetalCard className="px-6 py-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FilterSelect
          label="Hành động"
          filterField="action"
          options={ACTION_OPTIONS}
        />

        <FilterSelect
          label="Đối tượng"
          filterField="targetType"
          options={TARGET_TYPE_OPTIONS}
        />

        <FilterSelect
          label="Sắp xếp"
          filterField="order"
          options={ORDER_OPTIONS}
        />
      </div>
    </MetalCard>
  );
}
