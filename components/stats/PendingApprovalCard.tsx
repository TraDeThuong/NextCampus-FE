"use client";

import { useContext } from "react";
import { Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { AuthContext } from "@/contexts/AuthContext";
import { useTaskAssignments } from "@/hooks/task-assignment/useTaskAssignments";
import StatsCard from "./StatsCard";

type Props = {
  onOpenModal: () => void;
};

export default function PendingApprovalCard({ onOpenModal }: Props) {
  const t = useTranslations("leader.dashboard");
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
    <StatsCard
      title={t("pendingApproval")}
      value={crossTeam.length}
      subtitle={t("pendingApprovalSubtitle")}
      icon={<Clock className="h-6 w-6 text-amber-400" />}
      onCardClick={onOpenModal}
      trend={{
        text: crossTeam.length > 0 ? t("needsYourApproval") : t("allApproved"),
        positive: crossTeam.length === 0,
      }}
    />
  );
}
