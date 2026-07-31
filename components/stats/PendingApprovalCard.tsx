"use client";

import { useContext } from "react";
import { Clock, ExternalLink } from "lucide-react";
import { AuthContext } from "@/contexts/AuthContext";
import { useTaskAssignments } from "@/hooks/task-assignment/useTaskAssignments";

type Props = {
  onOpenModal: () => void;
};

export default function PendingApprovalCard({ onOpenModal }: Props) {
  const auth = useContext(AuthContext);
  const currentUserId = auth?.state.user?.id;

  const { data } = useTaskAssignments({
    status: "PENDING_APPROVAL",
    leaderId: currentUserId,
    limit: 100,
  });

  const allPending = data?.data ?? [];
  const crossTeam = allPending.filter((a) => a.assignedBy !== currentUserId);

  return (
    <button
      type="button"
      onClick={onOpenModal}
      className="group text-left relative overflow-hidden rounded-[24px] border border-amber-500/30 bg-amber-500/10 p-5 hover:border-amber-500/60 hover:bg-amber-500/15 transition-all shadow-glass cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
            🟡 Needs approval
          </span>
          <h3 className="text-2xl font-black text-amber-300 mt-2">
            {crossTeam.length} Assignment Requests
          </h3>
          <p className="text-xs text-muted mt-1">
            Other leaders are requesting task assignments for your interns
          </p>
        </div>
        <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-300 group-hover:scale-110 transition-transform">
          <Clock className="h-6 w-6" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-amber-400 group-hover:underline">
        View details & approve <ExternalLink className="h-3.5 w-3.5" />
      </div>
    </button>
  );
}
