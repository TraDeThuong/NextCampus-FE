"use client";

import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import type { DiscordWebhookConfig } from "@/types/discord";
import { useDeleteDiscordWebhook } from "@/hooks/discord";
import { useRBAC } from "@/hooks/rbac/useRBAC";

interface DiscordDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  webhook: DiscordWebhookConfig | null;
}

export default function DiscordDeleteModal({
  isOpen,
  onClose,
  webhook,
}: DiscordDeleteModalProps) {
  const t = useTranslations("discord");
  const { can } = useRBAC();
  const canManage = can("DISCORD_MANAGE");
  const deleteMutation = useDeleteDiscordWebhook();

  const handleDelete = async () => {
    if (!webhook) return;
    try {
      await deleteMutation.mutateAsync(webhook.id);
      toast.success(t("toasts.deleteSuccess"));
      onClose();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Error";
      toast.error(t("toasts.deleteFailed", { message: errorMsg }));
    }
  };

  if (!webhook || !canManage) return null;

  const displayUrl = webhook.webhookUrl || webhook.maskedWebhookUrl;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("modal.deleteConfirmTitle")}
      size="sm"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3.5 p-4 rounded-2xl border border-rose-200 bg-rose-50/80 dark:border-rose-500/20 dark:bg-rose-500/10">
          <AlertTriangle className="h-6 w-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
              {t("modal.deleteConfirmTitle")}
            </p>
            <p className="text-xs text-muted leading-relaxed">
              {t("modal.deleteConfirmDesc")}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card/60 p-3 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted">{t("modal.purposeSummary")}</span>
            <span className="font-semibold text-foreground">
              {webhook.purpose}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">{t("modal.scopeSummary")}</span>
            <span className="font-medium text-foreground">
              {webhook.scope}
            </span>
          </div>
          {displayUrl && (
            <div className="flex justify-between">
              <span className="text-muted">{t("modal.urlSummary")}</span>
              <code className="font-mono text-[11px] text-muted truncate max-w-[180px]">
                {displayUrl}
              </code>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            disabled={deleteMutation.isPending}
            className="h-[42px] sm:h-[46px] px-5 rounded-xl border border-border bg-card hover:bg-card/80 text-sm font-medium text-foreground transition active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {t("modal.cancelButton")}
          </button>
          <button
            type="button"
            disabled={deleteMutation.isPending}
            onClick={handleDelete}
            className="
              inline-flex items-center justify-center gap-2 h-[42px] sm:h-[46px] px-5 rounded-xl text-sm font-semibold
              bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600 text-white transition-all
              shadow-[0_0_15px_rgba(244,63,94,0.3)]
              disabled:opacity-50 disabled:pointer-events-none cursor-pointer active:scale-95
            "
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t("modal.deletingButton")}</span>
              </>
            ) : (
              <span>{t("modal.deleteButton")}</span>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
