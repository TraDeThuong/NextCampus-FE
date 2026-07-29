import type { Metadata } from "next";
import { Suspense } from "react";
import InternWeeklyEvaluationList from "./InternWeeklyEvaluationList";
import Spinner from "@/components/ui/Spinner";

export const metadata: Metadata = {
  title: "Đánh giá tuần | NexCampus",
  description:
    "Theo dõi kết quả đánh giá hàng tuần từ Leader, xem chi tiết từng tiêu chí và xác nhận đã đọc.",
};

export default function page() {
  return (
    <Suspense fallback={<Spinner />}>
      <InternWeeklyEvaluationList />
    </Suspense>
  );
}
