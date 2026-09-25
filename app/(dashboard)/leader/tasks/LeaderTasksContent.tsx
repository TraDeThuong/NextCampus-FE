"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import LeaderTaskHeader from "./LeaderTaskHeader";
import LeaderTaskStats from "./LeaderTaskStats";
import LeaderTaskFilters from "./LeaderTaskFilters";
import LeaderTableTasks from "./LeaderTableTasks";
import TaskReviewModal from "./TaskReviewModal";
import TaskExtensionReviewModal from "./TaskExtensionReviewModal";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function LeaderTasksContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const reviewAssignmentId = searchParams.get("reviewAssignmentId");
  const reviewExtensionAssignmentId = searchParams.get("reviewExtensionAssignmentId");

  const closeReview = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("reviewAssignmentId");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const closeExtensionReview = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("reviewExtensionAssignmentId");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <ProtectedRoute requiredPermissions={["TASK_READ"]}>
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

      {reviewExtensionAssignmentId && (
        <TaskExtensionReviewModal
          assignmentId={reviewExtensionAssignmentId}
          onClose={closeExtensionReview}
        />
      )}
      </div>
    </ProtectedRoute>
  );
}
