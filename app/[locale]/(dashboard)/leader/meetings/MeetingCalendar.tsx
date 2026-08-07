"use client";

import { useState, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import Modal from "@/components/ui/Modal";
import { useMeetings } from "@/hooks/meeting/useMeetings";
import { useMyApprovedAbsences } from "@/hooks/meeting/useMyApprovedAbsences";
import MeetingCalendarDay from "./MeetingCalendarDay";
import CreateMeetingModal from "./CreateMeetingModal";
import type { Meeting } from "@/types/meeting";

const DAY_NAMES = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getDaysInMonth(year: number, month: number): number { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year: number, month: number): number { const day = new Date(year, month, 1).getDay(); return day === 0 ? 6 : day - 1; }
function isSameDay(d1: Date, d2: Date): boolean { return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate(); }

export default function MeetingCalendar({ onMeetingClick, currentUserId }: { onMeetingClick: (id: string) => void; currentUserId?: string }) {
  const t = useTranslations("leader.meetings");
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [scheduleDate, setScheduleDate] = useState<Date | null>(null);
  const scheduleRef = useRef<HTMLButtonElement>(null);

  function handleScheduleClick(date: Date) { setScheduleDate(date); setTimeout(() => scheduleRef.current?.click(), 0); }
  const { data: excusedIds } = useMyApprovedAbsences();
  const year = currentMonth.getFullYear(); const month = currentMonth.getMonth();
  const startTimeFrom = new Date(year, month, 1).toISOString();
  const startTimeTo = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

  const { data, isPending, isError } = useMeetings({ startTimeFrom, startTimeTo, limit: 100, sortBy: "startTime", order: "asc" });
  const meetings = data?.data ?? [];

  const meetingsByDay = useMemo(() => {
    const map = new Map<string, Meeting[]>();
    for (const m of meetings) { const key = new Date(m.startTime).toDateString(); const list = map.get(key) || []; list.push(m); map.set(key, list); }
    return map;
  }, [meetings]);

  const daysInMonth = getDaysInMonth(year, month); const firstDay = getFirstDayOfMonth(year, month);
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  function prevMonth() { setCurrentMonth(new Date(year, month - 1, 1)); }
  function nextMonth() { setCurrentMonth(new Date(year, month + 1, 1)); }
  function isPast(d: Date) { const today = new Date(); today.setHours(0, 0, 0, 0); return d < today; }

  const legend = [
    { color: "bg-blue-500", label: t("hosted") },
    { color: "bg-amber-500", label: t("invited") },
    { color: "bg-emerald-500", label: t("online") },
    { color: "bg-violet-500", label: t("completed") },
    { color: "bg-red-500", label: t("cancelled") },
  ];

  return (
    <Modal>
      <MetalCard>
        <div className="p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button type="button" onClick={prevMonth} className="hover:cursor-pointer rounded-lg border border-white/10 p-1.5 text-slate-400 transition hover:border-white/30 hover:text-white"><ChevronLeft className="h-4 w-4" /></button>
              <h3 className="text-lg font-semibold metal-text">{MONTH_NAMES[month]} {year}</h3>
              <button type="button" onClick={nextMonth} className="hover:cursor-pointer rounded-lg border border-white/10 p-1.5 text-slate-400 transition hover:border-white/30 hover:text-white"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>

          {currentUserId && (
            <div className="mb-4 flex flex-wrap items-center gap-3">
              {legend.map((item) => (
                <div key={item.label} className="flex items-center gap-1.5"><span className={`h-2.5 w-2.5 rounded-full ${item.color}`} /><span className="text-[11px] text-slate-500">{item.label}</span></div>
              ))}
            </div>
          )}

          {isError ? (
            <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-6"><AlertTriangle className="h-5 w-5 shrink-0 text-red-400" /><p className="text-sm text-red-300">{t("calendarError")}</p></div>
          ) : isPending ? (
            <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>
          ) : (
            <>
              <div className="mb-2 grid grid-cols-7">{DAY_NAMES.map((name) => <div key={name} className="py-2 text-center text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">{name}</div>)}</div>
              <div className="grid grid-cols-7 gap-1">
                {cells.map((date, i) => {
                  const key = date ? date.toDateString() : ""; const dayMeetings = key ? meetingsByDay.get(key) || [] : [];
                  return <MeetingCalendarDay key={i} date={date} meetings={dayMeetings} isToday={date ? isSameDay(date, today) : false} isCurrentMonth={date ? date.getMonth() === month : false} isPast={date ? isPast(date) : false} currentUserId={currentUserId} excusedMeetingIds={excusedIds} onClickMeeting={(meetingId) => onMeetingClick(meetingId)} onScheduleClick={() => date && handleScheduleClick(date)} />;
                })}
              </div>
            </>
          )}
        </div>
      </MetalCard>

      <Modal.Open opens="schedule-meeting"><button ref={scheduleRef} className="hidden" /></Modal.Open>
      <Modal.Window name="schedule-meeting" size="sm"><CreateMeetingModal defaultDate={scheduleDate ?? undefined} onCloseModal={() => setScheduleDate(null)} /></Modal.Window>
    </Modal>
  );
}
