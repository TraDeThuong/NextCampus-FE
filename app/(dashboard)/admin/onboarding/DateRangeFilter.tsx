"use client";

import { useMemo } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { DateRangePicker } from "@/components/ui/DatePicker";

type Range = "this-week" | "this-month" | "custom" | null;

function getWeekRange() {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? 6 : day - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - diff);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return { from: monday, to: sunday };
}

function getMonthRange() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { from: start, to: end };
}

function fmtDateInput(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

export default function DateRangeFilter() {
    const t = useTranslations();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const currentFrom = searchParams.get("createdFrom") ?? "";
    const currentTo = searchParams.get("createdTo") ?? "";

    const week = useMemo(() => getWeekRange(), []);
    const month = useMemo(() => getMonthRange(), []);

    const weekFrom = fmtDateInput(week.from);
    const weekTo = fmtDateInput(week.to);
    const monthFrom = fmtDateInput(month.from);
    const monthTo = fmtDateInput(month.to);

    const activeRange: Range =
        currentFrom === weekFrom && currentTo === weekTo
            ? "this-week"
            : currentFrom === monthFrom && currentTo === monthTo
              ? "this-month"
              : currentFrom && currentTo
                ? "custom"
                : null;

    function applyRange(r: "this-week" | "this-month") {
        const params = new URLSearchParams(searchParams.toString());

        if (r === "this-week") {
            if (activeRange === "this-week") {
                params.delete("createdFrom");
                params.delete("createdTo");
            } else {
                params.set("createdFrom", weekFrom);
                params.set("createdTo", weekTo);
            }
        } else if (r === "this-month") {
            if (activeRange === "this-month") {
                params.delete("createdFrom");
                params.delete("createdTo");
            } else {
                params.set("createdFrom", monthFrom);
                params.set("createdTo", monthTo);
            }
        }

        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
    }

    function applyCustom(from: string, to: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (from) params.set("createdFrom", from);
        else params.delete("createdFrom");
        if (to) params.set("createdTo", to);
        else params.delete("createdTo");
        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
    }

    function handleClear() {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("createdFrom");
        params.delete("createdTo");
        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
    }

    const pillBase =
        "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 border cursor-pointer whitespace-nowrap active:scale-95";
    const pillActive =
        "border-cyan-400/50 bg-cyan-500/15 text-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.2)]";
    const pillInactive =
        "border-transparent text-muted hover:text-foreground hover:border-border dark:hover:border-white/10 hover:bg-card/60";

    return (
        <div className="flex flex-wrap items-center gap-2 max-w-full">
            <div className="flex items-center gap-1.5 shrink-0">
                <button
                    type="button"
                    onClick={() => applyRange("this-week")}
                    className={`${pillBase} ${activeRange === "this-week" ? pillActive : pillInactive}`}
                >
                    {t("admin.onboarding.thisWeek")}
                </button>
                <button
                    type="button"
                    onClick={() => applyRange("this-month")}
                    className={`${pillBase} ${activeRange === "this-month" ? pillActive : pillInactive}`}
                >
                    {t("admin.onboarding.thisMonth")}
                </button>
            </div>

            {/* Custom Cyberpunk Date Range Picker (Zero native input) */}
            <DateRangePicker
                startDate={currentFrom}
                endDate={currentTo}
                onChange={applyCustom}
                onClear={handleClear}
                placeholder={t("admin.onboarding.custom")}
                align="right"
                className="max-w-full"
            />
        </div>
    );
}