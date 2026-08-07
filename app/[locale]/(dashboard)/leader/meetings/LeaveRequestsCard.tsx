"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ChevronDown, ChevronUp, Clock, History } from "lucide-react";
import { useTranslations } from "next-intl";
import api from "@/lib/axios";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/auth/useAuth";
import { useReviewAbsence } from "@/hooks/meeting/useReviewAbsence";

interface AbsenceRequestItem {
  id: string; meetingId: string; participantId: string; reason: string; attachmentUrl: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED"; createdAt: string;
  participant: { id: string; userId: string; user: { id: string; email: string; fullName: string | null } };
  meeting: { id: string; title: string; createdBy: string; hostId: string };
}
interface AbsencesResponse { success: boolean; data: AbsenceRequestItem[]; }

export default function LeaveRequestsCard() {
  const t = useTranslations("leader.meetings");
  const { state } = useAuth(); const currentUser = state.user;

  const { data, isPending, isError } = useQuery({
    queryKey: ["absences", "all"], queryFn: async () => { const res = await api.get<AbsencesResponse>("/meetings/absences/pending"); return res.data; }, staleTime: 1000 * 60 * 2,
  });

  const allAbsences = (data?.data ?? []).filter((a) => a.meeting.createdBy === currentUser?.id || a.meeting.hostId === currentUser?.id);
  const pendingAbsences = allAbsences.filter((a) => a.status === "PENDING");
  const reviewedAbsences = allAbsences.filter((a) => a.status !== "PENDING");
  const [showHistory, setShowHistory] = useState(false);

  const pendingByMeeting = new Map<string, AbsenceRequestItem[]>();
  for (const a of pendingAbsences) { const list = pendingByMeeting.get(a.meetingId) || []; list.push(a); pendingByMeeting.set(a.meetingId, list); }

  return (
    <MetalCard>
      <div className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <h3 className="text-base font-semibold metal-text">{t("leaveRequests")}</h3>
          {pendingByMeeting.size > 0 && <span className="ml-auto rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-300">{pendingByMeeting.size}</span>}
        </div>

        {isPending ? <div className="flex items-center justify-center py-12"><Spinner size="md" /></div> :
         isError ? <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-4"><AlertTriangle className="h-4 w-4 text-red-400" /><p className="text-xs text-red-300">{t("loadError")}</p></div> :
         pendingByMeeting.size === 0 ? <div className="flex flex-col items-center py-10 text-center"><Clock className="mb-2 h-7 w-7 text-slate-600" /><p className="text-sm text-slate-500">{t("noPendingRequests")}</p></div> :
         <div className="space-y-2">{Array.from(pendingByMeeting.entries()).map(([meetingId, items]) => <PendingItem key={meetingId} meetingTitle={items[0].meeting.title} items={items} />)}</div>}

        {reviewedAbsences.length > 0 && (
          <div className="mt-4 border-t border-white/5 pt-4">
            <button type="button" onClick={() => setShowHistory(!showHistory)} className="flex w-full items-center gap-2 text-xs text-slate-500 transition hover:text-slate-400">
              <History className="h-3.5 w-3.5" />{t("history", { n: reviewedAbsences.length })}
              {showHistory ? <ChevronUp className="ml-auto h-3.5 w-3.5" /> : <ChevronDown className="ml-auto h-3.5 w-3.5" />}
            </button>
            {showHistory && (
              <div className="mt-2 space-y-1.5">
                {reviewedAbsences.map((a) => (
                  <div key={a.id} className="flex items-center gap-2 rounded-lg bg-white/[0.02] px-3 py-2">
                    <span className="truncate text-xs text-slate-400">{a.participant.user.fullName || a.participant.user.email}</span>
                    <span className="truncate text-xs text-slate-600">{a.meeting.title}</span>
                    <span className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${a.status === "APPROVED" ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>{a.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </MetalCard>
  );
}

function PendingItem({ meetingTitle, items }: { meetingTitle: string; items: AbsenceRequestItem[] }) {
  const t = useTranslations("leader.meetings");
  const [expanded, setExpanded] = useState(false);
  const reviewAbsence = useReviewAbsence();

  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] transition">
      <button type="button" onClick={() => setExpanded(!expanded)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
        <span className="h-2 w-2 shrink-0 rounded-full bg-red-400" />
        <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-200">{meetingTitle}</p><p className="text-xs text-slate-500">{t("pending", { n: items.length })}</p></div>
        {expanded ? <ChevronUp className="h-4 w-4 shrink-0 text-slate-500" /> : <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />}
      </button>
      {expanded && (
        <div className="border-t border-white/5 px-4 pb-3 pt-2">
          <div className="space-y-2">
            {items.map((a) => (
              <div key={a.id} className="rounded-lg bg-white/[0.03] p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-200">{a.participant.user.fullName || a.participant.user.email}</span>
                      <span className="shrink-0 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-300">PENDING</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{a.reason}</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <button type="button" onClick={() => reviewAbsence.mutate({ absenceId: a.id, payload: { status: "APPROVED" } })} disabled={reviewAbsence.isPending} className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/30 disabled:opacity-50">{t("approve")}</button>
                  <button type="button" onClick={() => reviewAbsence.mutate({ absenceId: a.id, payload: { status: "REJECTED" } })} disabled={reviewAbsence.isPending} className="rounded-lg bg-red-500/20 px-2.5 py-1 text-xs font-medium text-red-300 transition hover:bg-red-500/30 disabled:opacity-50">{t("reject")}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
