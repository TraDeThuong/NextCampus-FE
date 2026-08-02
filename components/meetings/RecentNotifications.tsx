"use client";

import { Bell, Clock } from "lucide-react";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import { useNotifications } from "@/hooks/notification/useNotifications";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

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
  const { data, isPending } = useNotifications({ limit: 5, order: "desc", sortBy: "createdAt" });

  const notifications = (data?.data ?? []).filter((n) => n.type in MEETING_TYPES);

  return (
    <MetalCard className="h-full">
      <div className="flex h-full flex-col p-5">
        <div className="mb-4 flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary-light" />
          <h3 className="text-sm font-semibold metal-text">Recent</h3>
          {notifications.length > 0 && (
            <span className="ml-auto rounded-full bg-primary-main/20 px-2 py-0.5 text-xs text-primary-light">{notifications.length}</span>
          )}
        </div>

        {isPending ? (
          <div className="flex flex-1 items-center justify-center"><Spinner size="md" /></div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <Clock className="mb-2 h-7 w-7 text-slate-600" />
            <p className="text-sm text-slate-500">No notifications</p>
          </div>
        ) : (
          <div className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
            {notifications.map((n) => (
              <div key={n.id} className={`rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 border-l-2 ${getBorderColor(n.type)}`}>
                <p className="text-xs font-medium text-slate-200 line-clamp-1">{n.title}</p>
                <p className="mt-0.5 text-[11px] text-slate-400 line-clamp-2">{formatNotificationContent(n.type, n.content)}</p>
                <p className="mt-1 text-[10px] text-slate-600">{timeAgo(n.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </MetalCard>
  );
}
