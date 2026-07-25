import type { Metadata } from "next";
import { Suspense } from "react";
import WeeklyEvaluationHeader from "./WeeklyEvaluationHeader";
import WeeklyEvaluationList from "./WeeklyEvaluationList";
import Spinner from "@/components/ui/Spinner";

export const metadata: Metadata = {
  title: "Đánh giá tuần",
};

export default function page() {
  return (
    <div className="space-y-6">
      <WeeklyEvaluationHeader />
      <Suspense fallback={<Spinner />}>
        <WeeklyEvaluationList />
      </Suspense>
    </div>
  );
}

