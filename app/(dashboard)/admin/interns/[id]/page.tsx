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
    ChevronDown,
} from "lucide-react";

import { useTranslations, useLocale } from "next-intl";
import { useInternDetail } from "@/hooks/intern/useInternDetail";
import { useUpdateIntern } from "@/hooks/intern/useUpdateIntern";
import { useDepartments } from "@/hooks/department/useDepartments";
import { usePositions } from "@/hooks/department/usePositions";
import { useLeaders } from "@/hooks/leader/useLeaders";
import type { Intern } from "@/types/intern";
import MetalCard from "@/components/ui/MetalCard";
import Modal from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";

export default function InternDetailPage() {
    const t = useTranslations();
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { data, error, isLoading, isError, refetch } = useInternDetail(params.id);
    const intern = data?.data;
    const isNotFound =
        !intern &&
        (!isError || (isAxiosError(error) && error.response?.status === 404));

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    if (isError || !intern) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
                <div className="rounded-full bg-slate-800/50 p-4 border border-slate-700/50">
                    <XCircle className="h-8 w-8 text-rose-400" />
                </div>
                <p className="text-slate-400 font-medium">
                    {isNotFound
                        ? t("admin.interns.details.notFound")
                        : t("admin.interns.details.loadError")}
                </p>
                <div className="flex items-center gap-3">
                    {!isNotFound && (
                        <button
                            type="button"
                            onClick={() => void refetch()}
                            className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20"
                        >
                            {t("admin.interns.details.tryAgain")}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="group flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/40 px-4 py-2 text-sm font-medium text-slate-300 transition-all duration-300 hover:bg-slate-800 hover:text-cyan-400 hover:border-cyan-500/50 shadow-lg shadow-cyan-950/20"
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        {t("admin.interns.details.goBack")}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto w-auto space-y-8 px-4 py-6">
            {/* Back action */}
            <button
                onClick={() => router.push("/admin/interns")}
                className="group inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors duration-200 hover:text-cyan-400"
            >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                {t("admin.interns.details.back")}
            </button>

            {/* Header section */}
            <InternHeader intern={intern} />

            {/* Main content grid */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <PersonalInfo intern={intern} />
                <InternshipInfo intern={intern} />
            </div>

            {/* Integrations section */}
            <DiscordCard intern={intern} />
        </div>
    );
}

function InternHeader({ intern }: { intern: Intern }) {
    const t = useTranslations();
    const locale = useLocale();
    const { mutate: updateIntern } = useUpdateIntern();
    const [status, setStatus] = useState(intern.status);

    const statusBadge: Record<string, string> = {
        ACTIVE: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
        COMPLETED: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400 ring-cyan-500/20",
        DROPPED: "border-rose-500/30 bg-rose-500/10 text-rose-400 ring-rose-500/20",
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
                <div className="relative overflow-hidden rounded-3xl bg-slate-900/40 p-6 backdrop-blur-md border border-slate-800/60 shadow-2xl">
                    {/* Metal sheen overlay decorative element */}
                    <div className="absolute -left-16 -top-16 h-32 w-32 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
                    <div className="absolute -right-16 -bottom-16 h-32 w-32 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

                    <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-5">
                            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 font-bold text-3xl text-white shadow-xl border border-slate-700/60 ring-1 ring-white/10">
                                {intern.fullName.charAt(0).toUpperCase()}
                                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-slate-900 bg-emerald-500 shadow-md" />
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                                    {intern.fullName}
                                </h1>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
                                    <span className="flex items-center gap-1.5 hover:text-slate-300 transition-colors">
                                        <Mail className="h-4 w-4 text-slate-500" />
                                        {intern.user.email}
                                    </span>
                                    <span className="text-slate-600">•</span>
                                    <span className="text-slate-500 font-medium">{joined}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative group">
                                <select
                                    value={status}
                                    onChange={(e) => {
                                        const v = e.target.value as Intern["status"];
                                        setStatus(v);
                                        updateIntern({
                                            id: intern.id,
                                            payload: { status: v },
                                        }, {
                                            onError: () => setStatus(intern.status),
                                        });
                                    }}
                                    className={`appearance-none rounded-xl border px-4 py-2 pr-9 text-xs font-semibold tracking-wide uppercase outline-none transition-all duration-300 cursor-pointer ring-1 ${statusBadge[status]}`}
                                >
                                    <option value="ACTIVE" className="bg-slate-950 text-emerald-400">
                                        {t("admin.interns.details.active")}
                                    </option>
                                    <option value="COMPLETED" className="bg-slate-950 text-cyan-400">
                                        {t("admin.interns.details.completed")}
                                    </option>
                                    <option value="DROPPED" className="bg-slate-950 text-rose-400">
                                        {t("admin.interns.details.dropped")}
                                    </option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 opacity-60 pointer-events-none" />
                            </div>

                            {status === "ACTIVE" && (
                                <Modal.Open opens="drop-intern">
                                    <button className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-xs font-semibold tracking-wide uppercase text-rose-400 transition-all duration-300 hover:bg-rose-500/20 hover:border-rose-500/40 active:scale-95">
                                        <Trash2 className="h-3.5 w-3.5" />
                                        {t("admin.interns.details.dropIntern")}
                                    </button>
                                </Modal.Open>
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

function PersonalInfo({ intern }: { intern: Intern }) {
    const t = useTranslations();
    const locale = useLocale();
    const { mutate: updateIntern } = useUpdateIntern();
    const [editingPhone, setEditingPhone] = useState(false);
    const [phone, setPhone] = useState(intern.phone);

    const created = new Date(intern.createdAt).toLocaleDateString(
        locale === "vi" ? "vi-VN" : "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );

    return (
        <MetalCard>
            <div className="rounded-3xl bg-slate-900/40 p-6 border border-slate-800/60 shadow-xl backdrop-blur-md h-full">
                <h2 className="text-lg font-bold tracking-wide bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent border-b border-slate-800/80 pb-3">
                    {t("admin.interns.details.personalDetails")}
                </h2>
                <div className="mt-5 space-y-4">
                    <InfoRow icon={Mail} label={t("admin.interns.details.email")} value={intern.user.email} />
                    <InfoRow icon={Hash} label={t("admin.interns.details.userId")} value={intern.userId} className="font-mono text-xs bg-slate-950/40 px-2 py-0.5 rounded border border-slate-800/30" />

                    <div className="flex items-center justify-between group py-1">
                        <div className="flex items-center gap-3 text-sm font-medium text-slate-400">
                            <Phone className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                            <span>{t("admin.interns.details.phone")}</span>
                        </div>
                        {editingPhone ? (
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
                                className="rounded-lg border border-cyan-500/50 bg-slate-950 px-3 py-1 text-sm text-white outline-none ring-2 ring-cyan-500/20 shadow-inner w-44 transition-all"
                            />
                        ) : (
                            <button
                                onClick={() => setEditingPhone(true)}
                                className="rounded-md px-2 py-0.5 text-sm font-medium text-slate-200 transition-all duration-200 hover:bg-slate-800 hover:text-cyan-400 border border-transparent hover:border-slate-700"
                            >
                                {phone || t("admin.interns.details.addPhone")}
                            </button>
                        )}
                    </div>

                    <InfoRow
                        icon={intern.user.isActive ? CheckCircle2 : XCircle}
                        label={t("admin.interns.details.accountStatus")}
                        value={intern.user.isActive ? t("admin.interns.details.authorized") : t("admin.interns.details.deactivated")}
                        valueClass={intern.user.isActive ? "text-emerald-400" : "text-rose-400"}
                    />
                    <InfoRow icon={Calendar} label={t("admin.interns.details.profileCreated")} value={created} />
                </div>
            </div>
        </MetalCard>
    );
}

function InternshipInfo({ intern }: { intern: Intern }) {
    const t = useTranslations();
    const locale = useLocale();
    const { mutate: updateIntern } = useUpdateIntern();
    const { data: deptData } = useDepartments();
    const { data: leadersData } = useLeaders();
    const departments = deptData?.data ?? [];
    const leaders = leadersData?.data ?? [];
    const { data: posData } = usePositions(intern.department?.id ?? undefined);
    const positions = posData?.data ?? [];

    const selectedLeader = intern.leaderId
        ? leaders.find((l) => l.userId === intern.leaderId)
        : null;
    const allowedDepartments = selectedLeader
        ? selectedLeader.departments
        : [];

    const startDate = new Date(intern.startDate).toLocaleDateString(
        locale === "vi" ? "vi-VN" : "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
    const endDate = new Date(intern.startDate);
    endDate.setMonth(endDate.getMonth() + intern.duration);
    const endDateStr = endDate.toLocaleDateString(
        locale === "vi" ? "vi-VN" : "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );

    return (
        <MetalCard>
            <div className="rounded-3xl bg-slate-900/40 p-6 border border-slate-800/60 shadow-xl backdrop-blur-md h-full">
                <h2 className="text-lg font-bold tracking-wide bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent border-b border-slate-800/80 pb-3">
                    {t("admin.interns.details.programPlacement")}
                </h2>
                <div className="mt-5 space-y-4">
                    <InlineSelectRow
                        icon={User}
                        label={t("admin.interns.details.mentor")}
                        value={intern.leader?.fullName ?? t("admin.interns.details.notAssigned")}
                        options={leaders.map((l) => ({
                            value: l.userId,
                            label: l.user.fullName ? `${l.user.fullName} (${l.user.email})` : l.user.email,
                        }))}
                        currentId={intern.leaderId ?? ""}
                        onChange={(id) => {
                            const selectedLeader = id
                                ? leaders.find((l) => l.userId === id)
                                : null;
                            const hasSingleDepartment = selectedLeader?.departments?.length === 1;

                            updateIntern({
                                id: intern.id,
                                payload: {
                                    leaderId: id || null,
                                    ...(hasSingleDepartment ? {
                                        departmentId: selectedLeader.departments[0].id,
                                    } : {
                                        departmentId: null,
                                        positionId: null,
                                    }),
                                },
                            });
                        }}
                    />

                    <InlineSelectRow
                        icon={Building2}
                        label={t("admin.interns.details.department")}
                        value={intern.department?.name ?? t("admin.interns.details.notAssigned")}
                        options={allowedDepartments.map((d) => ({
                            value: d.id,
                            label: d.name,
                        }))}
                        currentId={intern.department?.id ?? ""}
                        disabled={!intern.leaderId}
                        onChange={(id) =>
                            updateIntern({
                                id: intern.id,
                                payload: { departmentId: id || undefined },
                            })
                        }
                    />

                    <InlineSelectRow
                        icon={Briefcase}
                        label={t("admin.interns.details.jobRole")}
                        value={intern.position?.name ?? t("admin.interns.details.notAssigned")}
                        options={positions.map((p) => ({
                            value: p.id,
                            label: p.name,
                        }))}
                        currentId={intern.position?.id ?? ""}
                        disabled={!intern.department?.id}
                        onChange={(id) =>
                            updateIntern({
                                id: intern.id,
                                payload: { positionId: id || undefined },
                            })
                        }
                    />

                    <InfoRow
                        icon={Calendar}
                        label={t("admin.interns.details.activeTimeline")}
                        value={`${startDate} — ${endDateStr}`}
                        valueClass="text-slate-300 font-medium"
                    />
                    <InfoRow
                        icon={Clock}
                        label={t("admin.interns.details.totalDuration")}
                        value={t("admin.interns.details.durationMonths", { n: intern.duration, plural: intern.duration > 1 ? "s" : "" })}
                        valueClass="bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded-full border border-indigo-500/20 text-xs font-semibold"
                    />
                </div>
            </div>
        </MetalCard>
    );
}

function DiscordCard({ intern }: { intern: Intern }) {
    const t = useTranslations();
    return (
        <MetalCard>
            <div className="relative overflow-hidden rounded-3xl bg-slate-900/40 p-6 border border-slate-800/60 shadow-xl backdrop-blur-md">
                {/* Visual Glow Brand Effect */}
                <div className="absolute -right-10 top-1/2 h-20 w-20 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-2xl pointer-events-none" />

                <h2 className="text-lg font-bold tracking-wide bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent border-b border-slate-800/80 pb-3">
                    {t("admin.interns.details.communityIntegrations")}
                </h2>
                <div className="mt-5 grid gap-6 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-950/40 border border-slate-800/60 p-4 transition-all duration-300 hover:border-indigo-500/30">
                        <InfoRow
                            icon={User}
                            label={t("admin.interns.details.discordHandle")}
                            value={intern.discordUsername ?? t("admin.interns.details.notLinked")}
                            valueClass={intern.discordUsername ? "text-indigo-400 font-semibold" : "text-slate-500 italic"}
                        />
                    </div>
                    <div className="rounded-2xl bg-slate-950/40 border border-slate-800/60 p-4 transition-all duration-300 hover:border-indigo-500/30">
                        <InfoRow
                            icon={Circle}
                            label={t("admin.interns.details.serverRoleSync")}
                            value={intern.discordRoleGranted ? t("admin.interns.details.synchronized") : t("admin.interns.details.pendingSync")}
                            valueClass={intern.discordRoleGranted ? "text-emerald-400 font-semibold" : "text-amber-400/80 font-medium"}
                        />
                    </div>
                </div>
            </div>
        </MetalCard>
    );
}

function InfoRow({
    icon: Icon,
    label,
    value,
    className = "",
    valueClass = "text-slate-200 font-medium",
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    className?: string;
    valueClass?: string;
}) {
    return (
        <div className="flex items-center justify-between py-1.5">
            <div className="flex items-center gap-3 text-sm text-slate-400">
                <Icon className="h-4 w-4 text-slate-500" />
                <span>{label}</span>
            </div>
            <span className={`text-sm tracking-wide ${valueClass} ${className}`}>{value}</span>
        </div>
    );
}

function InlineSelectRow({
    icon: Icon,
    label,
    value,
    options,
    currentId,
    onChange,
    disabled = false,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    options: { value: string; label: string }[];
    currentId: string;
    onChange: (id: string) => void;
    disabled?: boolean;
}) {
    const t = useTranslations();
    const [editing, setEditing] = useState(false);

    return (
        <div className="flex items-center justify-between group py-1.5">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-400">
                <Icon className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                <span>{label}</span>
            </div>
            {editing && !disabled ? (
                <div className="relative">
                    <select
                        value={currentId}
                        onChange={(e) => {
                            onChange(e.target.value);
                            setEditing(false);
                        }}
                        onBlur={() => setEditing(false)}
                        autoFocus
                        className="appearance-none rounded-lg border border-cyan-500/50 bg-slate-950 pl-3 pr-8 py-1 text-sm text-white outline-none ring-2 ring-cyan-500/20 shadow-inner max-w-48 transition-all cursor-pointer"
                    >
                        <option value="">{t("admin.interns.details.notAssigned")}</option>
                        {options.map((o) => (
                            <option key={o.value} value={o.value} className="bg-slate-950">
                                {o.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 opacity-60 pointer-events-none" />
                </div>
            ) : (
                <button
                    onClick={() => !disabled && setEditing(true)}
                    disabled={disabled}
                    className={`rounded-md px-2 py-0.5 text-sm font-medium text-slate-200 transition-all duration-200 border border-transparent ${
                        disabled 
                            ? "opacity-50 cursor-not-allowed text-slate-500" 
                            : "hover:bg-slate-800 hover:text-cyan-400 hover:border-slate-700"
                    }`}
                >
                    {disabled ? t("admin.interns.selectLeaderFirst") : value}
                </button>
            )}
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
        <div className="relative overflow-hidden rounded-2xl p-6 shadow-2xl text-center">
            <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-b from-rose-500/20 to-rose-500/5 border border-rose-500/30 text-rose-400 shadow-inner">
                <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-xl font-bold tracking-tight text-white">
                {t("admin.interns.details.dropConfirmTitle")}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-400 max-w-xs mx-auto">
                {t("admin.interns.details.dropConfirmDesc", { name })}
            </p>
            <div className="mt-8 flex justify-center gap-3">
                <button
                    onClick={onCloseModal}
                    className="flex-1 rounded-xl border border-slate-800 bg-slate-900/50 px-5 py-2.5 text-sm font-semibold text-slate-300 transition-all hover:bg-slate-800 hover:text-white"
                >
                    {t("admin.interns.details.cancel")}
                </button>
                <button
                    onClick={() => onConfirm(onCloseModal)}
                    className="flex-1 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:from-rose-500 hover:to-rose-600 shadow-lg shadow-rose-950/40 active:scale-[0.98] "
                >
                    {t("admin.interns.details.dropNow")}
                </button>
            </div>
        </div>
    );
}
