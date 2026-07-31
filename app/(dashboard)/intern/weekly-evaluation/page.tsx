import type { Metadata } from "next";
import { Suspense } from "react";
import InternWeeklyEvaluationList from "./InternWeeklyEvaluationList";
import Spinner from "@/components/ui/Spinner";

export const metadata: Metadata = {
  title: "Weekly Evaluation | NexCampus",
  description:
    "Track weekly evaluation results from your Leader, view detailed criteria scores and confirm reviewed status.",
};

export default function page() {
  return (
    <Suspense fallback={<Spinner />}>
      <InternWeeklyEvaluationList />
    </Suspense>
  );
}
