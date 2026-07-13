import DashboardLayout from "@/components/layout/DashboardLayout";
import LeaderSidebar from "@/components/layout/LeaderSidebar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute allowedRoles={["LEADER"]}>
            <DashboardLayout sidebar={<LeaderSidebar />}>
                {children}
            </DashboardLayout>
        </ProtectedRoute>
    );
}