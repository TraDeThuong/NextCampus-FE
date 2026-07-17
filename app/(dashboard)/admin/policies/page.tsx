import PolicyHeader from "./PolicyHeader";
import PolicyTable from "./PolicyTable";

export default function ManagePolicies() {
  return (
    <div className="space-y-6">
      <PolicyHeader />
      <PolicyTable />
    </div>
  );
}

