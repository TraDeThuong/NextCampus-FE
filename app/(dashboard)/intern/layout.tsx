import DashboardLayout from "@/components/layout/DashboardLayout";
import InternSidebar from "@/components/layout/InternSidebar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute allowedRoles={["INTERN"]}>
            <DashboardLayout sidebar={<InternSidebar />}>
                {children}
            </DashboardLayout>
        </ProtectedRoute>
    );
}