"use client";

import { useState, useMemo } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Calendar } from "lucide-react";

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

function fmtDisplay(d: Date) {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function DateRangeFilter() {
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
        "rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 border cursor-pointer whitespace-nowrap";
    const pillActive =
        "border-primary-light/40 bg-primary-light/15 text-primary-light shadow-[0_0_16px_rgba(21,174,245,0.15)]";
    const pillInactive =
        "border-transparent text-slate-400 hover:text-slate-200 hover:border-white/10 hover:bg-white/5";

    const activeLabel =
        activeRange === "this-week"
            ? `${fmtDisplay(week.from)} – ${fmtDisplay(week.to)}`
            : activeRange === "this-month"
              ? `${fmtDisplay(month.from)} – ${fmtDisplay(month.to)}`
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
                    This Week
                </button>
                <button
                    type="button"
                    onClick={() => applyRange("this-month")}
                    className={`${pillBase} ${activeRange === "this-month" ? pillActive : pillInactive}`}
                >
                    This Month
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setRange("custom");
                        applyRange("custom");
                    }}
                    className={`${pillBase} ${activeRange === "custom" ? pillActive : pillInactive}`}
                >
                    Custom
                </button>
            </div>

            {activeLabel && (
                <p className="text-xs text-slate-500 font-medium tracking-wide pl-1">
                    {activeLabel}
                </p>
            )}

            {range === "custom" && (
                <div className="flex items-center gap-2 pt-1">
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                        <input
                            type="date"
                            value={currentFrom}
                            onChange={(e) => applyCustom(e.target.value, currentTo)}
                            className="w-36 rounded-xl border border-white/10 bg-white/[0.04] py-2 pl-9 pr-3 text-xs text-foreground outline-none transition-all hover:border-white/20 focus:border-primary-light/40 focus:shadow-[0_0_16px_rgba(21,174,245,0.1)]"
                        />
                    </div>
                    <span className="text-xs text-slate-500">–</span>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                        <input
                            type="date"
                            value={currentTo}
                            onChange={(e) => applyCustom(currentFrom, e.target.value)}
                            className="w-36 rounded-xl border border-white/10 bg-white/[0.04] py-2 pl-9 pr-3 text-xs text-foreground outline-none transition-all hover:border-white/20 focus:border-primary-light/40 focus:shadow-[0_0_16px_rgba(21,174,245,0.1)]"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}