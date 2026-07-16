import InternHeader from "./InternHeader";
import InternStats from "./InternStats";
import InternFilters from "./InternFilters";
import InternTable from "./InternTable";

export default function InternManagementPage() {
  return (
    <div className="space-y-6">
      <InternHeader />
      <InternStats />
      <InternFilters />
      <InternTable />
    </div>
  );
}
