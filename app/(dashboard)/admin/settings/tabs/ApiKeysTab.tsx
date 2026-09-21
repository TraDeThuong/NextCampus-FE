"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  KeyRound,
  Plus,
  Trash2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  Lock,
} from "lucide-react";
import MetalCard from "@/components/ui/MetalCard";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { useRBAC } from "@/hooks/rbac/useRBAC";
import { useApiKeys } from "@/hooks/integration/useApiKeys";
import { useDeleteApiKey } from "@/hooks/integration/useDeleteApiKey";
import { useToggleApiKey } from "@/hooks/integration/useToggleApiKey";
import CreateApiKeyModal from "./CreateApiKeyModal";
import RevealApiKeyModal from "./RevealApiKeyModal";
import type { ApiKeyItem, CreateApiKeyResult } from "@/types/integration";

export default function ApiKeysTab() {
  const t = useTranslations("admin.settings.apiKeys");
  const { can } = useRBAC();
  const canManage = can("API_KEY_MANAGE");

  const { data: res, isLoading, isError, refetch } = useApiKeys();
  const deleteMutation = useDeleteApiKey();
  const toggleMutation = useToggleApiKey();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createdResult, setCreatedResult] = useState<CreateApiKeyResult | null>(
    null
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const keys = res?.data ?? [];

  const handleCopyPrefix = (id: string, prefix: string) => {
    navigator.clipboard.writeText(prefix);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggle = (item: ApiKeyItem) => {
    if (!canManage) return;
    toggleMutation.mutate({ id: item.id, isActive: !item.isActive });
  };

  const handleDelete = (item: ApiKeyItem) => {
    if (!canManage) return;
    if (window.confirm(`${t("revokeConfirm")}: "${item.name}"?\n${t("revokeDesc")}`)) {
      deleteMutation.mutate(item.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-72 w-full flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-xs font-medium text-muted animate-pulse">
          Đang tải danh sách API Keys...
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
          Không thể tải danh sách API Keys.
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
              <KeyRound className="h-6 w-6" />
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
              {t("createKey")}
            </Button>
          )}
        </div>

        {!canManage && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-border/40 bg-card/40 p-3 text-xs text-muted">
            <Lock className="h-4 w-4 shrink-0 text-amber-400" />
            <span>
              Bạn chỉ có quyền xem danh sách API Keys. Cần quyền{" "}
              <code className="text-foreground font-mono">API_KEY_MANAGE</code> để tạo mới hoặc thu hồi khóa.
            </span>
          </div>
        )}
      </MetalCard>

      {/* Table Card */}
      <MetalCard className="overflow-hidden">
        {keys.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted space-y-3">
            <KeyRound className="h-8 w-8 mx-auto text-muted/50" />
            <p>{t("noKeys")}</p>
            {canManage && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateOpen(true)}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                {t("createKey")}
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border/40 bg-card/50 text-muted">
                  <th className="px-5 py-3 font-semibold">{t("table.name")}</th>
                  <th className="px-5 py-3 font-semibold">{t("table.prefix")}</th>
                  <th className="px-5 py-3 font-semibold">{t("table.permissions")}</th>
                  <th className="px-5 py-3 font-semibold">{t("table.status")}</th>
                  <th className="px-5 py-3 font-semibold">{t("table.lastUsed")}</th>
                  <th className="px-5 py-3 font-semibold">{t("table.createdAt")}</th>
                  {canManage && (
                    <th className="px-5 py-3 font-semibold text-right">
                      {t("table.actions")}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {keys.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-card/40 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <KeyRound className="h-3.5 w-3.5 text-primary-light/70" />
                        <span>{item.name}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 font-mono text-muted">
                      <div className="flex items-center gap-1.5">
                        <span>{item.prefix}...</span>
                        <button
                          type="button"
                          onClick={() => handleCopyPrefix(item.id, item.prefix)}
                          className="p-1 hover:text-foreground text-muted/60 transition-colors"
                          title="Sao chép prefix"
                        >
                          {copiedId === item.id ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {item.permissions.length === 0 ? (
                          <span className="text-[11px] text-muted italic">
                            (Không có quyền)
                          </span>
                        ) : (
                          item.permissions.slice(0, 3).map((perm) => (
                            <span
                              key={perm}
                              className="px-1.5 py-0.5 rounded bg-card text-muted border border-border/40 text-[10px] font-mono"
                            >
                              {perm}
                            </span>
                          ))
                        )}
                        {item.permissions.length > 3 && (
                          <span className="px-1.5 py-0.5 rounded bg-primary-light/10 text-primary-light text-[10px] font-semibold">
                            +{item.permissions.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      {canManage ? (
                        <button
                          type="button"
                          onClick={() => handleToggle(item)}
                          disabled={toggleMutation.isPending}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                            item.isActive
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                              : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/30 hover:bg-zinc-500/20"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              item.isActive ? "bg-emerald-400" : "bg-zinc-400"
                            }`}
                          />
                          {item.isActive ? "Hoạt động" : "Vô hiệu"}
                        </button>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
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
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-muted text-[11px]">
                      {item.lastUsedAt ? (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted/60" />
                          <span>{new Date(item.lastUsedAt).toLocaleString()}</span>
                        </div>
                      ) : (
                        <span className="italic text-muted/60">Chưa sử dụng</span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-muted text-[11px]">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>

                    {canManage && (
                      <td className="px-5 py-3.5 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(item)}
                          disabled={deleteMutation.isPending}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/30 text-xs px-2 py-1"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Thu hồi
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </MetalCard>

      {/* Modals */}
      <CreateApiKeyModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={(result) => setCreatedResult(result)}
      />

      <RevealApiKeyModal
        isOpen={Boolean(createdResult)}
        onClose={() => setCreatedResult(null)}
        apiKeyResult={createdResult}
      />
    </div>
  );
}
