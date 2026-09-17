import DashboardLayout from "@/components/layout/DashboardLayout";
import LeaderSidebar from "@/components/layout/LeaderSidebar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrefetchProvider from "@/providers/PrefetchProvider";

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute portal="leader">
            <DashboardLayout sidebar={<LeaderSidebar />}>
                <PrefetchProvider role="LEADER" />
                {children}
            </DashboardLayout>
        </ProtectedRoute>
    );
}