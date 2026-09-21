"use client";

import React from "react";
import { Settings, RotateCcw, Save, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import MetalCard from "@/components/ui/MetalCard";
import Button from "@/components/ui/Button";
import { useRBAC } from "@/hooks/rbac/useRBAC";

interface SettingsHeaderProps {
  onOpenResetModal: () => void;
  onSave: () => void;
  isPending: boolean;
  hasErrors: boolean;
  hasChanges: boolean;
}

export default function SettingsHeader({
  onOpenResetModal,
  onSave,
  isPending,
  hasErrors,
  hasChanges,
}: SettingsHeaderProps) {
  const t = useTranslations("admin.settings");
  const { can } = useRBAC();
  const canManage = can("SYSTEM_CONFIG_MANAGE");

  return (
    <MetalCard>
      <div className="rounded-3xl p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          {/* Title & Description with icon box */}
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                <Settings className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold metal-text">
                {t("title")}
              </h1>
            </div>
            <p className="mt-1.5 text-xs sm:text-sm text-muted max-w-2xl leading-relaxed">
              {t("subtitle")}
            </p>
          </div>

          {/* Action Toolbar: Single location for Reset and Save */}
          {canManage && (
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {/* Reset to Defaults Button */}
              <Button
                type="button"
                variant="glass"
                size="md"
                onClick={onOpenResetModal}
                disabled={isPending}
                className="h-[42px] sm:h-[46px] text-xs sm:text-sm px-4"
              >
                <RotateCcw className="h-4 w-4 shrink-0 text-muted" />
                <span>{t("resetDefaults")}</span>
              </Button>

              {/* Save Settings Button */}
              <Button
                type="submit"
                variant="primary"
                size="md"
                onClick={onSave}
                disabled={isPending || hasErrors || !hasChanges}
                className="h-[42px] sm:h-[46px] text-xs sm:text-sm px-6 shadow-[0_0_25px_rgba(21,174,245,0.25)]"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                ) : (
                  <Save className="h-4 w-4 shrink-0" />
                )}
                <span>{isPending ? t("saving") : t("saveSettings")}</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </MetalCard>
  );
}
