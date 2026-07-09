import AdminSidebar from "@/components/layout/AdminSidebar";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <DashboardLayout sidebar={<AdminSidebar/>}>
            {children}
        </DashboardLayout>
    );
}