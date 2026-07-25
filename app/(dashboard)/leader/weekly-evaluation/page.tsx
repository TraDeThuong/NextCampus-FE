import type { Metadata } from "next";
import { Suspense } from "react";
import WeeklyEvaluationList from "./WeeklyEvaluationList";
import Spinner from "@/components/ui/Spinner";

export const metadata: Metadata = {
  title: "Đánh giá tuần",
};

export default function page() {
  return (
    <Suspense fallback={<Spinner />}>
      <WeeklyEvaluationList />
    </Suspense>
  );
}
