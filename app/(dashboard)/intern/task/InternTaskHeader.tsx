"use client";

import { CheckSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import MetalCard from "@/components/ui/MetalCard";

export default function InternTaskHeader() {
  const t = useTranslations("intern.tasks");
  return (
    <MetalCard>
      <div className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CheckSquare className="h-6 w-6 shrink-0 text-cyan-400" />
              <h2 className="text-2xl font-bold metal-text">{t("title")}</h2>
            </div>
            <p className="mt-1 text-sm text-muted">{t("description")}</p>
          </div>
        </div>
      </div>
    </MetalCard>
  );
}
