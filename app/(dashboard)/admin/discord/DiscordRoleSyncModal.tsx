"use client";

import React, { useState, useMemo } from "react";
import {
  RefreshCw,
  Loader2,
  AlertTriangle,
  Mail,
  Send,
  ShieldCheck,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import { useBatchSyncRoles, useRemindUnlinkedDiscord } from "@/hooks/discord";
import { useRemindInternDiscord } from "@/hooks/intern/useRemindInternDiscord";
import type { BatchSyncRolesResponse } from "@/types/discord";

interface DiscordRoleSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DiscordRoleSyncModal({
  isOpen,
  onClose,
}: DiscordRoleSyncModalProps) {
  const t = useTranslations("discord");
  const batchSyncMutation = useBatchSyncRoles();
  const remindAllMutation = useRemindUnlinkedDiscord();
  const remindSingleMutation = useRemindInternDiscord();

  const [force, setForce] = useState(false);
  const [syncResult, setSyncResult] = useState<BatchSyncRolesResponse["data"] | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [remindedInternIds, setRemindedInternIds] = useState<Set<string>>(new Set());

  const handleStartSync = async () => {
    try {
      const res = await batchSyncMutation.mutateAsync({ force });
      setSyncResult(res.data);
      toast.success(
        t("syncRolesSuccess", {
          granted: res.data.grantedCount,
          revoked: res.data.revokedCount,
        }),
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t("syncRolesFailed");
      toast.error(message);
    }
  };

  const handleRemindAll = async () => {
    try {
      const res = await remindAllMutation.mutateAsync();
      toast.success(
        t("remindAllSuccess", {
          sent: res.data?.sentCount || 0,
          total: res.data?.totalEligible || 0,
        }),
      );
    } catch {
      toast.error(t("remindAllFailed"));
    }
  };

  const handleRemindSingle = async (internId: string, fullName: string) => {
    try {
      await remindSingleMutation.mutateAsync(internId);
      setRemindedInternIds((prev) => new Set([...prev, internId]));
      toast.success(t("remindSingleSuccess", { name: fullName }));
    } catch {
      toast.error(t("remindSingleFailed"));
    }
  };

  const filteredDetails = useMemo(() => {
    if (!syncResult?.details) return [];
    return syncResult.details.filter((item) => {
      const matchStatus =
        filterStatus === "ALL" || item.status === filterStatus;
      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        !query ||
        item.fullName.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.internCode.toLowerCase().includes(query) ||
        item.departmentName.toLowerCase().includes(query);
      return matchStatus && matchSearch;
    });
  }, [syncResult, filterStatus, searchQuery]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("syncRolesModalTitle")}
      size="xl"
    >
      <div className="space-y-6">
        {/* Header & Overview Banner */}
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 dark:border-indigo-500/20 dark:bg-indigo-950/20">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-foreground">
                {t("syncRolesEngineTitle")}
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                {t("syncRolesEngineDesc")}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-indigo-200/60 pt-3 dark:border-indigo-500/15">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-foreground">
              <input
                type="checkbox"
                checked={force}
                onChange={(e) => setForce(e.target.checked)}
                className="h-4 w-4 rounded border-border text-indigo-600 focus:ring-indigo-400"
              />
              <span>{t("forceSyncLabel")}</span>
            </label>

            <button
              type="button"
              onClick={handleStartSync}
              disabled={batchSyncMutation.isPending}
              className="
                inline-flex items-center gap-2 rounded-xl
                h-10 px-5 text-xs font-semibold
                bg-linear-to-r from-indigo-500 to-cyan-500 text-white
                shadow-[0_0_15px_rgba(99,102,241,0.3)]
                hover:shadow-[0_0_25px_rgba(99,102,241,0.5)]
                active:scale-95 transition-all
                disabled:pointer-events-none disabled:opacity-50 cursor-pointer
              "
            >
              {batchSyncMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              ) : (
                <RefreshCw className="h-4 w-4 shrink-0" />
              )}
              <span>
                {batchSyncMutation.isPending
                  ? t("syncingRoles")
                  : t("startBatchSync")}
              </span>
            </button>
          </div>
        </div>

        {/* Stats KPIs (When sync completed) */}
        {syncResult && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              <div className="rounded-xl border border-border bg-card/60 p-3 text-center">
                <span className="text-xs text-muted font-medium">{t("scannedCount")}</span>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {syncResult.totalScanned}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-center">
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  {t("grantedCount")}
                </span>
                <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  +{syncResult.grantedCount}
                </p>
              </div>
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-center">
                <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {t("revokedCount")}
                </span>
                <p className="mt-1 text-2xl font-bold text-rose-600 dark:text-rose-400">
                  -{syncResult.revokedCount}
                </p>
              </div>
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-center">
                <span className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">
                  {t("alreadySyncedCount")}
                </span>
                <p className="mt-1 text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                  {syncResult.alreadySyncedCount}
                </p>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-center">
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  {t("missingIdCount")}
                </span>
                <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {syncResult.missingIdCount}
                </p>
              </div>
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-center">
                <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {t("failedCount")}
                </span>
                <p className="mt-1 text-2xl font-bold text-rose-600 dark:text-rose-400">
                  {syncResult.failedCount}
                </p>
              </div>
            </div>

            {/* Missing ID Reminder Banner */}
            {syncResult.missingIdCount > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50/80 p-4 dark:border-amber-500/30 dark:bg-amber-950/30">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-foreground">
                      {t("missingIdWarningTitle", {
                        count: syncResult.missingIdCount,
                      })}
                    </h5>
                    <p className="text-xs text-muted">
                      {t("missingIdWarningDesc")}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemindAll}
                  disabled={remindAllMutation.isPending}
                  className="
                    inline-flex items-center gap-2 rounded-xl
                    h-9 px-4 text-xs font-semibold shrink-0
                    border border-amber-500/30 bg-amber-500/10 text-amber-700
                    dark:border-amber-400/20 dark:bg-amber-500/15 dark:text-amber-300
                    hover:bg-amber-500/20 transition-all active:scale-95
                    disabled:pointer-events-none disabled:opacity-50 cursor-pointer
                  "
                >
                  {remindAllMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Mail className="h-3.5 w-3.5" />
                  )}
                  <span>
                    {t("remindAllButton", { count: syncResult.missingIdCount })}
                  </span>
                </button>
              </div>
            )}

            {/* Filter Tabs & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-border pt-4">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { key: "ALL", label: t("tabAll"), count: syncResult.totalScanned },
                  { key: "GRANTED", label: t("tabGranted"), count: syncResult.grantedCount },
                  { key: "REVOKED", label: t("tabRevoked"), count: syncResult.revokedCount },
                  { key: "MISSING_ID", label: t("tabMissingId"), count: syncResult.missingIdCount },
                  { key: "FAILED", label: t("tabFailed"), count: syncResult.failedCount },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setFilterStatus(tab.key)}
                    className={`
                      inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition cursor-pointer
                      ${
                        filterStatus === tab.key
                          ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 font-semibold"
                          : "text-muted hover:bg-card hover:text-foreground"
                      }
                    `}
                  >
                    <span>{tab.label}</span>
                    <span className="rounded-full bg-card px-1.5 py-0.2 text-[10px] opacity-80">
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              <div className="w-full sm:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("searchInternPlaceholder")}
                  className="
                    h-9 w-full rounded-xl border border-border bg-card px-3.5 text-xs
                    text-foreground placeholder:text-muted/60
                    focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 transition-all
                  "
                />
              </div>
            </div>

            {/* Results Table */}
            <div className="max-h-72 overflow-y-auto rounded-xl border border-border bg-card/40">
              {filteredDetails.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted">
                  {t("noDetailsMatch")}
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-card/95 border-b border-border text-muted uppercase text-[10px] tracking-wider z-10 backdrop-blur-sm">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">{t("colIntern")}</th>
                      <th className="py-2.5 px-3 font-semibold">{t("colDepartment")}</th>
                      <th className="py-2.5 px-3 font-semibold">{t("colDiscordId")}</th>
                      <th className="py-2.5 px-3 font-semibold">{t("colStatus")}</th>
                      <th className="py-2.5 px-3 font-semibold text-right">{t("colAction")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {filteredDetails.map((item) => (
                      <tr key={item.internId} className="hover:bg-card/70 transition">
                        <td className="py-2 px-3">
                          <div className="font-semibold text-foreground">
                            {item.fullName}
                          </div>
                          <div className="text-[11px] text-muted">
                            {item.internCode} · {item.email}
                          </div>
                        </td>
                        <td className="py-2 px-3 text-muted">
                          {item.departmentName}
                        </td>
                        <td className="py-2 px-3">
                          {item.discordUserId ? (
                            <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                              {item.discordUserId}
                            </span>
                          ) : (
                            <span className="text-[11px] text-muted/60 italic">
                              {t("unlinked")}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1.5">
                            {item.status === "GRANTED" && (
                              <Badge variant="success" size="sm">
                                {t("statusGranted")}
                              </Badge>
                            )}
                            {item.status === "REVOKED" && (
                              <Badge variant="danger" size="sm">
                                {t("statusRevoked")}
                              </Badge>
                            )}
                            {item.status === "ALREADY_SYNCED" && (
                              <Badge variant="purple" size="sm">
                                {t("statusAlreadySynced")}
                              </Badge>
                            )}
                            {item.status === "MISSING_ID" && (
                              <Badge variant="warning" size="sm">
                                {t("statusMissingId")}
                              </Badge>
                            )}
                            {item.status === "FAILED" && (
                              <Badge variant="danger" size="sm">
                                {t("statusFailed")}
                              </Badge>
                            )}
                          </div>
                          <div className="mt-0.5 text-[10px] text-muted line-clamp-1">
                            {item.message}
                          </div>
                        </td>
                        <td className="py-2 px-3 text-right">
                          {item.status === "MISSING_ID" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleRemindSingle(item.internId, item.fullName)
                              }
                              disabled={
                                remindSingleMutation.isPending ||
                                remindedInternIds.has(item.internId)
                              }
                              className="
                                inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium
                                border border-amber-400/30 bg-amber-500/10 text-amber-600
                                dark:border-amber-400/20 dark:text-amber-300
                                hover:bg-amber-500/20 transition active:scale-95
                                disabled:opacity-50 disabled:pointer-events-none cursor-pointer
                              "
                            >
                              <Send className="h-3 w-3" />
                              <span>
                                {remindedInternIds.has(item.internId)
                                  ? t("reminded")
                                  : t("remind")}
                              </span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <button
            type="button"
            onClick={onClose}
            className="
              rounded-xl border border-border bg-card px-4 py-2 text-xs font-medium text-muted
              hover:text-foreground hover:bg-card/80 transition active:scale-95 cursor-pointer
            "
          >
            {t("modal.cancelButton")}
          </button>
        </div>
      </div>
    </Modal>
  );
}
