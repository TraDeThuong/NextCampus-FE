"use client";

import React, { useState } from "react";
import {
  Trophy,
  ShieldAlert,
  Send,
  Loader2,
  Edit2,
  Trash2,
  Plus,
  Clock,
  Sparkles,
} from "lucide-react";
import { SiDiscord } from "react-icons/si";
import { useTranslations } from "next-intl";
import { toast } from "react-hot-toast";
import MetalCard from "@/components/ui/MetalCard";
import Badge from "@/components/ui/Badge";
import type { DiscordWebhookConfig, DiscordWebhookPurpose } from "@/types/discord";
import { useTestDiscordWebhook } from "@/hooks/discord";
import { useRBAC } from "@/hooks/rbac/useRBAC";

interface GlobalDiscordChannelsProps {
  webhooks: DiscordWebhookConfig[];
  onOpenCreateWithPurpose: (purpose: DiscordWebhookPurpose) => void;
  onOpenEdit: (webhook: DiscordWebhookConfig) => void;
  onOpenDelete: (webhook: DiscordWebhookConfig) => void;
}

export default function GlobalDiscordChannels({
  webhooks,
  onOpenCreateWithPurpose,
  onOpenEdit,
  onOpenDelete,
}: GlobalDiscordChannelsProps) {
  const t = useTranslations("discord");
  const { can } = useRBAC();
  const canManage = can("DISCORD_MANAGE");
  const testMutation = useTestDiscordWebhook();
  const [testingId, setTestingId] = useState<string | null>(null);

  const leaderboardConfig = webhooks.find(
    (w) => w.purpose === "LEADERBOARD" && w.scope === "GLOBAL"
  );
  const leaderAlertsConfig = webhooks.find(
    (w) => w.purpose === "LEADER_ALERTS" && w.scope === "GLOBAL"
  );

  const handleTestPing = async (config: DiscordWebhookConfig) => {
    try {
      setTestingId(config.id);
      const res = await testMutation.mutateAsync({ id: config.id });
      if (res.success) {
        toast.success(
          t("toasts.testSuccess", { ms: res.data?.responseTimeMs ?? 150 })
        );
      } else {
        toast.error(
          t("toasts.testFailed", { message: res.message || "Error" })
        );
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error";
      toast.error(t("toasts.connectionError", { message: errorMsg }));
    } finally {
      setTestingId(null);
    }
  };

  const renderChannelCard = (
    title: string,
    desc: string,
    purpose: DiscordWebhookPurpose,
    config?: DiscordWebhookConfig,
    Icon = Trophy,
    gradient = "from-amber-500/20 to-yellow-500/5",
    borderGlow = "border-amber-400/30",
    iconColor = "text-amber-400 bg-amber-500/10 border-amber-400/30"
  ) => {
    const isTesting = testingId === config?.id;

    return (
      <MetalCard className={`relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border ${borderGlow}`}>
        <div
          className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${gradient} rounded-bl-full pointer-events-none blur-xl`}
        />

        <div className="p-6 flex flex-col justify-between h-full gap-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${iconColor} shadow-inner transition-all duration-500 group-hover:rotate-6 group-hover:scale-110`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground">
                    {title}
                  </h3>
                  {purpose === "LEADERBOARD" && (
                    <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                  )}
                </div>
                <p className="text-xs text-muted mt-0.5 max-w-sm line-clamp-2">
                  {desc}
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <div>
              {!config ? (
                <Badge variant="outline" size="sm">
                  {t("statuses.unconfigured")}
                </Badge>
              ) : config.lastStatus === "SUCCESS" ? (
                <Badge variant="success" size="sm" dot pulse>
                  {t("statuses.success")}
                </Badge>
              ) : config.lastStatus === "FAILED" ? (
                <Badge variant="danger" size="sm" dot>
                  {t("statuses.failed")}
                </Badge>
              ) : (
                <Badge variant="primary" size="sm" dot>
                  {t("statuses.active")}
                </Badge>
              )}
            </div>
          </div>

          {/* Configuration Detail */}
          {config ? (
            <div className="space-y-3 pt-2 border-t border-border/50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted flex items-center gap-1.5">
                  <SiDiscord className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Webhook URL:</span>
                </span>
                <code className="px-2 py-0.5 rounded-lg bg-black/20 dark:bg-white/5 font-mono text-[11px] text-foreground/80 border border-border/40">
                  {config.webhookUrl || config.maskedWebhookUrl || "••••••••••••••••••••"}
                </code>
              </div>

              {config.discordRoleId && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted">Mention Role:</span>
                  <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono text-[11px]">
                    &lt;@&amp;{config.discordRoleId}&gt;
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-muted">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {config.lastPingAt
                      ? t("globalSection.lastPing", {
                          time: new Date(config.lastPingAt).toLocaleTimeString(),
                        })
                      : t("globalSection.noPingYet")}
                  </span>
                </span>

                {config.lastError && (
                  <span
                    className="text-rose-400 truncate max-w-[180px]"
                    title={config.lastError}
                  >
                    {config.lastError}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="py-4 text-center rounded-2xl border border-dashed border-border/70 bg-card/40">
              <p className={`text-xs text-muted ${canManage ? "mb-3" : ""}`}>
                {t("globalSection.notConfigured")}
              </p>
              {canManage && (
                <button
                  type="button"
                  onClick={() => onOpenCreateWithPurpose(purpose)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-card/80 text-xs font-medium text-foreground transition active:scale-95 cursor-pointer shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{t("globalSection.setupNow")}</span>
                </button>
              )}
            </div>
          )}

          {/* Action buttons */}
          {canManage && config && (
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/50">
              <button
                type="button"
                disabled={isTesting || !config.isEnabled}
                onClick={() => handleTestPing(config)}
                className="
                  inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold
                  bg-gradient-to-r from-indigo-500 to-cyan-500 text-white
                  hover:brightness-110 active:scale-95 transition-all
                  disabled:opacity-50 disabled:pointer-events-none cursor-pointer
                  shadow-[0_0_15px_rgba(99,102,241,0.25)]
                "
              >
                {isTesting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>{t("globalSection.testing")}</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>{t("globalSection.testPing")}</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onOpenEdit(config)}
                  title={t("tooltips.edit")}
                  className="p-1.5 rounded-xl border border-border bg-card/60 hover:bg-card text-muted hover:text-foreground transition active:scale-95 cursor-pointer"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onOpenDelete(config)}
                  title={t("tooltips.delete")}
                  className="p-1.5 rounded-xl border border-rose-300 bg-rose-100/80 text-rose-700 hover:bg-rose-200/80 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 transition active:scale-95 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </MetalCard>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
              <Trophy className="h-3.5 w-3.5" />
            </div>
            <h2 className="text-lg font-bold text-foreground metal-text">
              {t("globalSection.title")}
            </h2>
            <Badge variant="warning" size="sm">
              2
            </Badge>
          </div>
          <p className="text-xs text-muted mt-0.5">
            {t("globalSection.subtitle")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderChannelCard(
          t("globalSection.leaderboardTitle"),
          t("globalSection.leaderboardDesc"),
          "LEADERBOARD",
          leaderboardConfig,
          Trophy,
          "from-amber-500/20 to-yellow-500/5",
          "border-amber-400/30",
          "border-amber-300 bg-amber-100/80 text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/15 dark:text-amber-400"
        )}

        {renderChannelCard(
          t("globalSection.leaderAlertsTitle"),
          t("globalSection.leaderAlertsDesc"),
          "LEADER_ALERTS",
          leaderAlertsConfig,
          ShieldAlert,
          "from-rose-500/20 to-orange-500/5",
          "border-rose-400/30",
          "border-rose-300 bg-rose-100/80 text-rose-700 dark:border-rose-400/30 dark:bg-rose-500/15 dark:text-rose-400"
        )}
      </div>
    </div>
  );
}
