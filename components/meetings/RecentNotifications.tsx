"use client";

import { useState } from "react";
import { Bell, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import { useNotifications } from "@/hooks/notification/useNotifications";

const MEETING_TYPES: Record<string, string> = {
  MEETING_CREATED: "border-l-emerald-500",
  MEETING_INVITATION: "border-l-sky-500",
  MEETING_CANCELLED: "border-l-red-500",
  ABSENCE_SUBMITTED: "border-l-amber-500",
  ABSENCE_REVIEWED: "border-l-violet-500",
};

function getBorderColor(type: string) {
  return MEETING_TYPES[type] || "border-l-slate-500";
}

function formatNotificationContent(type: string, content: string) {
  if (type !== "MEETING_INVITATION") return content;
  return content.replace(
    /\b(\d{1,2})\/(\d{1,2})\/(\d{4})(?=,\s*\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)\b)/,
    (_, month: string, day: string, year: string) =>
      `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`,
  );
}

export default function RecentNotifications() {
  const t = useTranslations();
  const [now] = useState(() => Date.now());
  const { data, isPending } = useNotifications({ limit: 5, order: "desc", sortBy: "createdAt" });
  const notifications = (data?.data ?? []).filter((n) => n.type in MEETING_TYPES);

  function formatTimeAgo(iso: string) {
    const diff = Math.max(0, now - new Date(iso).getTime());
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t("admin.meetings.justNow");
    if (mins < 60) return t("admin.meetings.minutesAgo", { mins });
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return t("admin.meetings.hoursAgo", { hrs });
    const days = Math.floor(hrs / 24);
    return t("admin.meetings.daysAgo", { days });
  }

  return (
    <MetalCard>
      <div className="p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 shrink-0 text-cyan-400" />
            <h3 className="text-base font-semibold metal-text">
              {t("admin.meetings.recentNotifications")}
            </h3>
          </div>
          {notifications.length > 0 && (
            <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-xs font-semibold text-cyan-300">
              {notifications.length}
            </span>
          )}
        </div>

        {isPending ? (
          <div className="flex items-center justify-center py-8">
            <Spinner size="md" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center py-6 text-center">
            <Clock className="mb-2 h-7 w-7 text-muted/40" />
            <p className="text-sm text-muted">{t("admin.meetings.noNotifications")}</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`rounded-xl border border-border/50 dark:border-white/5 bg-card/40 dark:bg-white/[0.03] px-3 py-2 border-l-2 ${getBorderColor(
                  n.type,
                )}`}
              >
                <p className="text-xs font-medium text-foreground line-clamp-1">{n.title}</p>
                <p className="mt-0.5 text-[11px] text-muted line-clamp-2">
                  {formatNotificationContent(n.type, n.content)}
                </p>
                <p className="mt-1 text-[10px] text-muted/70">{formatTimeAgo(n.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </MetalCard>
  );
}

