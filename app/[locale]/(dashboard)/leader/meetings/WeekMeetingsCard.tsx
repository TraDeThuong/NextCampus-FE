"use client";

import { useMemo } from "react";
import { Calendar, MapPin, Video, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/auth/useAuth";
import { useMeetings } from "@/hooks/meeting/useMeetings";
import { internService } from "@/services/intern.service";
import type { Meeting } from "@/types/meeting";

const DAY_NAMES = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const STATUS_DOT: Record<string, string> = { SCHEDULED: "bg-blue-400", ONGOING: "bg-emerald-400", COMPLETED: "bg-violet-400", CANCELLED: "bg-red-400", DRAFT: "bg-slate-400" };

function getWeekRange() {
  const now = new Date(); const day = now.getDay(); const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now); monday.setDate(now.getDate() + diffToMonday); monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6); sunday.setHours(23, 59, 59, 999);
  return { monday, sunday };
}
function formatTime(iso: string) { return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }); }

export default function WeekMeetingsCard({ onMeetingClick }: { onMeetingClick?: (id: string) => void }) {
  const t = useTranslations("leader.meetings");
  const { state } = useAuth(); const currentUser = state.user;
  const { monday, sunday } = useMemo(() => getWeekRange(), []);

  const { data: meetingsData, isPending } = useMeetings({ startTimeFrom: monday.toISOString(), startTimeTo: sunday.toISOString(), sortBy: "startTime", order: "asc", limit: 50 });
  const { data: internsData } = useQuery({ queryKey: ["interns", { leaderId: currentUser?.id }], queryFn: () => internService.getInterns({ leaderId: currentUser!.id, limit: 100 }), enabled: !!currentUser, staleTime: 1000 * 60 * 5 });

  const meetings = meetingsData?.data ?? [];
  const internUserIds = useMemo(() => new Set((internsData?.data ?? []).map((i) => i.userId)), [internsData]);

  const grouped = useMemo(() => {
    const map = new Map<number, Meeting[]>(); for (let i = 0; i < 7; i++) map.set(i, []);
    for (const m of meetings) { const d = new Date(m.startTime); const dayIndex = d.getDay() === 0 ? 6 : d.getDay() - 1; map.get(dayIndex)!.push(m); }
    return map;
  }, [meetings]);

  function getParticipantLabel(m: Meeting) {
    let interns = 0, leaders = 0;
    for (const p of m.participants) { if (p.participantRole !== "PARTICIPANT") continue; if (internUserIds.has(p.userId)) interns++; else leaders++; }
    const parts: string[] = [];
    if (interns > 0) parts.push(t("interns", { n: interns, plural: interns !== 1 ? "s" : "" }));
    if (leaders > 0) parts.push(t("leaders", { n: leaders, plural: leaders !== 1 ? "s" : "" }));
    return parts.length > 0 ? parts.join(", ") : t("noParticipants");
  }

  function getRsvpSummary(m: Meeting) {
    const accepted = m.participants.filter((p) => p.participantRole === "PARTICIPANT" && p.invitationStatus === "ACCEPTED").length;
    const pending = m.participants.filter((p) => p.participantRole === "PARTICIPANT" && p.invitationStatus === "PENDING").length;
    const declined = m.participants.filter((p) => p.participantRole === "PARTICIPANT" && p.invitationStatus === "DECLINED").length;
    if (accepted === 0 && pending === 0 && declined === 0) return null;
    const parts: string[] = [];
    if (accepted > 0) parts.push(t("accepted", { n: accepted }));
    if (pending > 0) parts.push(t("pending", { n: pending }));
    if (declined > 0) parts.push(t("declined", { n: declined }));
    return parts.join(" · ");
  }

  return (
    <MetalCard>
      <div className="p-5">
        <div className="mb-4 flex items-center justify-between"><h3 className="text-base font-semibold metal-text">{t("thisWeek")}</h3></div>
        {isPending ? <div className="flex items-center justify-center py-12"><Spinner size="md" /></div> :
         meetings.length === 0 ? <div className="flex flex-col items-center py-12 text-center"><Calendar className="mb-3 h-8 w-8 text-slate-600" /><p className="text-sm text-slate-500">{t("noMeetingsThisWeek")}</p></div> :
         <div className="space-y-4">
           {Array.from(grouped.entries()).map(([dayIndex, dayMeetings]) => {
             const date = new Date(monday); date.setDate(monday.getDate() + dayIndex);
             return (
               <div key={dayIndex}>
                 <div className="mb-2 flex items-center gap-2"><span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{DAY_NAMES[dayIndex]} {date.getDate()}</span></div>
                 {dayMeetings.length === 0 ? <p className="pl-1 text-xs text-slate-600">{t("noMeetings")}</p> :
                  <div className="space-y-1.5">
                    {dayMeetings.map((m) => {
                      const rsvp = getRsvpSummary(m);
                      return (
                        <button key={m.id} type="button" onClick={() => onMeetingClick?.(m.id)} className="w-full rounded-xl border border-white/5 bg-white/[0.03] p-3 text-left transition hover:bg-white/[0.06]">
                          <div className="flex items-start gap-2">
                            <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[m.status] || "bg-slate-400"}`} />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="truncate text-sm font-medium text-slate-200">{m.title}</p>
                                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${m.createdBy === currentUser?.id ? "bg-primary-main/20 text-primary-light" : "bg-amber-500/20 text-amber-300"}`}>{m.createdBy === currentUser?.id ? t("hosted") : t("invited")}</span>
                              </div>
                              <p className="mt-0.5 text-xs text-slate-500">{formatTime(m.startTime)} — {formatTime(m.endTime)}</p>
                              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                {m.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{m.location}</span>}
                                {m.meetingType === "ONLINE" && m.meetingLink && <span className="flex items-center gap-1"><Video className="h-3 w-3" />{t("online")}</span>}
                                <span className="flex items-center gap-1"><Users className="h-3 w-3" />{getParticipantLabel(m)}</span>
                              </div>
                              {rsvp && <p className="mt-1 text-xs text-slate-600">{rsvp}</p>}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>}
               </div>
             );
           })}
         </div>}
      </div>
    </MetalCard>
  );
}
