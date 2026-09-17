"use client";

import { Plus, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import MetalCard from "@/components/ui/MetalCard";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import WeeklyEvaluationCreateModal from "./WeeklyEvaluationCreateModal";

export default function WeeklyEvaluationHeader() {
  const t = useTranslations("leader.weeklyEvaluation");

  return (
    <MetalCard>
      <div className="rounded-3xl p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary-light shrink-0" />
              <span className="metal-text">{t("title")}</span>
            </h2>
            <p className="mt-1 text-sm text-slate-500">{t("description")}</p>
          </div>
          <div className="flex items-center gap-3">
            <Modal>
              <Modal.Open opens="create-evaluation">
                <Button variant="primary" size="md"><Plus className="h-4 w-4 mr-1" />{t("createEvaluation")}</Button>
              </Modal.Open>
              <Modal.Window name="create-evaluation" size="md"><WeeklyEvaluationCreateModal /></Modal.Window>
            </Modal>
          </div>
        </div>
      </div>
    </MetalCard>
  );
}
