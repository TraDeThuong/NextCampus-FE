"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, AlertTriangle, Calendar } from "lucide-react";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import Modal from "@/components/ui/Modal";
import { useMeetings } from "@/hooks/meeting/useMeetings";
import MeetingCalendarDay from "./MeetingCalendarDay";
import CreateMeetingModal from "./CreateMeetingModal";
import type { Meeting } from "@/types/meeting";

const DAY_NAMES = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export default function MeetingCalendar({
  onMeetingClick,
}: {
  onMeetingClick: (id: string) => void;
}) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [scheduleDate, setScheduleDate] = useState<Date | null>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const startTimeFrom = new Date(year, month, 1).toISOString();
  const startTimeTo = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

  const { data, isPending, isError } = useMeetings({
    startTimeFrom,
    startTimeTo,
    limit: 100,
    sortBy: "startTime",
    order: "asc",
  });

  const meetings = data?.data ?? [];

  const meetingsByDay = useMemo(() => {
    const map = new Map<string, Meeting[]>();
    for (const m of meetings) {
      const key = new Date(m.startTime).toDateString();
      const list = map.get(key) || [];
      list.push(m);
      map.set(key, list);
    }
    return map;
  }, [meetings]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  function prevMonth() {
    setCurrentMonth(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentMonth(new Date(year, month + 1, 1));
  }

  function isPast(d: Date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
  }

  return (
    <Modal>
      <MetalCard>
        <div className="p-4 sm:p-6">
          {/* Navigation */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={prevMonth}
                className="hover:cursor-pointer rounded-lg border border-white/10 p-1.5 text-slate-400 transition hover:border-white/30 hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <h3 className="text-lg font-semibold metal-text">
                {MONTH_NAMES[month]} {year}
              </h3>
              <button
                type="button"
                onClick={nextMonth}
                className="hover:cursor-pointer rounded-lg border border-white/10 p-1.5 text-slate-400 transition hover:border-white/30 hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {isError ? (
            <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
              <p className="text-sm text-red-300">Failed to load meetings.</p>
            </div>
          ) : isPending ? (
            <div className="flex items-center justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              {/* Day headers */}
              <div className="mb-2 grid grid-cols-7">
                {DAY_NAMES.map((name) => (
                  <div
                    key={name}
                    className="py-2 text-center text-xs font-semibold uppercase tracking-[0.15em] text-slate-500"
                  >
                    {name}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {cells.map((date, i) => {
                  const key = date ? date.toDateString() : "";
                  const dayMeetings = key ? meetingsByDay.get(key) || [] : [];
                  return (
                    <MeetingCalendarDay
                      key={i}
                      date={date}
                      meetings={dayMeetings}
                      isToday={date ? isSameDay(date, today) : false}
                      isCurrentMonth={date ? date.getMonth() === month : false}
                      isPast={date ? isPast(date) : false}
                      onClickMeeting={(meetingId) => onMeetingClick(meetingId)}
                      onScheduleClick={() => date && setScheduleDate(date)}
                    />
                  );
                })}
              </div>
            </>
          )}
        </div>
      </MetalCard>

      {scheduleDate && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-[min(94vw,72rem)] max-h-[calc(100vh-3rem)] overflow-y-auto rounded-[2rem] border border-border bg-card shadow-glass backdrop-blur-2xl p-6 sm:p-8">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-light/40 to-transparent" />
            <button
              type="button"
              onClick={() => setScheduleDate(null)}
              className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-card text-muted backdrop-blur-xl transition-all duration-200 hover:border-primary-light/40 hover:bg-card-hover hover:cursor-pointer hover:text-foreground hover:shadow-[0_0_20px_rgba(21,174,245,0.15)]"
            >
              <span className="text-xl leading-none">&times;</span>
            </button>
            <CreateMeetingModal
              defaultDate={scheduleDate}
              onCloseModal={() => setScheduleDate(null)}
            />
          </div>
        </div>
      )}
    </Modal>
  );
}
