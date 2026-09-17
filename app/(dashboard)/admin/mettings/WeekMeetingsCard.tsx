"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Calendar, MapPin, Video, Users } from "lucide-react";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import { useMeetings } from "@/hooks/meeting/useMeetings";
import type { Meeting } from "@/types/meeting";

const STATUS: Record<string, { dot: string; badge: string }> = {
  SCHEDULED: { dot: "bg-sky-400", badge: "bg-sky-500/10 text-sky-300" },
  ONGOING: { dot: "bg-emerald-400", badge: "bg-emerald-500/10 text-emerald-300" },
  COMPLETED: { dot: "bg-violet-400", badge: "bg-violet-500/10 text-violet-300" },
  CANCELLED: { dot: "bg-red-400", badge: "bg-red-500/10 text-red-300" },
  DRAFT: { dot: "bg-slate-400", badge: "bg-slate-500/10 text-slate-300" },
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
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function getParticipantLabel(m: Meeting, t: ReturnType<typeof useTranslations>) {
  if (m.visibility === "TEAM") return t("admin.meetings.allMembers");
  const count = m.participants?.filter((p) => p.participantRole === "PARTICIPANT").length || m._count.participants;
  return `${count} leader${count !== 1 ? "s" : ""}`;
}

export default function WeekMeetingsCard({ onMeetingClick }: { onMeetingClick?: (id: string) => void }) {
  const t = useTranslations();
  const DAY_NAMES = [
    t("admin.meetings.dayMon"),
    t("admin.meetings.dayTue"),
    t("admin.meetings.dayWed"),
    t("admin.meetings.dayThu"),
    t("admin.meetings.dayFri"),
    t("admin.meetings.daySat"),
    t("admin.meetings.daySun"),
  ];
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
    for (let i = 0; i < 7; i++) map.set(i, []);
    for (const m of meetings) {
      const d = new Date(m.startTime);
      const dayIndex = d.getDay() === 0 ? 6 : d.getDay() - 1;
      map.get(dayIndex)!.push(m);
    }
    return map;
  }, [meetings]);

  return (
    <MetalCard>
      <div className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold metal-text">{t("admin.meetings.thisWeek")}</h3>
          {meetings.length > 0 && (
            <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-slate-400">
              {meetings.length}
            </span>
          )}
        </div>

        {isPending ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="md" />
          </div>
        ) : meetings.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <Calendar className="mb-3 h-8 w-8 text-slate-600" />
            <p className="text-sm text-slate-500">{t("admin.meetings.noMeetingsWeek")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Array.from(grouped.entries()).map(([dayIndex, dayMeetings]) => {
              const date = new Date(monday);
              date.setDate(monday.getDate() + dayIndex);

              return (
                <div key={dayIndex}>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {DAY_NAMES[dayIndex]} {date.getDate()}
                    </span>
                  </div>

                  {dayMeetings.length === 0 ? (
                    <p className="pl-1 text-xs text-slate-600">{t("admin.meetings.noMeetings")}</p>
                  ) : (
                    <div className="space-y-1.5">
                      {dayMeetings.map((m) => {
                        const st = STATUS[m.status] || STATUS.DRAFT;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => onMeetingClick?.(m.id)}
                            className="group w-full rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-left transition-all hover:border-primary/30 hover:bg-white/[0.06]"
                          >
                            <div className="flex items-center gap-3">
                              <span className={`h-2 w-2 shrink-0 rounded-full ${st.dot}`} />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-3">
                                  <p className="truncate text-sm font-medium text-slate-200">
                                    {m.title}
                                  </p>
                                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${st.badge}`}>
                                    {m.status}
                                  </span>
                                </div>
                                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500">
                                  <span>{formatTime(m.startTime)} — {formatTime(m.endTime)}</span>
                                  <span>•</span>
                                  <span>{getParticipantLabel(m, t)}</span>
                                </div>
                                {(m.location || m.host) && (
                                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-600">
                                    {m.location && (
                                      <span className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />{m.location}
                                      </span>
                                    )}
                                    {m.location && m.host && <span>•</span>}
                                    {m.host && <span className="truncate">{t("admin.meetings.host")} {m.host.fullName || m.host.email}</span>}
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
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
