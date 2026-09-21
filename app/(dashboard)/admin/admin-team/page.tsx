import AdminTeamHeader from "./AdminTeamHeader";
import AdminTeamStats from "./AdminTeamStats";
import AdminTeamFilter from "./AdminTeamFilter";
import AdminTeamTable from "./AdminTeamTable";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function AdminTeamPage() {
    return (
        <ProtectedRoute requiredPermissions={["USER_READ"]}>
            <div className="space-y-6">
                <AdminTeamHeader />
                <AdminTeamStats />
                <AdminTeamFilter />
                <AdminTeamTable />
            </div>
        </ProtectedRoute>
    );
}
