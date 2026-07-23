"use client";

import { AlertTriangle } from "lucide-react";
import { useDepartments } from "@/hooks/department/useDepartments";
import Table from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import DepartmentRow from "./DepartmentRow";

const COLUMNS = "minmax(200px, 1.5fr) minmax(300px, 3fr) 80px";

export default function DepartmentTable() {
    const { data, isPending, isError } = useDepartments();

    const departments = data?.data ?? [];

    if (isPending) {
        return (
            <MetalCard className="flex items-center justify-center py-20">
                <Spinner size="lg" />
            </MetalCard>
        );
    }

    if (isError) {
        return (
            <MetalCard className="flex flex-col items-center justify-center gap-3 py-20">
                <AlertTriangle className="h-8 w-8 text-red-400" />
                <p className="text-sm text-slate-400">
                    Failed to load departments.
                </p>
            </MetalCard>
        );
    }

    if (departments.length === 0) {
        return (
            <MetalCard className="flex flex-col items-center justify-center gap-3 py-20">
                <p className="text-sm text-slate-500">No departments found.</p>
            </MetalCard>
        );
    }

    return (
        <Modal>
            <Table
                columns={COLUMNS}
                className="
                    bg-[linear-gradient(145deg,#101827_0%,#1a2235_20%,#0f172a_55%,#050816_100%)]
                    shadow-[0_12px_40px_rgba(0,0,0,.45)]
                    hover:shadow-[0_20px_50px_rgba(21,174,245,.15)]
                    transition-shadow duration-500
                "
            >
                <Table.Header>
                    <div>Department</div>
                    <div>Positions</div>
                    <div className="text-right pr-4">Actions</div>
                </Table.Header>

                <Table.Body
                    data={departments}
                    render={(dept) => (
                        <DepartmentRow key={dept.id} department={dept} />
                    )}
                />
            </Table>
        </Modal>
    );
}
