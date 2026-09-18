"use client";

import { useState, useMemo } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";

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
    return d.toISOString().slice(0, 10);
}

function fmtDisplay(d: Date, locale: string) {
    return d.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
        month: "short",
        day: "numeric",
    });
}

export default function DateRangeFilter() {
    const t = useTranslations();
    const locale = useLocale();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const currentFrom = searchParams.get("createdFrom") ?? "";
    const currentTo = searchParams.get("createdTo") ?? "";

    const week = useMemo(() => getWeekRange(), []);
    const month = useMemo(() => getMonthRange(), []);

    const activeRange: Range =
        currentFrom === fmtDateInput(week.from) && currentTo === fmtDateInput(week.to)
            ? "this-week"
            : currentFrom === fmtDateInput(month.from) && currentTo === fmtDateInput(month.to)
              ? "this-month"
              : currentFrom && currentTo
                ? "custom"
                : null;

    const [range, setRange] = useState<Range>(activeRange);

    function applyRange(r: Range) {
        setRange(r);
        const params = new URLSearchParams(searchParams.toString());

        if (r === "this-week") {
            params.set("createdFrom", fmtDateInput(week.from));
            params.set("createdTo", fmtDateInput(week.to));
        } else if (r === "this-month") {
            params.set("createdFrom", fmtDateInput(month.from));
            params.set("createdTo", fmtDateInput(month.to));
        } else if (r === "custom") {
            if (currentFrom) params.set("createdFrom", currentFrom);
            if (currentTo) params.set("createdTo", currentTo);
        } else {
            params.delete("createdFrom");
            params.delete("createdTo");
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

    const pillBase =
        "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 border cursor-pointer whitespace-nowrap active:scale-95";
    const pillActive =
        "border-primary-light/40 bg-primary-light/15 text-primary-light shadow-[0_0_16px_rgba(21,174,245,0.15)]";
    const pillInactive =
        "border-transparent text-muted hover:text-foreground hover:border-border dark:hover:border-white/10 hover:bg-card/60";

    const activeLabel =
        activeRange === "this-week"
            ? `${fmtDisplay(week.from, locale)} – ${fmtDisplay(week.to, locale)}`
            : activeRange === "this-month"
              ? `${fmtDisplay(month.from, locale)} – ${fmtDisplay(month.to, locale)}`
              : activeRange === "custom"
                ? `${currentFrom} – ${currentTo}`
                : null;

    return (
        <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-1.5">
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
                <button
                    type="button"
                    onClick={() => {
                        setRange("custom");
                        applyRange("custom");
                    }}
                    className={`${pillBase} ${activeRange === "custom" ? pillActive : pillInactive}`}
                >
                    {t("admin.onboarding.custom")}
                </button>
            </div>

            {activeLabel && (
                <p className="text-xs text-muted font-medium tracking-wide pl-1">
                    {activeLabel}
                </p>
            )}

            {range === "custom" && (
                <div className="flex items-center gap-2 pt-1">
                    <input
                        type="date"
                        value={currentFrom}
                        onChange={(e) => applyCustom(e.target.value, currentTo)}
                        onClick={(e) => {
                            try {
                                e.currentTarget.showPicker?.();
                            } catch {}
                        }}
                        className="w-[144px] rounded-xl border border-border dark:border-white/10 bg-card/60 dark:bg-white/[0.04] py-1.5 px-3 [font-family:var(--font-body),sans-serif] text-xs text-foreground outline-none transition-all cursor-pointer hover:border-border-strong focus:border-primary-light/50 focus:shadow-[0_0_16px_rgba(21,174,245,0.1)] [color-scheme:light] dark:[color-scheme:dark]"
                    />
                    <span className="text-xs text-muted">–</span>
                    <input
                        type="date"
                        value={currentTo}
                        onChange={(e) => applyCustom(currentFrom, e.target.value)}
                        onClick={(e) => {
                            try {
                                e.currentTarget.showPicker?.();
                            } catch {}
                        }}
                        className="w-[144px] rounded-xl border border-border dark:border-white/10 bg-card/60 dark:bg-white/[0.04] py-1.5 px-3 [font-family:var(--font-body),sans-serif] text-xs text-foreground outline-none transition-all cursor-pointer hover:border-border-strong focus:border-primary-light/50 focus:shadow-[0_0_16px_rgba(21,174,245,0.1)] [color-scheme:light] dark:[color-scheme:dark]"
                    />
                </div>
            )}
        </div>
    );
}