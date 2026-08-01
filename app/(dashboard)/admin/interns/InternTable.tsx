"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

import { useInterns } from "@/hooks/intern/useInterns";
import type { InternQueryParams } from "@/types/intern";

import Table from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import InternRow from "./InternRow";

const COLUMNS =
    "minmax(200px,2fr) minmax(100px,1fr) minmax(110px,1fr) minmax(220px,2fr) 100px 100px 40px";

export default function InternTable() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const params: InternQueryParams = useMemo(() => {
        const p: InternQueryParams = {};

        const fullName = searchParams.get("fullName");
        const department = searchParams.get("department");
        const position = searchParams.get("position");
        const status = searchParams.get("status");
        const leaderId = searchParams.get("leaderId");
        const leader = searchParams.get("leader");
        const page = searchParams.get("page");
        const limit = searchParams.get("limit");

        if (fullName) p.fullName = fullName;
        if (department) p.department = department;
        if (position) p.position = position;
        if (status) p.status = status as InternQueryParams["status"];
        if (leaderId) p.leaderId = leaderId;
        if (leader) p.leader = leader;
        if (page) p.page = Number(page);
        if (limit) p.limit = Number(limit);

        return p;
    }, [searchParams]);

    const { data, isPending, isError } = useInterns(params);

    const interns = data?.data ?? [];
    const meta = data?.meta;

    function goToPage(page: number) {
        const p = new URLSearchParams(searchParams.toString());
        p.set("page", String(page));
        router.push(`${pathname}?${p.toString()}`);
    }

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
                    Failed to load interns.
                </p>
            </MetalCard>
        );
    }

    if (interns.length === 0) {
        return (
            <MetalCard className="flex flex-col items-center justify-center gap-3 py-20">
                <p className="text-sm text-slate-500">No interns found.</p>
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
                    <div>Intern</div>
                    <div>Department</div>
                    <div>Position</div>
                    <div>Leader</div>
                    <div>Duration</div>
                    <div>Status</div>
                    <div />
                </Table.Header>

                <Table.Body
                    data={interns}
                    render={(intern) => (
                        <InternRow key={intern.id} intern={intern} />
                    )}
                />

                {meta && meta.totalPages > 1 && (
                    <Table.Footer>
                        <div className="flex w-full items-center justify-between gap-4 text-sm">
                            <p className="text-muted">
                                Page {meta.page} of {meta.totalPages} &middot;{" "}
                                {meta.total} total
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    disabled={meta.page <= 1}
                                    onClick={() => goToPage(meta.page - 1)}
                                    className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-muted transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-foreground disabled:opacity-30"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>

                                <button
                                    disabled={meta.page >= meta.totalPages}
                                    onClick={() => goToPage(meta.page + 1)}
                                    className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-muted transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-foreground disabled:opacity-30"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </Table.Footer>
                )}
            </Table>
        </Modal>
    );
}
