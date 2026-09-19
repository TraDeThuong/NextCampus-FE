"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { AlertTriangle, ChevronDown, ChevronUp, Clock, History, Check, X } from "lucide-react";
import api from "@/lib/axios";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import { useReviewAbsence } from "@/hooks/meeting/useReviewAbsence";

interface AbsenceRequestItem {
  id: string;
  meetingId: string;
  participantId: string;
  reason: string;
  attachmentUrl: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  participant: {
    id: string;
    userId: string;
    user: { id: string; email: string; fullName: string | null };
  };
  meeting: { id: string; title: string; createdBy: string; hostId: string };
}

interface PendingAbsencesResponse {
  success: boolean;
  data: AbsenceRequestItem[];
}

export default function LeaveRequestsCard() {
  const t = useTranslations();
  const { data, isPending, isError } = useQuery({
    queryKey: ["absences", "pending"],
    queryFn: async () => {
      const res = await api.get<PendingAbsencesResponse>("/meetings/absences/pending");
      return res.data;
    },
    staleTime: 1000 * 60 * 2,
  });

  const allAbsences = data?.data ?? [];
  const pendingAbsences = allAbsences.filter((a) => a.status === "PENDING");
  const reviewedAbsences = allAbsences.filter((a) => a.status !== "PENDING");
  const [showHistory, setShowHistory] = useState(false);

  // Group pending by meeting
  const pendingByMeeting = new Map<string, AbsenceRequestItem[]>();
  for (const a of pendingAbsences) {
    const list = pendingByMeeting.get(a.meetingId) || [];
    list.push(a);
    pendingByMeeting.set(a.meetingId, list);
  }

  return (
    <MetalCard>
      <div className="p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
            <h3 className="text-base font-semibold metal-text">
              {t("admin.meetings.leaveRequests")}
            </h3>
          </div>
          {pendingByMeeting.size > 0 && (
            <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-xs font-semibold text-amber-300">
              {pendingByMeeting.size}
            </span>
          )}
        </div>

        {isPending ? (
          <div className="flex items-center justify-center py-10">
            <Spinner size="md" />
          </div>
        ) : isError ? (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
            <p className="text-xs text-red-300">{t("admin.meetings.failedToLoad")}</p>
          </div>
        ) : pendingByMeeting.size === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <Clock className="mb-2 h-7 w-7 text-muted/40" />
            <p className="text-sm text-muted">{t("admin.meetings.noPendingRequests")}</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {Array.from(pendingByMeeting.entries()).map(([meetingId, items]) => (
              <PendingMeetingItem
                key={meetingId}
                meetingTitle={items[0].meeting.title}
                count={items.length}
                items={items}
              />
            ))}
          </div>
        )}

        {/* History */}
        {reviewedAbsences.length > 0 && (
          <div className="mt-4 border-t border-border/60 dark:border-white/5 pt-3">
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="flex w-full items-center gap-2 text-xs text-muted transition hover:text-foreground active:scale-[0.99]"
            >
              <History className="h-3.5 w-3.5 shrink-0" />
              <span>{t("admin.meetings.history", { n: reviewedAbsences.length })}</span>
              {showHistory ? (
                <ChevronUp className="ml-auto h-3.5 w-3.5 shrink-0 text-muted" />
              ) : (
                <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0 text-muted" />
              )}
            </button>
            {showHistory && (
              <div className="mt-2 space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                {reviewedAbsences.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-2 rounded-lg bg-card/60 dark:bg-white/[0.02] border border-border/40 dark:border-white/5 px-3 py-2 text-xs"
                  >
                    <span className="truncate font-medium text-foreground">
                      {a.participant.user.fullName || a.participant.user.email}
                    </span>
                    <span className="truncate text-muted">
                      {a.meeting.title}
                    </span>
                    <span
                      className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        a.status === "APPROVED"
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                          : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                      }`}
                    >
                      {a.status}
                    </span>
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

function PendingMeetingItem({
  meetingTitle,
  count,
  items,
}: {
  meetingTitle: string;
  count: number;
  items: AbsenceRequestItem[];
}) {
  const t = useTranslations();
  const [expanded, setExpanded] = useState(false);
  const reviewAbsence = useReviewAbsence();

  return (
    <div className="rounded-xl border border-border/60 dark:border-white/5 bg-card/40 dark:bg-white/[0.02] transition shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left"
      >
        <span className="h-2 w-2 shrink-0 rounded-full bg-rose-400" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {meetingTitle}
          </p>
          <p className="text-xs text-muted">
            {count > 1
              ? t("admin.meetings.pendingRequests", { n: count })
              : t("admin.meetings.pendingRequest", { n: count })}
          </p>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-muted" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
        )}
      </button>
      {expanded && (
        <div className="border-t border-border/60 dark:border-white/5 px-3.5 pb-3 pt-2">
          <div className="space-y-2">
            {items.map((a) => (
              <div
                key={a.id}
                className="rounded-lg bg-card/60 dark:bg-white/[0.03] border border-border/40 dark:border-white/5 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {a.participant.user.fullName || a.participant.user.email}
                      </span>
                      <span className="shrink-0 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                        PENDING
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted leading-relaxed">{a.reason}</p>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      reviewAbsence.mutate({
                        absenceId: a.id,
                        payload: { status: "APPROVED" },
                      })
                    }
                    disabled={reviewAbsence.isPending}
                    className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/25 active:scale-95 disabled:opacity-50"
                  >
                    <Check className="h-3 w-3 shrink-0" />
                    <span>{t("admin.meetings.approve")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      reviewAbsence.mutate({
                        absenceId: a.id,
                        payload: { status: "REJECTED" },
                      })
                    }
                    disabled={reviewAbsence.isPending}
                    className="flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/15 px-3 py-1 text-xs font-medium text-rose-300 transition hover:bg-rose-500/25 active:scale-95 disabled:opacity-50"
                  >
                    <X className="h-3 w-3 shrink-0" />
                    <span>{t("admin.meetings.reject")}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
