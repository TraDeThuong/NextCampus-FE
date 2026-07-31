
import type { Metadata } from "next";
import DepartmentHeader from "./DepartmentHeader";
import DepartmentTable from "./DepartmentTable";

export const metadata: Metadata = {
  title: "Manage Departments",
};

export default function page() {
  return (
    <div className="space-y-6">
      <DepartmentHeader />
      <DepartmentTable />
    </div>
  );
}


