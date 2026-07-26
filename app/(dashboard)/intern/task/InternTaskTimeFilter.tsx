"use client";

import { useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import MetalCard from "@/components/ui/MetalCard";

type Range = "all" | "week" | "month" | "custom";

function getWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    from: monday.toISOString().split("T")[0],
    to: sunday.toISOString().split("T")[0],
  };
}

function getMonthRange() {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    from: first.toISOString().split("T")[0],
    to: last.toISOString().split("T")[0],
  };
}

export default function InternTaskTimeFilter() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const currentRange = (searchParams.get("range") as Range) || "all";
  const [customFrom, setCustomFrom] = useState(searchParams.get("deadlineFrom") ?? "");
  const [customTo, setCustomTo] = useState(searchParams.get("deadlineTo") ?? "");

  function setRange(range: Range) {
    const params = new URLSearchParams(searchParams.toString());

    if (range === "all") {
      params.delete("range");
      params.delete("deadlineFrom");
      params.delete("deadlineTo");
    } else if (range === "week") {
      const { from, to } = getWeekRange();
      params.set("range", "week");
      params.set("deadlineFrom", from);
      params.set("deadlineTo", to);
    } else if (range === "month") {
      const { from, to } = getMonthRange();
      params.set("range", "month");
      params.set("deadlineFrom", from);
      params.set("deadlineTo", to);
    } else if (range === "custom") {
      params.set("range", "custom");
    }

    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  function applyCustom() {
    const params = new URLSearchParams(searchParams.toString());
    if (customFrom) params.set("deadlineFrom", customFrom);
    else params.delete("deadlineFrom");
    if (customTo) params.set("deadlineTo", customTo);
    else params.delete("deadlineTo");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  const btnBase =
    "rounded-xl px-4 py-2 text-xs font-medium transition border";
  const btnActive =
    "border-cyan-400/40 bg-cyan-500/15 text-cyan-300";
  const btnInactive =
    "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white";

  return (
    <MetalCard className="px-6 py-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs uppercase tracking-wider text-muted mr-1">Period:</span>

        {(["all", "week", "month", "custom"] as Range[]).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`${btnBase} ${currentRange === r ? btnActive : btnInactive}`}
          >
            {r === "all" && "All"}
            {r === "week" && "This Week"}
            {r === "month" && "This Month"}
            {r === "custom" && "Custom"}
          </button>
        ))}

        {currentRange === "custom" && (
          <div className="flex items-center gap-2 ml-2">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none focus:border-cyan-400/50"
            />
            <span className="text-xs text-muted">→</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none focus:border-cyan-400/50"
            />
            <button
              onClick={applyCustom}
              className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-500"
            >
              Apply
            </button>
          </div>
        )}
      </div>
    </MetalCard>
  );
}
