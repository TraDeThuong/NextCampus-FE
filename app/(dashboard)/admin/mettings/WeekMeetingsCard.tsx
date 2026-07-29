"use client";

import { useMemo } from "react";
import { Calendar, MapPin, Video, Users } from "lucide-react";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import { useMeetings } from "@/hooks/meeting/useMeetings";
import type { Meeting } from "@/types/meeting";

const DAY_NAMES = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const STATUS_DOT: Record<string, string> = {
  SCHEDULED: "bg-blue-400",
  ONGOING: "bg-emerald-400",
  COMPLETED: "bg-violet-400",
  CANCELLED: "bg-red-400",
  DRAFT: "bg-slate-400",
};

function getWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { monday, sunday };
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getParticipantLabel(m: Meeting) {
  if (m.visibility === "TEAM") return "All leaders";
  const count =
    m.participants?.filter((p) => p.participantRole === "PARTICIPANT").length ||
    m._count.participants;
  return `${count} leader${count !== 1 ? "s" : ""}`;
}

export default function WeekMeetingsCard({
  onMeetingClick,
}: {
  onMeetingClick?: (id: string) => void;
}) {
  const { monday, sunday } = useMemo(() => getWeekRange(), []);

  const { data, isPending } = useMeetings({
    startTimeFrom: monday.toISOString(),
    startTimeTo: sunday.toISOString(),
    sortBy: "startTime",
    order: "asc",
    limit: 50,
  });

  const meetings = data?.data ?? [];

  const grouped = useMemo(() => {
    const map = new Map<number, Meeting[]>();
    for (let i = 0; i < 7; i++) {
      map.set(i, []);
    }
    for (const m of meetings) {
      const d = new Date(m.startTime);
      const dayIndex = d.getDay() === 0 ? 6 : d.getDay() - 1;
      const list = map.get(dayIndex) || [];
      list.push(m);
      map.set(dayIndex, list);
    }
    return map;
  }, [meetings]);

  const hasMeetings = meetings.length > 0;

  return (
    <MetalCard>
      <div className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold metal-text">This Week</h3>
        </div>

        {isPending ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="md" />
          </div>
        ) : !hasMeetings ? (
          <div className="flex flex-col items-center py-12 text-center">
            <Calendar className="mb-3 h-8 w-8 text-slate-600" />
            <p className="text-sm text-slate-500">No meetings this week</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Array.from(grouped.entries()).map(([dayIndex, dayMeetings]) => {
              const date = new Date(monday);
              date.setDate(monday.getDate() + dayIndex);
              const dayName = DAY_NAMES[dayIndex];
              const dayNum = date.getDate();

              return (
                <div key={dayIndex}>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {dayName} {dayNum}
                    </span>
                  </div>

                  {dayMeetings.length === 0 ? (
                    <p className="pl-1 text-xs text-slate-600">No meetings</p>
                  ) : (
                    <div className="space-y-1.5">
                      {dayMeetings.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => onMeetingClick?.(m.id)}
                          className="w-full rounded-xl border border-white/5 bg-white/[0.03] p-3 text-left transition hover:cursor-pointer hover:bg-white/[0.06]"
                        >
                          <div className="flex items-start gap-2">
                            <span
                              className={`mt-1 h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[m.status] || "bg-slate-400"}`}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-slate-200">
                                {m.title}
                              </p>
                              <p className="mt-0.5 text-xs text-slate-500">
                                {formatTime(m.startTime)} — {formatTime(m.endTime)}
                              </p>
                              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                {m.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {m.location}
                                  </span>
                                )}
                                {m.meetingType === "ONLINE" && m.meetingLink && (
                                  <span className="flex items-center gap-1">
                                    <Video className="h-3 w-3" />
                                    Online
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {getParticipantLabel(m)}
                                </span>
                              </div>
                            </div>
                          </div>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MetalCard>
  );
}
