"use client";

import { useSearchParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { useDepartments } from "@/hooks/department/useDepartments";
import { useLeaders } from "@/hooks/leader/useLeaders";
import Table from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import DepartmentRow from "./DepartmentRow";

const COLUMNS = "minmax(180px, 1.2fr) minmax(280px, 2.8fr) minmax(220px, 1.8fr) 80px";

export default function DepartmentTable() {
    const searchParams = useSearchParams();
    const name = searchParams.get("name") ?? undefined;
    const leader = searchParams.get("leader") ?? undefined;

    const { data, isPending, isError } = useDepartments({ name, leader });
    const {
        data: leadersData,
        isPending: leadersPending,
        isError: leadersError,
    } = useLeaders({ limit: 100, sortBy: "fullName", order: "asc" });

    const departments = data?.data ?? [];
    const leaders = leadersData?.data ?? [];

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
                    <div>Leader</div>
                    <div className="text-right pr-4">Actions</div>
                </Table.Header>

                <Table.Body
                    data={departments}
                    render={(dept) => (
                        <DepartmentRow
                            key={dept.id}
                            department={dept}
                            leaders={leaders}
                            leadersLoading={leadersPending}
                            leadersError={leadersError}
                        />
                    )}
                />
            </Table>
        </Modal>
    );
}
