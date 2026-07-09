import DashboardLayout from "@/components/layout/DashboardLayout";
import LeaderSidebar from "@/components/layout/LeaderSidebar";

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <DashboardLayout sidebar={<LeaderSidebar />}>
            {children}
        </DashboardLayout>
    );
}