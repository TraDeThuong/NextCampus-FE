"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  RotateCcw,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { useRBAC } from "@/hooks/rbac/useRBAC";
import { useWebhookDeliveries } from "@/hooks/integration/useWebhookDeliveries";
import { useRetryDelivery } from "@/hooks/integration/useRetryDelivery";
import type { WebhookItem } from "@/types/integration";

interface WebhookDeliveriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  webhook: WebhookItem | null;
}

export default function WebhookDeliveriesModal({
  isOpen,
  onClose,
  webhook,
}: WebhookDeliveriesModalProps) {
  const t = useTranslations("admin.settings.webhooks.deliveriesModal");
  const { can } = useRBAC();
  const canManage = can("WEBHOOK_MANAGE");

  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: res, isLoading, isError, refetch } = useWebhookDeliveries(
    webhook?.id ?? null,
    { page, limit },
    isOpen && Boolean(webhook)
  );

  const retryMutation = useRetryDelivery();

  if (!webhook) return null;

  const deliveries = res?.data?.items ?? [];
  const totalPages = res?.data?.totalPages ?? 1;

  const handleRetry = (deliveryId: string) => {
    if (!canManage) return;
    retryMutation.mutate(deliveryId);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${t("title")} - ${webhook.url}`}
      size="xl"
    >
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex h-48 w-full flex-col items-center justify-center gap-3">
            <Spinner size="md" />
            <p className="text-xs text-muted">Đang tải nhật ký gửi tin...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center space-y-3">
            <AlertCircle className="h-8 w-8 mx-auto text-red-400" />
            <p className="text-xs text-muted">Không thể tải nhật ký gửi tin.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Thử lại
            </Button>
          </div>
        ) : deliveries.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted space-y-2">
            <Clock className="h-8 w-8 mx-auto text-muted/50" />
            <p>{t("noLogs")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border/40">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border/40 bg-card/60 text-muted">
                  <th className="px-4 py-2.5 font-semibold">{t("event")}</th>
                  <th className="px-4 py-2.5 font-semibold">{t("status")}</th>
                  <th className="px-4 py-2.5 font-semibold">{t("code")}</th>
                  <th className="px-4 py-2.5 font-semibold">{t("attempts")}</th>
                  <th className="px-4 py-2.5 font-semibold">{t("time")}</th>
                  {canManage && (
                    <th className="px-4 py-2.5 font-semibold text-right">
                      {t("actions")}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {deliveries.map((d) => (
                  <tr key={d.id} className="hover:bg-card/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-foreground">
                      {d.event}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          d.status === "SUCCESS"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : d.status === "FAILED"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {d.status === "SUCCESS" ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : d.status === "FAILED" ? (
                          <XCircle className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        {d.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-mono">
                      {d.statusCode ? (
                        <span
                          className={
                            d.statusCode >= 200 && d.statusCode < 300
                              ? "text-emerald-400"
                              : "text-red-400"
                          }
                        >
                          {d.statusCode}
                        </span>
                      ) : (
                        <span className="text-muted/60">-</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-muted">{d.attempts}</td>

                    <td className="px-4 py-3 text-muted text-[11px]">
                      {new Date(d.createdAt).toLocaleString()}
                    </td>

                    {canManage && (
                      <td className="px-4 py-3 text-right">
                        {d.status === "FAILED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRetry(d.id)}
                            disabled={retryMutation.isPending}
                            className="text-xs px-2 py-1"
                          >
                            {retryMutation.isPending ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                              <RotateCcw className="h-3 w-3 mr-1" />
                            )}
                            {t("retry")}
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-muted">
              Trang {page} / {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-2 py-1 text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-2 py-1 text-xs"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-border/40">
          <Button variant="outline" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
}
