import AdminTeamHeader from "./AdminTeamHeader";
import AdminTeamStats from "./AdminTeamStats";
import AdminTeamFilter from "./AdminTeamFilter";
import AdminTeamTable from "./AdminTeamTable";

export default function AdminTeamPage() {
    return (
        <div className="space-y-6">
            <AdminTeamHeader />
            <AdminTeamStats />
            <AdminTeamFilter />
            <AdminTeamTable />
        </div>
    );
}
