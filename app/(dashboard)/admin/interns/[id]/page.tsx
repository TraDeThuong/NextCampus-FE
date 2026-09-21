"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Mail,
    Phone,
    Building2,
    Briefcase,
    Calendar,
    Clock,
    Circle,
    User,
    Hash,
    CheckCircle2,
    XCircle,
    Trash2,
    ListTodo,
    Play,
    ShieldCheck,
    ShieldAlert,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useTranslations, useLocale } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useInternDetail } from "@/hooks/intern/useInternDetail";
import { useUpdateIntern } from "@/hooks/intern/useUpdateIntern";
import { usePositions } from "@/hooks/department/usePositions";
import { useLeaders } from "@/hooks/leader/useLeaders";
import { useTaskAssignments } from "@/hooks/task-assignment/useTaskAssignments";
import { useDailyReports } from "@/hooks/daily-report/useDailyReports";
import { useWeeklyEvaluations } from "@/hooks/weekly-evaluation/useWeeklyEvaluations";
import { updateUserService } from "@/services/user.service";

import type { Intern } from "@/types/intern";
import type { TaskAssignment } from "@/types/task-assignment";
import type { Leader } from "@/types/leader";
import type { Position } from "@/types/department";

import MetalCard from "@/components/ui/MetalCard";
import Modal from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import InlineSelect from "@/components/ui/InlineSelect";
import Table from "@/components/ui/Table";
import InternshipSummaryExportButton from "@/components/pdf/InternshipSummaryExportButton";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useRBAC } from "@/hooks/rbac/useRBAC";

function formatDate(dateStr?: string | null, locale = "vi") {
    if (!dateStr) return "—";
    try {
        return new Date(dateStr).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    } catch {
        return dateStr;
    }
}

function extractArray<T>(data: unknown): T[] {
    if (Array.isArray(data)) return data as T[];
    if (data && typeof data === "object" && "data" in data && Array.isArray((data as { data: unknown }).data)) {
        return (data as { data: T[] }).data;
    }
    return [];
}

export default function InternDetailPage() {
    return (
        <ProtectedRoute requiredPermissions={["INTERN_READ"]}>
            <InternDetailContent />
        </ProtectedRoute>
    );
}

function InternDetailContent() {
    const t = useTranslations();
    const params = useParams<{ id: string }>();
    const router = useRouter();

    const { data, error, isLoading, isError, refetch } = useInternDetail(params.id);
    const intern = data?.data;

    // Additional operational data for KPI cards & task tracking
    const { data: assignData } = useTaskAssignments(
        { internId: params.id, limit: 100 },
        Boolean(intern?.id),
    );
    const assignments = extractArray<TaskAssignment>(assignData?.data);

    const { data: reportData } = useDailyReports(
        { internId: params.id, limit: 1 },
    );
    const reportsCount =
        reportData?.meta?.total ??
        (reportData as unknown as { data?: { meta?: { total?: number } } })?.data?.meta?.total ??
        extractArray(reportData?.data).length;

    const { data: evalData } = useWeeklyEvaluations(
        { internId: params.id },
    );
    const evaluations = extractArray(evalData?.data);
    const evaluationsCount =
        evaluations.length ||
        (evalData as unknown as { meta?: { total?: number } })?.meta?.total ||
        0;

    const isNotFound =
        !intern &&
        (!isError || (isAxiosError(error) && error.response?.status === 404));

    if (isLoading) {
        return (
            <MetalCard className="flex items-center justify-center py-32">
                <Spinner size="lg" />
            </MetalCard>
        );
    }

    if (isError || !intern) {
        return (
            <MetalCard className="flex flex-col items-center justify-center gap-4 py-24 text-center px-4">
                <div className="rounded-2xl bg-rose-500/10 p-4 border border-rose-500/20 shadow-inner">
                    <XCircle className="h-8 w-8 text-rose-400" />
                </div>
                <p className="text-muted font-medium">
                    {isNotFound
                        ? t("admin.interns.details.notFound")
                        : t("admin.interns.details.loadError")}
                </p>
                <div className="flex items-center gap-3">
                    {!isNotFound && (
                        <button
                            type="button"
                            onClick={() => void refetch()}
                            className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20 active:scale-95"
                        >
                            {t("admin.interns.details.tryAgain")}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => router.push("/admin/interns")}
                        className="group flex items-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-2 text-sm font-medium text-foreground transition-all duration-300 hover:bg-card hover:text-cyan-400 hover:border-cyan-500/50 active:scale-95 shadow-glass"
                    >
                        <ArrowLeft className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-1" />
                        {t("admin.interns.details.back")}
                    </button>
                </div>
            </MetalCard>
        );
    }

    return (
        <ProtectedRoute requiredPermissions={["INTERN_READ"]}>
            <div className="mx-auto w-full space-y-6">
                {/* Top Back Action */}
                <div>
                    <button
                        type="button"
                        onClick={() => router.push("/admin/interns")}
                        className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground transition-all py-2 px-3.5 rounded-xl border border-border/60 dark:border-white/10 bg-card/60 hover:bg-card active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan-500/50 shadow-sm"
                    >
                        <ArrowLeft className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-1" />
                        <span>{t("admin.interns.details.back")}</span>
                    </button>
                </div>

                {/* Header Banner */}
                <InternHeader intern={intern} />

                {/* KPI Stat Cards (Adhering to Rule 49-51: mobile 2-col, rotate-6/scale-110 micro-interaction, odd count headline KPI) */}
                <InternKpiCards
                    totalTasks={assignments.length}
                    completedTasks={assignments.filter((a) => a.status === "DONE").length}
                    inProgressTasks={assignments.filter((a) => a.status === "IN_PROGRESS").length}
                    dailyReportsCount={reportsCount}
                    evaluationsCount={evaluationsCount}
                />

                {/* Main Content Grid: Personal Info & Program Placement */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <PersonalInfo intern={intern} />
                    <InternshipInfo intern={intern} />
                </div>

                {/* Assigned Tasks Table */}
                <TaskListCard assignments={assignments} />
            </div>
        </ProtectedRoute>
    );
}

/* ─── Header Banner ────────────────────────────────────────── */

function InternHeader({ intern }: { intern: Intern }) {
    const t = useTranslations();
    const locale = useLocale();
    const { can } = useRBAC();
    const canUpdate = can("INTERN_UPDATE");
    const { mutate: updateIntern } = useUpdateIntern();
    const [status, setStatus] = useState(intern.status);

    const statusBadge: Record<string, string> = {
        ACTIVE: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
        COMPLETED: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
        DROPPED: "border-rose-500/30 bg-rose-500/10 text-rose-400",
    };

    const joinedDateStr = new Date(intern.createdAt).toLocaleDateString(
        locale === "vi" ? "vi-VN" : "en-US",
        {
            month: "long",
            year: "numeric",
        }
    );
    const joined = t("admin.interns.details.joined", { date: joinedDateStr });

    return (
        <Modal>
            <MetalCard>
                <div className="p-6">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4 min-w-0">
                            {/* Avatar with initial */}
                            <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 font-bold text-2xl sm:text-3xl text-white shadow-xl border border-white/10 ring-1 ring-white/10 overflow-hidden">
                                {intern.fullName ? intern.fullName.charAt(0).toUpperCase() : "?"}
                            </div>

                            <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground truncate">
                                        {intern.fullName}
                                    </h1>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-muted">
                                    <span className="flex items-center gap-1.5 hover:text-foreground transition-colors truncate">
                                        <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                        {intern.user.email}
                                    </span>
                                    <span>•</span>
                                    <span className="text-muted-foreground font-medium">{joined}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions Toolbar */}
                        <div className="flex flex-wrap items-center gap-3">
                            <InternshipSummaryExportButton internId={intern.id} />

                            {canUpdate ? (
                                <>
                                    {/* Standardized InlineSelect for Status */}
                                    <InlineSelect
                                        ariaLabel={t("admin.interns.colStatus")}
                                        value={status}
                                        placeholder={t("admin.interns.colStatus")}
                                        onChange={(val) => {
                                            if (!val) return;
                                            const v = val as Intern["status"];
                                            setStatus(v);
                                            updateIntern(
                                                {
                                                    id: intern.id,
                                                    payload: { status: v },
                                                },
                                                {
                                                    onError: () => setStatus(intern.status),
                                                }
                                            );
                                        }}
                                        options={[
                                            { value: "ACTIVE", label: t("admin.interns.details.active") },
                                            { value: "COMPLETED", label: t("admin.interns.details.completed") },
                                            { value: "DROPPED", label: t("admin.interns.details.dropped") },
                                        ]}
                                        renderTrigger={(label) => (
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold tracking-wide uppercase transition shadow-sm ${statusBadge[status]}`}
                                            >
                                                <Circle className="h-2 w-2 fill-current" />
                                                {label}
                                            </span>
                                        )}
                                    />

                                    {status === "ACTIVE" && (
                                        <Modal.Open opens="drop-intern">
                                            <button className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-xs font-semibold tracking-wide uppercase text-rose-400 transition-all duration-300 hover:bg-rose-500/20 hover:border-rose-500/40 active:scale-95 shadow-sm">
                                                <Trash2 className="h-3.5 w-3.5 shrink-0" />
                                                <span>{t("admin.interns.details.dropIntern")}</span>
                                            </button>
                                        </Modal.Open>
                                    )}
                                </>
                            ) : (
                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold tracking-wide uppercase transition shadow-sm ${statusBadge[status]}`}
                                >
                                    <Circle className="h-2 w-2 fill-current" />
                                    {status === "ACTIVE"
                                        ? t("admin.interns.details.active")
                                        : status === "COMPLETED"
                                          ? t("admin.interns.details.completed")
                                          : t("admin.interns.details.dropped")}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </MetalCard>

            <Modal.Window name="drop-intern" size="sm">
                <DropConfirm
                    name={intern.fullName}
                    onConfirm={(close) => {
                        setStatus("DROPPED");
                        updateIntern({
                            id: intern.id,
                            payload: { status: "DROPPED" },
                        }, {
                            onError: () => setStatus(intern.status),
                        });
                        close?.();
                    }}
                />
            </Modal.Window>
        </Modal>
    );
}

/* ─── KPI Stat Cards (Rule 49-51) ──────────────────────────── */

function InternKpiCards({
    totalTasks,
    completedTasks,
    inProgressTasks,
    dailyReportsCount,
    evaluationsCount,
}: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    dailyReportsCount: number;
    evaluationsCount: number;
}) {
    const t = useTranslations();

    const cards = [
        {
            title: t("admin.interns.details.totalTasks"),
            value: totalTasks,
            icon: ListTodo,
            iconBg: "from-sky-500/20 to-cyan-400/10",
        },
        {
            title: t("admin.interns.details.completedTasks"),
            value: completedTasks,
            icon: CheckCircle2,
            iconBg: "from-emerald-500/20 to-green-400/10",
        },
        {
            title: t("admin.interns.details.inProgressTasks"),
            value: inProgressTasks,
            icon: Play,
            iconBg: "from-blue-500/20 to-indigo-400/10",
        },
        {
            title: t("admin.interns.details.dailyReports"),
            value: dailyReportsCount,
            icon: Calendar,
            iconBg: "from-violet-500/20 to-purple-400/10",
        },
        {
            title: t("admin.interns.details.evaluations"),
            value: evaluationsCount,
            icon: Clock,
            iconBg: "from-amber-500/20 to-yellow-400/10",
        },
    ];

    const isOdd = cards.length % 2 !== 0;

    return (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5 md:gap-5">
            {cards.map((card, idx) => {
                const Icon = card.icon;
                const isFirstAndOdd = isOdd && idx === 0;

                return (
                    <MetalCard
                        key={card.title}
                        className={`p-4 sm:p-5 lg:p-6 ${isFirstAndOdd ? "col-span-2 md:col-span-1" : ""}`}
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                                <p className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.1em] sm:tracking-[0.2em] text-muted truncate">
                                    {card.title}
                                </p>
                                <h3 className="chrome-text mt-2 sm:mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold leading-none">
                                    {card.value}
                                </h3>
                                <div className="mt-3 sm:mt-4 h-[2px] w-10 sm:w-16 rounded-full bg-gradient-to-r from-primary-light/70 to-transparent" />
                            </div>
                            <div
                                className={`
                                    flex h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 shrink-0 items-center justify-center
                                    rounded-xl sm:rounded-2xl border border-white/10
                                    bg-gradient-to-br ${card.iconBg}
                                    shadow-lg transition-all duration-500
                                    group-hover:rotate-6 group-hover:scale-110
                                `}
                            >
                                <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                            </div>
                        </div>
                    </MetalCard>
                );
            })}
        </div>
    );
}

/* ─── Personal Info Card ───────────────────────────────────── */

function PersonalInfo({ intern }: { intern: Intern }) {
    const t = useTranslations();
    const locale = useLocale();
    const queryClient = useQueryClient();
    const { can } = useRBAC();
    const canUpdateIntern = can("INTERN_UPDATE");
    const canUpdateUser = can("USER_UPDATE");
    const { mutate: updateIntern } = useUpdateIntern();

    const [editingPhone, setEditingPhone] = useState(false);
    const [phone, setPhone] = useState(intern.phone);

    // Mutation to toggle User account authorization (isActive)
    const { mutate: toggleUserActive, isPending: togglingActive } = useMutation({
        mutationFn: (isActive: boolean) =>
            updateUserService(intern.userId, { isActive }),
        onSuccess: () => {
            toast.success(t("admin.interns.details.statusUpdated"));
            queryClient.invalidateQueries({ queryKey: ["intern", intern.id] });
            queryClient.invalidateQueries({ queryKey: ["interns"] });
        },
        onError: () => toast.error(t("admin.interns.details.statusUpdateError")),
    });

    const created = formatDate(intern.createdAt, locale);

    return (
        <MetalCard>
            <div className="p-6 h-full flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                        <User className="h-5 w-5 text-primary-light shrink-0" />
                        <h2 className="text-base sm:text-lg font-bold tracking-wide metal-text">
                            {t("admin.interns.details.personalDetails")}
                        </h2>
                    </div>

                    <div className="mt-5 space-y-4">
                        <InfoRow
                            icon={Mail}
                            label={t("admin.interns.details.email")}
                            value={intern.user.email}
                        />

                        <InfoRow
                            icon={Hash}
                            label={t("admin.interns.details.userId")}
                            value={intern.userId}
                            className="font-mono text-xs bg-card px-2 py-0.5 rounded border border-border/40"
                        />

                        {/* Phone with Inline Edit */}
                        <div className="flex items-center justify-between py-2 border-b border-border/20">
                            <div className="flex items-center gap-3 text-sm font-medium text-muted">
                                <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <span>{t("admin.interns.details.phone")}</span>
                            </div>
                            {canUpdateIntern ? (
                                editingPhone ? (
                                    <div className="flex items-center gap-1.5">
                                        <input
                                            type="text"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            onBlur={() => {
                                                if (phone !== intern.phone) {
                                                    updateIntern({
                                                        id: intern.id,
                                                        payload: { phone },
                                                    });
                                                }
                                                setEditingPhone(false);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter")
                                                    (e.target as HTMLInputElement).blur();
                                            }}
                                            autoFocus
                                            className="rounded-lg border border-primary-light bg-card px-3 py-1 text-sm text-foreground outline-none ring-2 ring-primary-light/20 shadow-inner w-36 transition-all"
                                        />
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setEditingPhone(true)}
                                        className="rounded-lg px-2.5 py-1 text-sm font-medium text-foreground transition-all duration-200 hover:bg-card hover:text-cyan-400 border border-transparent hover:border-border active:scale-95"
                                    >
                                        {phone || t("admin.interns.details.addPhone")}
                                    </button>
                                )
                            ) : (
                                <span className="text-sm font-medium text-foreground">
                                    {phone || "—"}
                                </span>
                            )}
                        </div>

                        {/* Account Status with Toggle Action */}
                        <div className="flex items-center justify-between py-2 border-b border-border/20">
                            <div className="flex items-center gap-3 text-sm font-medium text-muted">
                                {intern.user.isActive ? (
                                    <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                                ) : (
                                    <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400" />
                                )}
                                <span>{t("admin.interns.details.accountStatus")}</span>
                            </div>
                            {canUpdateUser ? (
                                <button
                                    type="button"
                                    disabled={togglingActive}
                                    onClick={() => toggleUserActive(!intern.user.isActive)}
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition active:scale-95 disabled:opacity-50 ${
                                        intern.user.isActive
                                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                            : "border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                                    }`}
                                >
                                    <Circle className="h-2 w-2 fill-current" />
                                    {intern.user.isActive
                                        ? t("admin.interns.details.authorized")
                                        : t("admin.interns.details.deactivated")}
                                </button>
                            ) : (
                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                                        intern.user.isActive
                                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                            : "border-rose-500/30 bg-rose-500/10 text-rose-400"
                                    }`}
                                >
                                    <Circle className="h-2 w-2 fill-current" />
                                    {intern.user.isActive
                                        ? t("admin.interns.details.authorized")
                                        : t("admin.interns.details.deactivated")}
                                </span>
                            )}
                        </div>

                        <InfoRow
                            icon={Calendar}
                            label={t("admin.interns.details.profileCreated")}
                            value={created}
                        />
                    </div>
                </div>
            </div>
        </MetalCard>
    );
}

/* ─── Internship Info Card ─────────────────────────────────── */

function InternshipInfo({ intern }: { intern: Intern }) {
    const t = useTranslations();
    const locale = useLocale();
    const { can } = useRBAC();
    const canAssignLeader = can("INTERN_LEADER_ASSIGN") || can("INTERN_UPDATE");
    const canUpdateIntern = can("INTERN_UPDATE");
    const { mutate: updateIntern } = useUpdateIntern();

    const { data: leadersData } = useLeaders();
    const leaders = extractArray<Leader>(leadersData?.data);

    const { data: posData } = usePositions(intern.department?.id ?? undefined);
    const positions = extractArray<Position>(posData?.data);

    const selectedLeader = intern.leaderId
        ? leaders.find((l) => l.userId === intern.leaderId)
        : null;
    const allowedDepartments = Array.isArray(selectedLeader?.departments)
        ? selectedLeader.departments
        : [];

    const startDate = formatDate(intern.startDate, locale);
    const endDate = new Date(intern.startDate);
    endDate.setMonth(endDate.getMonth() + intern.duration);
    const endDateStr = formatDate(endDate.toISOString(), locale);

    return (
        <MetalCard>
            <div className="p-6 h-full flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                        <Briefcase className="h-5 w-5 text-primary-light shrink-0" />
                        <h2 className="text-base sm:text-lg font-bold tracking-wide metal-text">
                            {t("admin.interns.details.programPlacement")}
                        </h2>
                    </div>

                    <div className="mt-5 space-y-4">
                        {/* Mentor Selector */}
                        <div className="flex items-center justify-between py-2 border-b border-border/20">
                            <div className="flex items-center gap-3 text-sm font-medium text-muted">
                                <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <span>{t("admin.interns.details.mentor")}</span>
                            </div>
                            {canAssignLeader ? (
                                <InlineSelect
                                    ariaLabel={t("admin.interns.details.mentor")}
                                    value={intern.leaderId}
                                    placeholder={t("admin.interns.details.notAssigned")}
                                    onChange={(newId) => {
                                        const selectedLdr = newId
                                            ? leaders.find((l) => l.userId === newId)
                                            : null;
                                        const hasSingleDepartment = selectedLdr?.departments?.length === 1;

                                        updateIntern({
                                            id: intern.id,
                                            payload: {
                                                leaderId: newId || null,
                                                ...(hasSingleDepartment ? {
                                                    departmentId: selectedLdr.departments[0].id,
                                                } : {
                                                    departmentId: null,
                                                    positionId: null,
                                                }),
                                            },
                                        });
                                    }}
                                    options={[
                                        { value: null, label: t("admin.interns.details.notAssigned") },
                                        ...leaders.map((l) => ({
                                            value: l.userId,
                                            label: l.user.fullName
                                                ? `${l.user.fullName} (${l.user.email})`
                                                : l.user.email,
                                        })),
                                    ]}
                                />
                            ) : (
                                <span className="text-sm font-medium text-foreground">
                                    {selectedLeader?.user?.fullName ?? selectedLeader?.user?.email ?? t("admin.interns.details.notAssigned")}
                                </span>
                            )}
                        </div>

                        {/* Department Selector */}
                        <div className="flex items-center justify-between py-2 border-b border-border/20">
                            <div className="flex items-center gap-3 text-sm font-medium text-muted">
                                <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <span>{t("admin.interns.details.department")}</span>
                            </div>
                            {canUpdateIntern ? (
                                <InlineSelect
                                    ariaLabel={t("admin.interns.details.department")}
                                    value={intern.department?.id ?? null}
                                    placeholder={t("admin.interns.details.notAssigned")}
                                    disabled={!intern.leaderId}
                                    onDisabledClick={() => toast.error(t("admin.interns.selectLeaderFirst"))}
                                    onChange={(newId) => {
                                        updateIntern({
                                            id: intern.id,
                                            payload: {
                                                departmentId: newId,
                                                positionId: null,
                                            },
                                        });
                                    }}
                                    options={[
                                        { value: null, label: t("admin.interns.details.notAssigned") },
                                        ...allowedDepartments.map((d) => ({
                                            value: d.id,
                                            label: d.name,
                                        })),
                                    ]}
                                />
                            ) : (
                                <span className="text-sm font-medium text-foreground">
                                    {intern.department?.name ?? t("admin.interns.details.notAssigned")}
                                </span>
                            )}
                        </div>

                        {/* Job Role Selector */}
                        <div className="flex items-center justify-between py-2 border-b border-border/20">
                            <div className="flex items-center gap-3 text-sm font-medium text-muted">
                                <Briefcase className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <span>{t("admin.interns.details.jobRole")}</span>
                            </div>
                            {canUpdateIntern ? (
                                <InlineSelect
                                    ariaLabel={t("admin.interns.details.jobRole")}
                                    value={intern.position?.id ?? null}
                                    placeholder={t("admin.interns.details.notAssigned")}
                                    disabled={!intern.department?.id}
                                    onDisabledClick={() => toast.error(t("admin.interns.departmentRequired"))}
                                    onChange={(newId) => {
                                        updateIntern({
                                            id: intern.id,
                                            payload: {
                                                positionId: newId || undefined,
                                            },
                                        });
                                    }}
                                    options={[
                                        { value: null, label: t("admin.interns.details.notAssigned") },
                                        ...positions.map((p) => ({
                                            value: p.id,
                                            label: p.name,
                                        })),
                                    ]}
                                />
                            ) : (
                                <span className="text-sm font-medium text-foreground">
                                    {intern.position?.name ?? t("admin.interns.details.notAssigned")}
                                </span>
                            )}
                        </div>

                        <InfoRow
                            icon={Calendar}
                            label={t("admin.interns.details.activeTimeline")}
                            value={`${startDate} — ${endDateStr}`}
                            valueClass="text-foreground font-medium"
                        />

                        <InfoRow
                            icon={Clock}
                            label={t("admin.interns.details.totalDuration")}
                            value={t("admin.interns.details.durationMonths", { n: intern.duration, plural: intern.duration > 1 ? "s" : "" })}
                            valueClass="bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded-full border border-indigo-500/20 text-xs font-semibold"
                        />
                    </div>
                </div>
            </div>
        </MetalCard>
    );
}

/* ─── Task List Table Card ─────────────────────────────────── */

const TASK_COLUMNS = "minmax(80px,0.8fr) minmax(200px,2fr) 110px 140px 140px";

const priorityBadge: Record<string, string> = {
    HIGH: "border-rose-400/30 bg-rose-500/10 text-rose-300",
    MEDIUM: "border-amber-400/30 bg-amber-500/10 text-amber-300",
    LOW: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
};

const taskStatusBadge: Record<string, string> = {
    TODO: "border-sky-400/30 bg-sky-500/10 text-sky-300",
    IN_PROGRESS: "border-blue-400/30 bg-blue-500/10 text-blue-300",
    REVIEW: "border-amber-400/30 bg-amber-500/10 text-amber-300",
    DONE: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
    BLOCKED: "border-rose-400/30 bg-rose-500/10 text-rose-300",
    PENDING_APPROVAL: "border-purple-400/30 bg-purple-500/10 text-purple-300",
};

function TaskListCard({ assignments }: { assignments: TaskAssignment[] }) {
    const t = useTranslations();
    const locale = useLocale();

    return (
        <MetalCard>
            <div className="p-6">
                <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-5">
                    <div className="flex items-center gap-2">
                        <ListTodo className="h-5 w-5 text-primary-light shrink-0" />
                        <h2 className="text-base sm:text-lg font-bold tracking-wide metal-text">
                            {t("admin.interns.details.tasksTitle")}
                        </h2>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            {assignments.length}
                        </span>
                    </div>
                </div>

                {assignments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-muted mb-2">
                            <ListTodo className="h-6 w-6" />
                        </div>
                        <p className="text-sm text-muted">
                            {t("admin.interns.details.noTasks")}
                        </p>
                    </div>
                ) : (
                    <Table columns={TASK_COLUMNS}>
                        <Table.Header>
                            <div>{t("admin.interns.details.colTaskCode")}</div>
                            <div>{t("admin.interns.details.colTaskTitle")}</div>
                            <div>{t("admin.interns.details.colTaskPriority")}</div>
                            <div>{t("admin.interns.details.colTaskDeadline")}</div>
                            <div>{t("admin.interns.details.colTaskStatus")}</div>
                        </Table.Header>

                        <Table.Body
                            data={assignments}
                            render={(item: TaskAssignment) => (
                                <Table.Row key={item.id}>
                                    <div className="font-mono text-xs text-muted truncate">
                                        {item.task.code || "—"}
                                    </div>
                                    <div className="font-medium text-foreground truncate">
                                        {item.task.title}
                                    </div>
                                    <div>
                                        <span
                                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                                                priorityBadge[item.task.priority] ?? "border-border text-muted"
                                            }`}
                                        >
                                            {item.task.priority}
                                        </span>
                                    </div>
                                    <div className="text-sm text-muted">
                                        {formatDate(item.task.deadline, locale)}
                                    </div>
                                    <div>
                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                                                taskStatusBadge[item.status] ?? "border-border text-muted"
                                            }`}
                                        >
                                            <Circle className="h-1.5 w-1.5 fill-current" />
                                            {item.status}
                                        </span>
                                    </div>
                                </Table.Row>
                            )}
                        />
                    </Table>
                )}
            </div>
        </MetalCard>
    );
}

/* ─── Helpers ──────────────────────────────────────────────── */

function InfoRow({
    icon: Icon,
    label,
    value,
    className = "",
    valueClass = "text-foreground font-medium",
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    className?: string;
    valueClass?: string;
}) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-border/20 last:border-b-0">
            <div className="flex items-center gap-3 text-sm text-muted">
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span>{label}</span>
            </div>
            <span className={`text-sm tracking-wide ${valueClass} ${className}`}>{value}</span>
        </div>
    );
}

function DropConfirm({
    name,
    onConfirm,
    onCloseModal,
}: {
    name: string;
    onConfirm: (close?: () => void) => void;
    onCloseModal?: () => void;
}) {
    const t = useTranslations();
    return (
        <div className="p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shadow-inner">
                <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold tracking-tight text-foreground">
                {t("admin.interns.details.dropConfirmTitle")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted max-w-xs mx-auto">
                {t("admin.interns.details.dropConfirmDesc", { name })}
            </p>
            <div className="mt-6 flex justify-center gap-3">
                <button
                    onClick={onCloseModal}
                    className="flex-1 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-muted transition hover:text-foreground active:scale-95"
                >
                    {t("admin.interns.details.cancel")}
                </button>
                <button
                    onClick={() => onConfirm(onCloseModal)}
                    className="flex-1 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 shadow-md shadow-rose-950/40 active:scale-95"
                >
                    {t("admin.interns.details.dropNow")}
                </button>
            </div>
        </div>
    );
}
