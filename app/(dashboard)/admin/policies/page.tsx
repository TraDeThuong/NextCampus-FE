import type { Metadata } from "next";
import PolicyHeader from "./PolicyHeader";
import PolicyFilter from "./PolicyFilter";
import PolicyTable from "./PolicyTable";

export const metadata: Metadata = {
  title: "Chính sách & Quy định",
};

export default function ManagePolicies() {
  return (
    <div className="space-y-6">
      <PolicyHeader />
      <PolicyFilter />
      <PolicyTable />
    </div>
  );
}


