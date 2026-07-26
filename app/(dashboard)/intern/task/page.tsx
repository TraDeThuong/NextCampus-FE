import type { Metadata } from "next";
import InternTaskHeader from "./InternTaskHeader";
import InternTaskStats from "./InternTaskStats";

export const metadata: Metadata = {
  title: "My Tasks",
};

export default function InternTaskPage() {
  return (
    <div className="space-y-6">
      <InternTaskHeader />
      <InternTaskStats />
    </div>
  );
}
