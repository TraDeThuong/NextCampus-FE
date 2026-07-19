import PolicyHeader from "./PolicyHeader";
import PolicyFilter from "./PolicyFilter";
import PolicyTable from "./PolicyTable";

export default function ManagePolicies() {
  return (
    <div className="space-y-6">
      <PolicyHeader />
      <PolicyFilter />
      <PolicyTable />
    </div>
  );
}

