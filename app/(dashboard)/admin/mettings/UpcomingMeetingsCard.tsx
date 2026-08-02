"use client";

import { useState } from "react";
import { Calendar, Clock } from "lucide-react";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import { useMeetings } from "@/hooks/meeting/useMeetings";

const STATUS = {
  SCHEDULED: {
    dot: "bg-sky-400",
    badge: "bg-sky-500/10 text-sky-300",
  },
  ONGOING: {
    dot: "bg-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-300",
  },
} as const;

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function UpcomingMeetingsCard({
  onMeetingClick,
}: {
  onMeetingClick?: (id: string) => void;
}) {
  const [upcomingFrom] = useState(() => new Date().toISOString());

  const { data: ongoingData, isPending: isOngoingPending } = useMeetings({
    status: "ONGOING",
    sortBy: "startTime",
    order: "desc",
    limit: 10,
  });

  const { data: scheduledData, isPending: isScheduledPending } = useMeetings({
    status: "SCHEDULED",
    startTimeFrom: upcomingFrom,
    sortBy: "startTime",
    order: "asc",
    limit: 10,
  });

  const meetings = [
    ...(ongoingData?.data ?? []),
    ...(scheduledData?.data ?? []),
  ].slice(0, 10);
  const isPending = isOngoingPending || isScheduledPending;

  return (
    <MetalCard className="h-full">
      <div className="flex h-full flex-col p-4">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary-light" />
            <h3 className="text-sm font-semibold metal-text">
              Upcoming & Ongoing
            </h3>
          </div>

          <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-slate-400">
            {meetings.length}
          </span>
        </div>

        {isPending ? (
          <div className="flex flex-1 items-center justify-center">
            <Spinner size="md" />
          </div>
        ) : meetings.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <Calendar className="mb-2 h-7 w-7 text-slate-600" />
            <p className="text-sm text-slate-500">
              No upcoming meetings
            </p>
          </div>
        ) : (
          <div
            className="
              flex-1
              space-y-2
              overflow-y-auto
              pr-1
              scrollbar-thin
              scrollbar-thumb-white/10
              scrollbar-track-transparent
            "
          >
            {meetings.map((m) => {
              const status =
                STATUS[m.status as keyof typeof STATUS];

              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onMeetingClick?.(m.id)}
                  className="
                    group
                    w-full
                    rounded-xl
                    border
                    border-white/5
                    bg-white/[0.03]
                    px-3
                    py-2
                    transition-all
                    hover:border-primary/30
                    hover:bg-white/[0.06]
                  "
                >
                  <div className="flex items-center gap-3">
                    {/* Status */}
                    <span
                      className={`h-2 w-2 rounded-full shrink-0 ${status.dot}`}
                    />

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-medium text-slate-200">
                          {m.title}
                        </p>

                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${status.badge}`}
                        >
                          {m.status}
                        </span>
                      </div>

                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="shrink-0">
                          {formatTime(m.startTime)}
                        </span>

                        <span>•</span>

                        <span className="shrink-0">
                          {formatDate(m.startTime)}
                        </span>

                        <span>•</span>

                        <span className="truncate">
                          {m.host.fullName || m.host.email}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </MetalCard>
  );
}
