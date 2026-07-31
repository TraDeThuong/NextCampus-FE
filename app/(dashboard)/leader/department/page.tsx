import type { Metadata } from "next";
import DepartmentHeader from "./DepartmentHeader";
import DepartmentTable from "./DepartmentTable";

export const metadata: Metadata = {
    title: "Phòng ban",
};

export default function page() {
    return (
        <div className="space-y-6">
            <DepartmentHeader />
            <DepartmentTable />
        </div>
    );
}
