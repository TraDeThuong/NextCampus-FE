"use client";

import React from "react";
import { AlertTriangle, RotateCcw, X, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface ResetDefaultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending?: boolean;
}

export default function ResetDefaultsModal({
  isOpen,
  onClose,
  onConfirm,
  isPending = false,
}: ResetDefaultsModalProps) {
  const t = useTranslations("admin.settings");

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="p-5 sm:p-6 space-y-5">
        {/* Header Icon + Title */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            <RotateCcw className="h-6 w-6 shrink-0" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              {t("resetModal.title")}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-muted leading-relaxed">
              {t("resetModal.desc")}
            </p>
          </div>
        </div>

        {/* Warning Callout */}
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/5 p-3.5 sm:p-4 text-xs sm:text-sm text-amber-200/90 leading-relaxed">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
          <span>{t("resetModal.warning")}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="glass"
            size="md"
            onClick={onClose}
            disabled={isPending}
            className="flex items-center gap-1.5"
          >
            <X className="h-4 w-4 shrink-0" />
            <span>{t("resetModal.cancelBtn")}</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onConfirm}
            disabled={isPending}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 border-amber-400/30 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
          >
            <Check className="h-4 w-4 shrink-0" />
            <span>{t("resetModal.confirmBtn")}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
