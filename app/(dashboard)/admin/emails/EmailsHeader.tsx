"use client";

import React from "react";
import { Mail, Settings2, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import MetalCard from "@/components/ui/MetalCard";
import { useRBAC } from "@/hooks/rbac/useRBAC";

interface EmailsHeaderProps {
  mode: "templates" | "send";
  setMode: (mode: "templates" | "send") => void;
}

export default function EmailsHeader({
  mode,
  setMode,
}: EmailsHeaderProps) {
  const t = useTranslations();
  const { can } = useRBAC();
  const canSend = can("NOTIFICATION_CREATE");

  return (
    <MetalCard>
      <div className="rounded-3xl p-5 sm:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          {/* Title & Description */}
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                <Mail className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold metal-text">
                {t("admin.emails.headerTitle")}
              </h1>
            </div>
            <p className="mt-1.5 text-xs sm:text-sm text-muted">
              {mode === "templates"
                ? t("admin.emails.descTemplates")
                : t("admin.emails.descSend")}
            </p>
          </div>

          {/* Right Action Toolbar - Mode Switcher (only show if canSend is true) */}
          {canSend && (
            <div className="flex items-center rounded-xl sm:rounded-2xl bg-card border border-border p-1 shadow-inner self-start md:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setMode("templates")}
                className={`
                  flex items-center gap-1.5 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 text-xs font-semibold
                  transition-all duration-200 cursor-pointer select-none
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400
                  ${
                    mode === "templates"
                      ? "bg-cyan-500/15 text-cyan-400 border border-cyan-400/30 shadow-sm"
                      : "text-muted hover:text-foreground hover:bg-white/5 border border-transparent"
                  }
                `}
              >
                <Settings2 className="h-3.5 w-3.5 shrink-0" />
                <span>{t("admin.emails.templateSettings")}</span>
              </button>

              <button
                type="button"
                onClick={() => setMode("send")}
                className={`
                  flex items-center gap-1.5 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 text-xs font-semibold
                  transition-all duration-200 cursor-pointer select-none
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400
                  ${
                    mode === "send"
                      ? "bg-cyan-500/15 text-cyan-400 border border-cyan-400/30 shadow-sm"
                      : "text-muted hover:text-foreground hover:bg-white/5 border border-transparent"
                  }
                `}
              >
                <Send className="h-3.5 w-3.5 shrink-0" />
                <span>{t("admin.emails.sendCustom")}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </MetalCard>
  );
}
