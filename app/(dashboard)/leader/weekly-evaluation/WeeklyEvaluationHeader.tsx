"use client";

import { useMemo } from "react";
import { Plus, Sparkles, Clock, CalendarCheck } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import MetalCard from "@/components/ui/MetalCard";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import WeeklyEvaluationCreateModal from "./WeeklyEvaluationCreateModal";
import { useRBAC } from "@/hooks/rbac/useRBAC";
import { useSystemSettings } from "@/hooks/system-setting/useSystemSettings";
import {
  getWeeklyEvaluationStartDayName,
  isWeeklyEvaluationWindowOpen,
} from "@/types/weekly-evaluation";

interface WeeklyEvaluationHeaderProps {
  onSuccess?: () => void;
}

export default function WeeklyEvaluationHeader({ onSuccess }: WeeklyEvaluationHeaderProps) {
  const t = useTranslations("leader.weeklyEvaluation");
  const locale = useLocale();
  const { can } = useRBAC();
  const canCreate = can("WEEKLY_EVALUATION_CREATE");

  const { data: settingsResponse } = useSystemSettings();
  const workingDaysPerWeek = settingsResponse?.data?.WORKING_DAYS_PER_WEEK ?? 6;

  const startDayName = useMemo(
    () => getWeeklyEvaluationStartDayName(workingDaysPerWeek, locale),
    [workingDaysPerWeek, locale],
  );

  const isWindowOpen = useMemo(() => {
    return isWeeklyEvaluationWindowOpen(workingDaysPerWeek);
  }, [workingDaysPerWeek]);

  return (
    <MetalCard>
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 shrink-0">
                <Sparkles className="h-5 w-5 shrink-0" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold">
                <span className="metal-text">{t("title")}</span>
              </h1>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-muted">{t("description")}</p>
            <div className="mt-2.5 flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all duration-200 select-none ${
                  isWindowOpen
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.1)]"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.08)]"
                }`}
              >
                {isWindowOpen ? (
                  <CalendarCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                ) : (
                  <Clock className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                )}
                <span>
                  {isWindowOpen
                    ? t("windowOpenBadge", { day: startDayName })
                    : t("windowClosedBadge", { day: startDayName })}
                </span>
              </span>
            </div>
          </div>
          {canCreate && (
            <div className="flex items-center gap-3 shrink-0">
              <Modal>
                <Modal.Open opens="create-evaluation">
                  <Button variant="primary" size="md" className="flex items-center gap-2">
                    <Plus className="h-4 w-4 shrink-0" />
                    <span>{t("createEvaluation")}</span>
                  </Button>
                </Modal.Open>
                <Modal.Window name="create-evaluation" size="lg">
                  <WeeklyEvaluationCreateModal onSuccess={onSuccess} />
                </Modal.Window>
              </Modal>
            </div>
          )}
        </div>
      </div>
    </MetalCard>
  );
}

