"use client";

import {
    Building2,
    Briefcase,
    Calendar,
    Clock,
    Circle,
    type LucideIcon,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

import type { Intern } from "@/types/intern";
import MetalCard from "../ui/MetalCard";

type InternInfoCardProps = { intern: Intern };

export default function InternInfoCard({ intern }: InternInfoCardProps) {
    const t = useTranslations("intern.profile");
    const locale = useLocale();

    const dateLocale = locale === "vi" ? "vi-VN" : "en-GB";
    const startDate = new Date(intern.startDate).toLocaleDateString(dateLocale, {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
    const endDate = new Date(intern.startDate);
    endDate.setMonth(endDate.getMonth() + intern.duration);
    const endDateStr = endDate.toLocaleDateString(dateLocale, {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

    const statusConfig: Record<string, { label: string; className: string; dotClass: string }> = {
        ACTIVE: {
            label: t("active"),
            className: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
            dotClass: "text-emerald-400",
        },
        COMPLETED: {
            label: t("completed"),
            className: "border-blue-400/20 bg-blue-500/10 text-blue-300",
            dotClass: "text-blue-400",
        },
        DROPPED: {
            label: t("dropped"),
            className: "border-red-400/20 bg-red-500/10 text-red-300",
            dotClass: "text-red-400",
        },
    };

    const status = statusConfig[intern.status] ?? {
        label: intern.status,
        className: "border-slate-400/20 bg-slate-500/10 text-slate-300",
        dotClass: "text-slate-400",
    };

    return (
        <MetalCard>
            <section className="rounded-3xl border border-border p-6 shadow-sm">
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold metal-text">{t("internshipInfo")}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{t("internshipInfoDesc")}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <InfoField icon={Building2} label={t("department")} value={intern.department?.name ?? "—"} />
                    <InfoField icon={Briefcase} label={t("position")} value={intern.position?.name ?? "—"} />
                    <InfoField icon={Calendar} label={t("startDate")} value={startDate} />
                    <InfoField
                        icon={Clock}
                        label={t("duration")}
                        value={t("durationMonths", { n: intern.duration, plural: intern.duration > 1 ? "s" : "" })}
                        extra={endDateStr}
                        extraLabel={t("estEnd")}
                    />
                    <StatusField status={status} label={t("status")} />
                    {intern.leader && (
                        <InfoField
                            icon={Briefcase}
                            label={t("leader")}
                            value={intern.leader.fullName ?? intern.leader.email}
                        />
                    )}
                </div>
            </section>
        </MetalCard>
    );
}

/* ─── Sub-components ────────────────────────────────────────────────────── */

type InfoFieldProps = {
    icon: LucideIcon;
    label: string;
    value: string;
    extra?: string;
    extraLabel?: string;
};

function InfoField({ icon: Icon, label, value, extra, extraLabel }: InfoFieldProps) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-2 flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground">
                <Icon className="h-4 w-4 shrink-0" />
                <span>{label}</span>
            </div>
            <p className="text-sm font-medium text-foreground truncate">{value}</p>
            {extra && (
                <p className="mt-1 text-xs text-muted-foreground">
                    {extraLabel && `${extraLabel}: `}{extra}
                </p>
            )}
        </div>
    );
}

function StatusField({
    status,
    label,
}: {
    status: { label: string; className: string; dotClass: string };
    label: string;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-2 flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground">
                <Circle className="h-4 w-4 shrink-0" />
                <span>{label}</span>
            </div>
            <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${status.className}`}
            >
                <Circle className={`h-3 w-3 fill-current shrink-0 ${status.dotClass}`} />
                {status.label}
            </span>
        </div>
    );
}
