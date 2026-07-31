"use client";

import { Calendar, Clock } from "lucide-react";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import { useMeetings } from "@/hooks/meeting/useMeetings";

const STATUS_DOT: Record<string, string> = {
  SCHEDULED: "bg-blue-400",
  ONGOING: "bg-emerald-400",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default function UpcomingMeetingsCard({
  onMeetingClick,
}: {
  onMeetingClick?: (id: string) => void;
}) {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();

  const { data, isPending } = useMeetings({
    startTimeFrom: startOfDay,
    startTimeTo: endOfDay,
    sortBy: "startTime",
    order: "asc",
    limit: 10,
  });

  const meetings = (data?.data ?? []).filter(
    (m) => m.status === "SCHEDULED" || m.status === "ONGOING",
  );

  return (
    <MetalCard className="h-full">
      <div className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary-light" />
          <h3 className="text-base font-semibold metal-text">Upcoming & Ongoing</h3>
        </div>

        {isPending ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="md" />
          </div>
        ) : meetings.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <Calendar className="mb-2 h-7 w-7 text-slate-600" />
            <p className="text-sm text-slate-500">No upcoming meetings</p>
          </div>
        ) : (
          <div className="space-y-2">
            {meetings.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onMeetingClick?.(m.id)}
                className="w-full rounded-xl border border-white/5 bg-white/[0.03] p-3 text-left transition hover:bg-white/[0.06]"
              >
                <div className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_DOT[m.status] || "bg-slate-400"}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-200">{m.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatTime(m.startTime)} — {formatDate(m.startTime)}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-600">
                      Host: {m.host.fullName || m.host.email}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </MetalCard>
  );
}
