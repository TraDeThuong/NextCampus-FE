"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import LeaderTaskHeader from "./LeaderTaskHeader";
import LeaderTaskStats from "./LeaderTaskStats";
import LeaderTaskFilters from "./LeaderTaskFilters";
import LeaderTableTasks from "./LeaderTableTasks";
import TaskReviewModal from "./TaskReviewModal";

export default function LeaderTasksContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const reviewAssignmentId = searchParams.get("reviewAssignmentId");

  const closeReview = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("reviewAssignmentId");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <div className="space-y-6">
      <LeaderTaskHeader />
      <LeaderTaskStats />
      <LeaderTaskFilters />
      <LeaderTableTasks />

      {reviewAssignmentId && (
        <TaskReviewModal
          assignmentId={reviewAssignmentId}
          onClose={closeReview}
        />
      )}
    </div>
  );
}
