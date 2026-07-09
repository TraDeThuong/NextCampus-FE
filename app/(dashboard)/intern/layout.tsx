import DashboardLayout from "@/components/layout/DashboardLayout";
import InternSidebar from "@/components/layout/InternSidebar";

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <DashboardLayout sidebar={<InternSidebar />}>
            {children}
        </DashboardLayout>
    );
}