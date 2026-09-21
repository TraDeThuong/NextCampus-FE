"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Webhook,
  Plus,
  Send,
  History,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  Lock,
} from "lucide-react";
import MetalCard from "@/components/ui/MetalCard";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { useRBAC } from "@/hooks/rbac/useRBAC";
import { useWebhooks } from "@/hooks/integration/useWebhooks";
import { useDeleteWebhook } from "@/hooks/integration/useDeleteWebhook";
import { useTestWebhook } from "@/hooks/integration/useTestWebhook";
import CreateWebhookModal from "./CreateWebhookModal";
import EditWebhookModal from "./EditWebhookModal";
import WebhookDeliveriesModal from "./WebhookDeliveriesModal";
import type { WebhookItem } from "@/types/integration";

export default function WebhooksTab() {
  const t = useTranslations("admin.settings.webhooks");
  const { can } = useRBAC();
  const canManage = can("WEBHOOK_MANAGE");

  const { data: res, isLoading, isError, refetch } = useWebhooks();
  const deleteMutation = useDeleteWebhook();
  const testMutation = useTestWebhook();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookItem | null>(null);
  const [historyWebhook, setHistoryWebhook] = useState<WebhookItem | null>(null);
  const [copiedUrlId, setCopiedUrlId] = useState<string | null>(null);

  const webhooks = res?.data ?? [];

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrlId(id);
    setTimeout(() => setCopiedUrlId(null), 2000);
  };

  const handleTestPing = (webhook: WebhookItem) => {
    if (!canManage) return;
    testMutation.mutate(webhook.id, {
      onSuccess: () => {
        setHistoryWebhook(webhook);
      },
    });
  };

  const handleDelete = (webhook: WebhookItem) => {
    if (!canManage) return;
    if (window.confirm(`${t("deleteConfirm")}\nURL: ${webhook.url}`)) {
      deleteMutation.mutate(webhook.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-72 w-full flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-xs font-medium text-muted animate-pulse">
          Đang tải danh sách Webhooks...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <MetalCard className="p-8 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-400">
          <AlertCircle className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold text-foreground">
          Không thể tải danh sách Webhooks.
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Thử lại
        </Button>
      </MetalCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <MetalCard className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary-light/30 bg-primary-light/10 text-primary-light shadow-[0_0_20px_rgba(99,102,241,0.15)]">
              <Webhook className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">{t("title")}</h3>
              <p className="text-xs text-muted mt-0.5">{t("subtitle")}</p>
            </div>
          </div>

          {canManage && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              className="shrink-0"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              {t("createWebhook")}
            </Button>
          )}
        </div>

        {!canManage && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-border/40 bg-card/40 p-3 text-xs text-muted">
            <Lock className="h-4 w-4 shrink-0 text-amber-400" />
            <span>
              Bạn chỉ có quyền xem danh sách Webhooks. Cần quyền{" "}
              <code className="text-foreground font-mono">WEBHOOK_MANAGE</code> để tạo mới, cấu hình hoặc test webhook.
            </span>
          </div>
        )}
      </MetalCard>

      {/* Table Card */}
      <MetalCard className="overflow-hidden">
        {webhooks.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted space-y-3">
            <Webhook className="h-8 w-8 mx-auto text-muted/50" />
            <p>{t("noWebhooks")}</p>
            {canManage && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateOpen(true)}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                {t("createWebhook")}
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border/40 bg-card/50 text-muted">
                  <th className="px-5 py-3 font-semibold">{t("table.url")}</th>
                  <th className="px-5 py-3 font-semibold">{t("table.events")}</th>
                  <th className="px-5 py-3 font-semibold">{t("table.status")}</th>
                  <th className="px-5 py-3 font-semibold">{t("table.secret")}</th>
                  <th className="px-5 py-3 font-semibold">{t("table.createdAt")}</th>
                  <th className="px-5 py-3 font-semibold text-right">
                    {t("table.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {webhooks.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-card/40 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-medium text-foreground">
                      <div className="flex items-center gap-1.5 max-w-sm">
                        <span className="font-mono truncate">{item.url}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyUrl(item.id, item.url)}
                          className="p-1 hover:text-foreground text-muted/60 transition-colors shrink-0"
                          title="Sao chép URL"
                        >
                          {copiedUrlId === item.id ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                      {item.description && (
                        <p className="text-[11px] text-muted/70 truncate mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {item.events.includes("*") ? (
                          <span className="px-2 py-0.5 rounded bg-primary-light/10 text-primary-light border border-primary-light/20 text-[10px] font-semibold">
                            {t("allEvents")}
                          </span>
                        ) : (
                          item.events.map((ev) => (
                            <span
                              key={ev}
                              className="px-1.5 py-0.5 rounded bg-card text-muted border border-border/40 text-[10px] font-mono"
                            >
                              {ev}
                            </span>
                          ))
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          item.isActive
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            item.isActive ? "bg-emerald-400" : "bg-zinc-400"
                          }`}
                        />
                        {item.isActive ? "Hoạt động" : "Vô hiệu"}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 font-mono text-muted text-[11px]">
                      {item.secretMasked || "whsec_••••••••••••"}
                    </td>

                    <td className="px-5 py-3.5 text-muted text-[11px]">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Ping Test Button */}
                        {canManage && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestPing(item)}
                            disabled={testMutation.isPending}
                            title={t("testPing")}
                            className="px-2 py-1 text-xs"
                          >
                            {testMutation.isPending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Send className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        )}

                        {/* Deliveries History Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setHistoryWebhook(item)}
                          title={t("deliveries")}
                          className="px-2 py-1 text-xs"
                        >
                          <History className="h-3.5 w-3.5" />
                        </Button>

                        {/* Edit Button */}
                        {canManage && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingWebhook(item)}
                            title={t("edit")}
                            className="px-2 py-1 text-xs"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                        )}

                        {/* Delete Button */}
                        {canManage && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(item)}
                            disabled={deleteMutation.isPending}
                            title={t("delete")}
                            className="px-2 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/30"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </MetalCard>

      {/* Modals */}
      <CreateWebhookModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {editingWebhook && (
        <EditWebhookModal
          key={editingWebhook.id}
          isOpen={true}
          onClose={() => setEditingWebhook(null)}
          webhook={editingWebhook}
        />
      )}

      <WebhookDeliveriesModal
        isOpen={Boolean(historyWebhook)}
        onClose={() => setHistoryWebhook(null)}
        webhook={historyWebhook}
      />
    </div>
  );
}
