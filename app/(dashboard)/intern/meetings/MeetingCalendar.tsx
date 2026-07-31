"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import Modal from "@/components/ui/Modal";
import { useMeetings } from "@/hooks/meeting/useMeetings";
import MeetingCalendarDay from "./MeetingCalendarDay";
import type { Meeting } from "@/types/meeting";

const DAY_NAMES = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getDaysInMonth(year: number, month: number): number { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year: number, month: number): number { const d = new Date(year, month, 1).getDay(); return d === 0 ? 6 : d - 1; }
function isSameDay(d1: Date, d2: Date): boolean { return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate(); }

export default function MeetingCalendar({ onMeetingClick }: { onMeetingClick: (id: string) => void }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
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

  const firstDay = getFirstDayOfMonth(year, month);
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= getDaysInMonth(year, month); d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  function isPast(d: Date) { const t = new Date(); t.setHours(0, 0, 0, 0); return d < t; }

  return (
    <Modal>
      <MetalCard>
        <div className="p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} className="rounded-lg border border-white/10 p-1.5 text-slate-400 transition hover:border-white/30 hover:text-white"><ChevronLeft className="h-4 w-4" /></button>
              <h3 className="text-lg font-semibold metal-text">{MONTH_NAMES[month]} {year}</h3>
              <button type="button" onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} className="rounded-lg border border-white/10 p-1.5 text-slate-400 transition hover:border-white/30 hover:text-white"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
          {isError ? <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-6"><AlertTriangle className="h-5 w-5 text-red-400" /><p className="text-sm text-red-300">Failed to load meetings.</p></div>
          : isPending ? <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>
          : <>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                {[{ color: "bg-amber-500", label: "Invited" }, { color: "bg-emerald-500", label: "Ongoing" }, { color: "bg-violet-500", label: "Completed" }, { color: "bg-red-500", label: "Cancelled" }].map(item => (
                  <div key={item.label} className="flex items-center gap-1.5"><span className={`h-2.5 w-2.5 rounded-full ${item.color}`} /><span className="text-[11px] text-slate-500">{item.label}</span></div>
                ))}
              </div>
              <div className="mb-2 grid grid-cols-7">{DAY_NAMES.map(n => <div key={n} className="py-2 text-center text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">{n}</div>)}</div>
              <div className="grid grid-cols-7 gap-1">{cells.map((date, i) => {
                const key = date ? date.toDateString() : ""; const dayMeetings = key ? meetingsByDay.get(key) || [] : [];
                return <MeetingCalendarDay key={i} date={date} meetings={dayMeetings} isToday={date ? isSameDay(date, today) : false} isCurrentMonth={date ? date.getMonth() === month : false} isPast={date ? isPast(date) : false} onClickMeeting={(meetingId) => onMeetingClick(meetingId)} />;
              })}</div>
            </>}
        </div>
      </MetalCard>
    </Modal>
  );
}
