"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

import { useLeaders } from "@/hooks/leader/useLeaders";
import type { LeaderQueryParams } from "@/types/leader";

import Table from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import LeaderRow from "./LeaderRow";

const COLUMNS =
    "minmax(220px,2.5fr) minmax(180px,1.5fr) minmax(180px,1.5fr) 80px 100px 40px";

export default function LeaderTable() {
    const t = useTranslations();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const params: LeaderQueryParams = useMemo(() => {
        const p: LeaderQueryParams = {};

        const fullName = searchParams.get("fullName");
        const department = searchParams.get("department");
        const isActive = searchParams.get("isActive");
        const page = searchParams.get("page");
        const limit = searchParams.get("limit");

        if (fullName) p.fullName = fullName;
        if (department) p.department = department;
        if (isActive) p.isActive = isActive === "true";
        if (page) p.page = Number(page);
        if (limit) p.limit = Number(limit);

        return p;
    }, [searchParams]);

    const { data, isPending, isError } = useLeaders(params);

    const leaders = data?.data ?? [];
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
                    {t("admin.leaders.loadError")}
                </p>
            </MetalCard>
        );
    }

    if (leaders.length === 0) {
        return (
            <MetalCard className="flex flex-col items-center justify-center gap-3 py-20">
                <p className="text-sm text-slate-500">{t("admin.leaders.noLeaders")}</p>
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
                    <div>{t("admin.leaders.colLeader")}</div>
                    <div>{t("admin.leaders.colDepartment")}</div>
                    <div>{t("admin.leaders.colPosition")}</div>
                    <div>{t("admin.leaders.colInterns")}</div>
                    <div>{t("admin.leaders.colStatus")}</div>
                    <div />
                </Table.Header>

                <Table.Body
                    data={leaders}
                    render={(leader) => (
                        <LeaderRow key={leader.id} leader={leader} />
                    )}
                />

                {meta && meta.totalPages > 1 && (
                    <Table.Footer>
                        <div className="flex w-full items-center justify-between gap-4 text-sm">
                            <p className="text-muted">
                                {t("admin.leaders.pagination", { page: meta.page, totalPages: meta.totalPages, total: meta.total })}
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
