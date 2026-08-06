"use client";

import { useMemo } from "react";
import { Calendar } from "lucide-react";
import { useTranslations } from "next-intl";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import { useMeetings } from "@/hooks/meeting/useMeetings";
import { useAuth } from "@/hooks/auth/useAuth";
import type { Meeting } from "@/types/meeting";

const DAY_NAMES = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const STATUS_DOT: Record<string, string> = { SCHEDULED: "bg-sky-400", ONGOING: "bg-emerald-400", COMPLETED: "bg-violet-400", CANCELLED: "bg-red-400" };

function getWeekRange() {
  const now = new Date(); const day = now.getDay(); const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(now); mon.setDate(now.getDate() + diff); mon.setHours(0, 0, 0, 0);
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6); sun.setHours(23, 59, 59, 999);
  return { monday: mon, sunday: sun };
}
function formatTime(iso: string) { return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }); }

function getRsvpLabel(m: Meeting, userId: string) {
  const me = m.participants?.find(p => p.userId === userId); if (!me) return null;
  if (me.invitationStatus === "ACCEPTED") return "Accepted"; if (me.invitationStatus === "DECLINED") return "Declined"; return "Pending";
}

export default function WeekMeetingsCard({ onMeetingClick }: { onMeetingClick?: (id: string) => void }) {
  const t = useTranslations("intern.meetings");
  const { state } = useAuth(); const { monday, sunday } = useMemo(() => getWeekRange(), []);
  const { data, isPending } = useMeetings({ startTimeFrom: monday.toISOString(), startTimeTo: sunday.toISOString(), sortBy: "startTime", order: "asc", limit: 50 });
  const meetings = data?.data ?? [];

  const grouped = useMemo(() => {
    const map = new Map<number, Meeting[]>(); for (let i = 0; i < 7; i++) map.set(i, []);
    for (const m of meetings) { const d = new Date(m.startTime); map.get(d.getDay() === 0 ? 6 : d.getDay() - 1)!.push(m); } return map;
  }, [meetings]);

  const statusLabels: Record<string, string> = { Accepted: t("accepted"), Declined: t("declined"), Pending: t("pending") };
  const statusColors: Record<string, string> = { Accepted: "text-emerald-400", Declined: "text-red-400", Pending: "text-amber-400" };

  return (
    <MetalCard className="h-full"><div className="flex h-full flex-col p-5">
      <div className="mb-4 flex items-center justify-between"><h3 className="text-base font-semibold metal-text">{t("thisWeek")}</h3>{meetings.length > 0 && <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-slate-400">{meetings.length}</span>}</div>
      {isPending ? <div className="flex items-center justify-center py-12"><Spinner size="md" /></div>
      : meetings.length === 0 ? <div className="flex flex-col items-center py-12"><Calendar className="mb-3 h-8 w-8 text-slate-600" /><p className="text-sm text-slate-500">{t("noMeetingsThisWeek")}</p></div>
      : <div className="flex-1 space-y-4 overflow-y-auto pr-1 custom-scrollbar">
          {Array.from(grouped.entries()).map(([dayIndex, dayMeetings]) => {
            const date = new Date(monday); date.setDate(monday.getDate() + dayIndex);
            return (<div key={dayIndex}><div className="mb-2"><span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{DAY_NAMES[dayIndex]} {date.getDate()}</span></div>
              {dayMeetings.length === 0 ? <p className="pl-1 text-xs text-slate-600">{t("noMeetings")}</p>
              : <div className="space-y-1.5">{dayMeetings.map(m => {
                const myStatus = state.user?.id ? getRsvpLabel(m, state.user.id) : null;
                return (<button key={m.id} type="button" onClick={() => onMeetingClick?.(m.id)} className="group w-full rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-left transition-all hover:border-primary/30 hover:bg-white/[0.06]">
                  <div className="flex items-center gap-3"><span className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[m.status] || "bg-slate-400"}`} />
                    <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><p className="truncate text-sm font-medium text-slate-200">{m.title}</p>
                      {myStatus && <span className={`shrink-0 text-[10px] font-medium ${statusColors[myStatus] || "text-slate-400"}`}>{statusLabels[myStatus] || myStatus}</span>}</div>
                      <p className="mt-0.5 text-xs text-slate-500">{formatTime(m.startTime)} — {formatTime(m.endTime)}</p>
                    </div></div></button>);})}</div>}
            </div>);
          })}
        </div>}
    </div></MetalCard>
  );
}
