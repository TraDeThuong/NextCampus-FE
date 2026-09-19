"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight, AlertTriangle, Users, RotateCcw, UserPlus } from "lucide-react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { useInterns } from "@/hooks/intern/useInterns";
import type { InternQueryParams } from "@/types/intern";

import Table from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import InternRow from "./InternRow";

const COLUMNS =
    "minmax(180px,1.4fr) minmax(170px,1.2fr) minmax(130px,1fr) minmax(100px,0.65fr) 150px 175px 48px";

export default function InternTable() {
    const t = useTranslations();
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

    const { data, isPending, isError, refetch, isFetching } =
        useInterns(params);

    const interns = data?.data ?? [];
    const meta = data?.meta;

    const hasFilters = Boolean(
        searchParams.get("fullName") ||
        searchParams.get("department") ||
        searchParams.get("position") ||
        searchParams.get("leader") ||
        searchParams.get("status")
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
        p.delete("position");
        p.delete("leader");
        p.delete("status");
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
                    {t("admin.interns.loadError")}
                </p>
            </MetalCard>
        );
    }

    if (interns.length === 0) {
        return (
            <MetalCard className="flex flex-col items-center justify-center gap-3 py-20 text-center px-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
                    <Users className="h-6 w-6" />
                </div>
                <p className="text-base font-medium text-foreground">
                    {t("admin.interns.noInterns")}
                </p>
                {hasFilters ? (
                    <button
                        type="button"
                        onClick={clearAllFilters}
                        className="mt-2 inline-flex items-center gap-2 rounded-xl border border-border dark:border-white/10 bg-card/60 px-4 py-2 text-xs font-medium text-muted transition hover:bg-card hover:text-foreground active:scale-95"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                        {t("admin.interns.clearFilters")}
                    </button>
                ) : (
                    <Modal.Open opens="invite-intern">
                        <button
                            type="button"
                            className="mt-2 inline-flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-xs font-medium text-cyan-300 transition hover:border-cyan-400/50 hover:bg-cyan-500/20 active:scale-95"
                        >
                            <UserPlus className="h-3.5 w-3.5" />
                            {t("admin.interns.addIntern")}
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
                    <div>{t("admin.interns.colIntern")}</div>
                    <div>{t("admin.interns.colLeader")}</div>
                    <div>{t("admin.interns.colDepartment")}</div>
                    <div>{t("admin.interns.colPosition")}</div>
                    <div>{t("admin.interns.colDuration")}</div>
                    <div>{t("admin.interns.colStatus")}</div>
                    <Table.ReloadButton onReload={refetch} isReloading={isFetching} />
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
                                {t("admin.interns.pagination", { page: meta.page, totalPages: meta.totalPages, total: meta.total })}
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    disabled={meta.page <= 1}
                                    onClick={() => goToPage(meta.page - 1)}
                                    className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-muted transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>

                                <button
                                    disabled={meta.page >= meta.totalPages}
                                    onClick={() => goToPage(meta.page + 1)}
                                    className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-muted transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
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
