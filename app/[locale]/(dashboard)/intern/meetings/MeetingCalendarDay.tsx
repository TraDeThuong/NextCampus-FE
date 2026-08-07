"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Meeting } from "@/types/meeting";

const HOSTED_COLORS: Record<string, string> = { SCHEDULED: "bg-blue-500/20 text-blue-300 border-l-blue-500", ONGOING: "bg-emerald-500/20 text-emerald-300 border-l-emerald-500", COMPLETED: "bg-violet-500/20 text-violet-300 border-l-violet-500", CANCELLED: "bg-red-500/20 text-red-300 border-l-red-500", DRAFT: "bg-slate-500/20 text-slate-300 border-l-slate-500" };
const INVITED_COLORS: Record<string, string> = { SCHEDULED: "bg-amber-500/15 text-amber-300 border-l-amber-500", ONGOING: "bg-orange-500/15 text-orange-300 border-l-orange-500", COMPLETED: "bg-yellow-500/10 text-yellow-300 border-l-yellow-500", CANCELLED: "bg-red-500/20 text-red-300 border-l-red-500", DRAFT: "bg-stone-500/15 text-stone-300 border-l-stone-500" };

interface Props { date: Date | null; meetings: Meeting[]; isToday: boolean; isCurrentMonth: boolean; isPast: boolean; currentUserId?: string; onClickMeeting: (meetingId: string) => void; onScheduleClick?: () => void; }

export default function MeetingCalendarDay({ date, meetings, isToday, isCurrentMonth, isPast, currentUserId, onClickMeeting, onScheduleClick }: Props) {
  const t = useTranslations("intern.meetings");
  if (!date) return <div className="min-h-[100px] rounded-xl bg-white/[0.02]" />;
  const day = date.getDate(); const visibleMeetings = meetings.slice(0, 3); const overflow = meetings.length - 3;

  return (
    <div className={`relative min-h-[100px] rounded-xl border p-1.5 transition ${isToday ? "border-primary-main/40 bg-primary-main/5 shadow-[0_0_12px_rgba(59,130,246,0.15)]" : "border-white/5 bg-white/[0.02] hover:border-white/10"}`}>
      <div className={`mb-1 flex items-center justify-between text-xs font-medium ${isCurrentMonth ? "text-slate-300" : "text-slate-600"}`}>
        <span>{day}</span>
        {!isPast && onScheduleClick && <button type="button" onClick={(e) => { e.stopPropagation(); onScheduleClick(); }} className="flex h-5 w-5 items-center justify-center rounded-md text-slate-600 transition hover:bg-primary-main/10 hover:text-primary-light" title={t("scheduleHint")}><Plus className="h-3.5 w-3.5" /></button>}
      </div>
      <div className="space-y-0.5">
        {visibleMeetings.map((meeting) => { const isHosted = !currentUserId || meeting.createdBy === currentUserId; const colors = isHosted ? HOSTED_COLORS : INVITED_COLORS; const baseColor = colors[meeting.status] || colors.DRAFT; return <button key={meeting.id} type="button" onClick={() => onClickMeeting(meeting.id)} className={`w-full truncate rounded border-l-2 px-1.5 py-0.5 text-left text-[10px] leading-tight transition hover:brightness-125 ${baseColor} ${!isHosted ? "border-dashed opacity-75" : ""}`}>{meeting.title}</button>; })}
        {overflow > 0 && <p className="px-1 text-[10px] text-slate-500">{t("moreCount", { n: overflow })}</p>}
      </div>
    </div>
  );
}
