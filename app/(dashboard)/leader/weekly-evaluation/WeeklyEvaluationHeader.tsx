"use client";

import { Plus, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import MetalCard from "@/components/ui/MetalCard";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import WeeklyEvaluationCreateModal from "./WeeklyEvaluationCreateModal";

interface WeeklyEvaluationHeaderProps {
  onSuccess?: () => void;
}

export default function WeeklyEvaluationHeader({ onSuccess }: WeeklyEvaluationHeaderProps) {
  const t = useTranslations("leader.weeklyEvaluation");

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
          </div>
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
        </div>
      </div>
    </MetalCard>
  );
}
