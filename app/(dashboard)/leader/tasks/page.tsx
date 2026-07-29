import type { Metadata } from "next";
import { Suspense } from "react";
import Spinner from "@/components/ui/Spinner";
import LeaderTasksContent from "./LeaderTasksContent";

export const metadata: Metadata = {
  title: "Task Management",
};

export default function Page() {
  return (
    <Suspense fallback={<Spinner />}>
      <LeaderTasksContent />
    </Suspense>
  );
}
