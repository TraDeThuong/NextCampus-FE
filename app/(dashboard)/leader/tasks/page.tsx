"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import LeaderTaskHeader from "./LeaderTaskHeader";
import LeaderTaskStats from "./LeaderTaskStats";
import LeaderTaskFilters from "./LeaderTaskFilters";
import LeaderTableTasks from "./LeaderTableTasks";
import TaskReviewModal from "./TaskReviewModal";
import { createPortal } from "react-dom";

export default function Page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const reviewAssignmentId = searchParams.get("reviewAssignmentId");

  const closeReview = () => {
    const p = new URLSearchParams(searchParams.toString());
    p.delete("reviewAssignmentId");
    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      <LeaderTaskHeader />
      <LeaderTaskStats />
      <LeaderTaskFilters />
      <LeaderTableTasks />

      {reviewAssignmentId &&
        createPortal(
          <TaskReviewModal
            assignmentId={reviewAssignmentId}
            taskId=""
            onClose={closeReview}
          />,
          document.body,
        )}
    </div>
  );
}
