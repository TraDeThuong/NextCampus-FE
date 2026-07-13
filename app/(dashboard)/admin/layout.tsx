import AdminSidebar from "@/components/layout/AdminSidebar";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute allowedRoles={["ADMIN"]}>
            <DashboardLayout sidebar={<AdminSidebar/>}>
                {children}
            </DashboardLayout>
        </ProtectedRoute>
    );
}