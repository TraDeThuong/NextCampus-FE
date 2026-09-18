"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { AlertTriangle, ChevronLeft, ChevronRight, Building2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useDepartments } from "@/hooks/department/useDepartments";
import { useLeaders } from "@/hooks/leader/useLeaders";
import Table from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import DepartmentRow from "./DepartmentRow";

const COLUMNS =
    "minmax(180px, 1.3fr) minmax(220px, 1.8fr) minmax(130px, 0.9fr) minmax(180px, 1.3fr) 96px";

const PAGE_SIZE = 10;

export default function DepartmentTable() {
    const t = useTranslations();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const name = searchParams.get("name") ?? undefined;
    const leader = searchParams.get("leader") ?? undefined;
    const pageParam = Number(searchParams.get("page") ?? "1");
    const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

    const { data, isPending, isError } = useDepartments({ name, leader });
    const {
        data: leadersData,
        isPending: leadersPending,
        isError: leadersError,
    } = useLeaders({ limit: 100, sortBy: "fullName", order: "asc" });

    const departments = data?.data ?? [];
    const leaders = leadersData?.data ?? [];

    const total = departments.length;
    const totalPages = Math.ceil(total / PAGE_SIZE);
    const validPage = totalPages > 0 ? Math.max(1, Math.min(page, totalPages)) : 1;
    const paginatedDepartments = departments.slice(
        (validPage - 1) * PAGE_SIZE,
        validPage * PAGE_SIZE,
    );

    function goToPage(newPage: number) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", String(newPage));
        router.push(`${pathname}?${params.toString()}`);
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
                <AlertTriangle className="h-8 w-8 text-rose-400" />
                <p className="text-sm text-muted">
                    {t("admin.department.loadError")}
                </p>
            </MetalCard>
        );
    }

    if (departments.length === 0) {
        const hasFilters = Boolean(name || leader);
        return (
            <MetalCard className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                <Building2 className="h-10 w-10 text-muted opacity-40" />
                <p className="text-sm font-medium text-foreground">
                    {hasFilters
                        ? t("admin.department.noMatchingDepartments")
                        : t("admin.department.noDepartments")}
                </p>
                {hasFilters && (
                    <button
                        type="button"
                        onClick={() => router.push(pathname)}
                        className="text-xs text-cyan-400 hover:underline mt-1"
                    >
                        {t("admin.department.clearFilters")}
                    </button>
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
                    <div>{t("admin.department.colDepartment")}</div>
                    <div>{t("admin.department.colDescription")}</div>
                    <div>{t("admin.department.colPositionsCount")}</div>
                    <div>{t("admin.department.colLeader")}</div>
                    <div className="text-right">{t("admin.department.colActions")}</div>
                </Table.Header>

                <Table.Body
                    data={paginatedDepartments}
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

                {totalPages > 1 && (
                    <Table.Footer>
                        <div className="flex w-full items-center justify-between gap-4 text-sm">
                            <p className="text-muted">
                                {t("admin.department.pagination", {
                                    page: validPage,
                                    totalPages,
                                    total,
                                })}
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    aria-label="Previous page"
                                    disabled={validPage <= 1}
                                    onClick={() => goToPage(validPage - 1)}
                                    className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-muted transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>

                                <button
                                    type="button"
                                    aria-label="Next page"
                                    disabled={validPage >= totalPages}
                                    onClick={() => goToPage(validPage + 1)}
                                    className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-muted transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
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
