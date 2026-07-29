"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, Clock } from "lucide-react";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import { useMeetings } from "@/hooks/meeting/useMeetings";
import { useMeetingAbsences } from "@/hooks/meeting/useMeetingAbsences";
import { useReviewAbsence } from "@/hooks/meeting/useReviewAbsence";
import type { Meeting } from "@/types/meeting";

export default function LeaveRequestsCard() {
  const { data, isPending, isError } = useMeetings({
    limit: 100,
    sortBy: "startTime",
    order: "asc",
  });

  const meetings = data?.data ?? [];
  const meetingsWithAbsences = meetings.filter((m) => m._count.absences > 0);

  return (
    <MetalCard>
      <div className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <h3 className="text-base font-semibold metal-text">Leave Requests</h3>
          {meetingsWithAbsences.length > 0 && (
            <span className="ml-auto rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-300">
              {meetingsWithAbsences.length}
            </span>
          )}
        </div>

        {isPending ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="md" />
          </div>
        ) : isError ? (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <p className="text-xs text-red-300">Failed to load.</p>
          </div>
        ) : meetingsWithAbsences.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <Clock className="mb-2 h-7 w-7 text-slate-600" />
            <p className="text-sm text-slate-500">No leave requests</p>
          </div>
        ) : (
          <div className="space-y-2">
            {meetingsWithAbsences.map((meeting) => (
              <LeaveRequestItem key={meeting.id} meeting={meeting} />
            ))}
          </div>
        )}
      </div>
    </MetalCard>
  );
}

function LeaveRequestItem({ meeting }: { meeting: Meeting }) {
  const [expanded, setExpanded] = useState(false);
  const { data: absencesData } = useMeetingAbsences(expanded ? meeting.id : undefined);
  const reviewAbsence = useReviewAbsence();

  const absences = absencesData?.data ?? [];
  const pendingAbsences = absences.filter((a) => a.status === "PENDING");

  const statusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-500/20 text-amber-300";
      case "APPROVED":
        return "bg-emerald-500/20 text-emerald-300";
      case "REJECTED":
        return "bg-red-500/20 text-red-300";
      default:
        return "bg-slate-500/20 text-slate-300";
    }
  };

  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] transition">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className="h-2 w-2 shrink-0 rounded-full bg-red-400" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-200">
            {meeting.title}
          </p>
          <p className="text-xs text-slate-500">
            {meeting._count.absences} leave request{meeting._count.absences > 1 ? "s" : ""}
          </p>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-slate-500" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-white/5 px-4 pb-3 pt-2">
          {absences.length === 0 ? (
            <p className="py-2 text-center text-xs text-slate-600">Loading...</p>
          ) : (
            <div className="space-y-2">
              {absences.map((a) => (
                <div
                  key={a.id}
                  className="rounded-lg bg-white/[0.03] p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-200">
                          {a.participant.user.fullName || a.participant.user.email}
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusBadge(a.status)}`}
                        >
                          {a.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">{a.reason}</p>
                      {a.reviewNote && (
                        <p className="mt-0.5 text-xs italic text-slate-500">
                          Note: {a.reviewNote}
                        </p>
                      )}
                    </div>
                  </div>

                  {a.status === "PENDING" && (
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          reviewAbsence.mutate({
                            absenceId: a.id,
                            payload: { status: "APPROVED" },
                          })
                        }
                        disabled={reviewAbsence.isPending}
                        className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/30 disabled:opacity-50"
                      >
                        Approve
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
                        className="rounded-lg bg-red-500/20 px-2.5 py-1 text-xs font-medium text-red-300 transition hover:bg-red-500/30 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
