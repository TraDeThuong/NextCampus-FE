"use client";

import { useTranslations } from "next-intl";
import type { Meeting } from "@/types/meeting";

const HOSTED_COLORS: Record<string, string> = {
  SCHEDULED: "bg-sky-500/20 text-sky-300 border-l-sky-400 hover:bg-sky-500/30",
  ONGOING: "bg-emerald-500/20 text-emerald-300 border-l-emerald-400 hover:bg-emerald-500/30",
  COMPLETED: "bg-violet-500/20 text-violet-300 border-l-violet-400 hover:bg-violet-500/30",
  CANCELLED: "bg-rose-500/20 text-rose-300 border-l-rose-400 hover:bg-rose-500/30",
  DRAFT: "bg-slate-500/20 text-slate-300 border-l-slate-400 hover:bg-slate-500/30",
};

const INVITED_COLORS: Record<string, string> = {
  SCHEDULED: "bg-amber-500/15 text-amber-300 border-l-amber-400 hover:bg-amber-500/25",
  ONGOING: "bg-orange-500/15 text-orange-300 border-l-orange-400 hover:bg-orange-500/25",
  COMPLETED: "bg-teal-500/15 text-teal-300 border-l-teal-400 hover:bg-teal-500/25",
  CANCELLED: "bg-rose-500/20 text-rose-300 border-l-rose-400 hover:bg-rose-500/30",
  DRAFT: "bg-stone-500/15 text-stone-300 border-l-stone-400 hover:bg-stone-500/25",
};

interface Props {
  date: Date | null;
  meetings: Meeting[];
  isToday: boolean;
  isCurrentMonth: boolean;
  isPast: boolean;
  currentUserId?: string;
  excusedMeetingIds?: Set<string>;
  onClickMeeting: (meetingId: string) => void;
}

export default function MeetingCalendarDay({
  date,
  meetings,
  isToday,
  isCurrentMonth,
  currentUserId,
  excusedMeetingIds,
  onClickMeeting,
}: Props) {
  const t = useTranslations("intern.meetings");

  const STATUS_LABEL: Record<string, string> = {
    SCHEDULED: t("scheduled"),
    ONGOING: t("ongoing"),
    COMPLETED: t("completed"),
    CANCELLED: t("cancelled"),
    DRAFT: t("draft"),
  };

  if (!date) {
    return <div className="min-h-[85px] sm:min-h-[105px] rounded-xl bg-black/[0.02] dark:bg-white/[0.01]" />;
  }

  const day = date.getDate();
  const visibleMeetings = meetings.slice(0, 3);
  const overflow = meetings.length - 3;

  return (
    <div
      className={`group/day relative flex flex-col justify-between min-h-[85px] sm:min-h-[105px] rounded-xl border p-1.5 sm:p-2 transition ${
        isToday
          ? "border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_12px_rgba(6,182,212,0.15)] ring-1 ring-cyan-400/30"
          : "border-border/60 dark:border-white/5 bg-card/40 dark:bg-white/[0.02] hover:border-border-strong dark:hover:border-white/15"
      }`}
    >
      <div>
        <div className="mb-1 flex items-center justify-between text-xs">
          <span
            className={`flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full text-xs transition ${
              isToday
                ? "bg-cyan-500 font-bold text-slate-950 shadow-sm"
                : isCurrentMonth
                ? "font-medium text-foreground/90"
                : "text-muted/50"
            }`}
          >
            {day}
          </span>
        </div>

        <div className="space-y-1">
          {visibleMeetings.map((meeting) => {
            const isHosted = !currentUserId || meeting.createdBy === currentUserId;
            const isExcused = excusedMeetingIds?.has(meeting.id);
            const colors = isHosted ? HOSTED_COLORS : INVITED_COLORS;
            const baseColor = colors[meeting.status] || colors.DRAFT;

            return (
              <button
                key={meeting.id}
                type="button"
                onClick={() => onClickMeeting(meeting.id)}
                className={`
                  w-full truncate rounded border-l-2 px-1.5 py-0.5 text-left text-[10px] leading-tight transition select-none cursor-pointer
                  ${baseColor}
                  ${!isHosted ? "border-dashed opacity-90" : ""}
                  ${isExcused ? "opacity-40 line-through" : ""}
                `}
                title={`${meeting.title} (${STATUS_LABEL[meeting.status] || meeting.status})`}
              >
                {meeting.title}
              </button>
            );
          })}

          {overflow > 0 && (
            <p className="px-1 text-[10px] font-medium text-cyan-400/80">
              {t("moreCount", { n: overflow })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
