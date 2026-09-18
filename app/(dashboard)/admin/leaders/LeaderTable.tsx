"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { ChevronLeft, ChevronRight, AlertTriangle, Users, UserPlus, RotateCcw } from "lucide-react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

import { useLeaders } from "@/hooks/leader/useLeaders";
import type { LeaderQueryParams } from "@/types/leader";

import Table from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import LeaderRow from "./LeaderRow";

const COLUMNS =
    "minmax(220px,2fr) minmax(190px,1.8fr) minmax(160px,1.4fr) 80px 160px 48px";

export default function LeaderTable() {
    const t = useTranslations();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const params: LeaderQueryParams = useMemo(() => {
        const p: LeaderQueryParams = {};

        const fullName = searchParams.get("fullName");
        const department = searchParams.get("department");
        const departmentId = searchParams.get("departmentId");
        const isActive = searchParams.get("isActive");
        const page = searchParams.get("page");
        const limit = searchParams.get("limit");

        if (fullName) p.fullName = fullName;
        if (departmentId) {
            p.departmentId = departmentId;
        } else if (department) {
            p.department = department;
        }
        if (isActive) p.isActive = isActive === "true";
        if (page) p.page = Number(page);
        if (limit) p.limit = Number(limit);

        return p;
    }, [searchParams]);

    const { data, isPending, isError } = useLeaders(params);

    const leaders = data?.data ?? [];
    const meta = data?.meta;

    const hasFilters = Boolean(
        searchParams.get("fullName") ||
        searchParams.get("department") ||
        searchParams.get("departmentId") ||
        searchParams.get("isActive"),
    );

    function goToPage(page: number) {
        const p = new URLSearchParams(searchParams.toString());
        p.set("page", String(page));
        router.push(`${pathname}?${p.toString()}`);
    }

    function clearAllFilters() {
        const p = new URLSearchParams(searchParams.toString());
        p.delete("fullName");
        p.delete("department");
        p.delete("departmentId");
        p.delete("isActive");
        p.set("page", "1");
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
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400">
                    <AlertTriangle className="h-6 w-6" />
                </div>
                <p className="text-sm text-rose-300">
                    {t("admin.leaders.loadError")}
                </p>
            </MetalCard>
        );
    }

    if (leaders.length === 0) {
        return (
            <MetalCard className="flex flex-col items-center justify-center gap-3 py-20 text-center px-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
                    <Users className="h-6 w-6" />
                </div>
                <p className="text-base font-medium text-foreground">
                    {t("admin.leaders.noLeaders")}
                </p>
                {hasFilters ? (
                    <button
                        type="button"
                        onClick={clearAllFilters}
                        className="mt-2 inline-flex items-center gap-2 rounded-xl border border-border dark:border-white/10 bg-card/60 px-4 py-2 text-xs font-medium text-muted transition hover:bg-card hover:text-foreground active:scale-95"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                        {t("admin.leaders.clearFilters")}
                    </button>
                ) : (
                    <Modal.Open opens="add-leader">
                        <button
                            type="button"
                            className="mt-2 inline-flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-xs font-medium text-cyan-300 transition hover:border-cyan-400/50 hover:bg-cyan-500/20 active:scale-95"
                        >
                            <UserPlus className="h-3.5 w-3.5" />
                            {t("admin.leaders.addLeader")}
                        </button>
                    </Modal.Open>
                )}
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
                    <div className="text-center">{t("admin.leaders.colInterns")}</div>
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
                                    type="button"
                                    disabled={meta.page <= 1}
                                    onClick={() => goToPage(meta.page - 1)}
                                    aria-label="Previous page"
                                    className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-muted transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-foreground active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>

                                <button
                                    type="button"
                                    disabled={meta.page >= meta.totalPages}
                                    onClick={() => goToPage(meta.page + 1)}
                                    aria-label="Next page"
                                    className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-muted transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-foreground active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
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

