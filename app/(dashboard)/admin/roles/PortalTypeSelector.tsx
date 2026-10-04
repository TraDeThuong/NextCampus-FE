"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { ShieldCheck, Briefcase, GraduationCap, CheckCircle2 } from "lucide-react";
import type { PortalType } from "@/types/rbac";

interface PortalTypeSelectorProps {
  value: PortalType;
  onChange: (value: PortalType) => void;
  disabled?: boolean;
}

interface PortalOptionConfig {
  type: PortalType;
  icon: React.ComponentType<{ className?: string }>;
  titleKey: string;
  descKey: string;
  theme: {
    selectedBorder: string;
    selectedBg: string;
    selectedText: string;
    selectedRing: string;
    iconBg: string;
    radioActiveColor: string;
    badgeColor: string;
  };
}

const PORTAL_OPTIONS: PortalOptionConfig[] = [
  {
    type: "ADMIN",
    icon: ShieldCheck,
    titleKey: "admin.roles.createModal.portalTypeAdmin",
    descKey: "admin.roles.createModal.portalTypeAdminDesc",
    theme: {
      selectedBorder: "border-cyan-500 dark:border-cyan-400",
      selectedBg: "bg-cyan-50/80 dark:bg-cyan-500/10",
      selectedText: "text-cyan-900 dark:text-cyan-200",
      selectedRing: "ring-2 ring-cyan-500/40 dark:ring-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.18)]",
      iconBg: "border-cyan-200 bg-cyan-100 text-cyan-700 dark:border-cyan-500/30 dark:bg-cyan-500/20 dark:text-cyan-300",
      radioActiveColor: "bg-cyan-500 border-cyan-500 dark:bg-cyan-400 dark:border-cyan-400",
      badgeColor: "bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300 border-cyan-200 dark:border-cyan-400/30",
    },
  },
  {
    type: "LEADER",
    icon: Briefcase,
    titleKey: "admin.roles.createModal.portalTypeLeader",
    descKey: "admin.roles.createModal.portalTypeLeaderDesc",
    theme: {
      selectedBorder: "border-indigo-500 dark:border-indigo-400",
      selectedBg: "bg-indigo-50/80 dark:bg-indigo-500/10",
      selectedText: "text-indigo-900 dark:text-indigo-200",
      selectedRing: "ring-2 ring-indigo-500/40 dark:ring-indigo-400/40 shadow-[0_0_20px_rgba(99,102,241,0.18)]",
      iconBg: "border-indigo-200 bg-indigo-100 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/20 dark:text-indigo-300",
      radioActiveColor: "bg-indigo-500 border-indigo-500 dark:bg-indigo-400 dark:border-indigo-400",
      badgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300 border-indigo-200 dark:border-indigo-400/30",
    },
  },
  {
    type: "INTERN",
    icon: GraduationCap,
    titleKey: "admin.roles.createModal.portalTypeIntern",
    descKey: "admin.roles.createModal.portalTypeInternDesc",
    theme: {
      selectedBorder: "border-emerald-500 dark:border-emerald-400",
      selectedBg: "bg-emerald-50/80 dark:bg-emerald-500/10",
      selectedText: "text-emerald-900 dark:text-emerald-200",
      selectedRing: "ring-2 ring-emerald-500/40 dark:ring-emerald-400/40 shadow-[0_0_20px_rgba(16,185,129,0.18)]",
      iconBg: "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-300",
      radioActiveColor: "bg-emerald-500 border-emerald-500 dark:bg-emerald-400 dark:border-emerald-400",
      badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-400/30",
    },
  },
];

export default function PortalTypeSelector({
  value,
  onChange,
  disabled = false,
}: PortalTypeSelectorProps) {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-0.5">
        <label className="text-xs sm:text-sm font-medium text-foreground/90 select-none flex items-center gap-1">
          {t("admin.roles.createModal.portalTypeLabel")}{" "}
          <span className="text-danger font-bold">*</span>
        </label>
        <p className="text-xs text-muted-foreground">
          {t("admin.roles.createModal.portalTypeDesc")}
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label={t("admin.roles.createModal.portalTypeLabel")}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1"
      >
        {PORTAL_OPTIONS.map((option) => {
          const isSelected = value === option.type;
          const Icon = option.icon;

          return (
            <div
              key={option.type}
              role="radio"
              aria-checked={isSelected}
              tabIndex={disabled ? -1 : 0}
              onClick={() => {
                if (!disabled) {
                  onChange(option.type);
                }
              }}
              onKeyDown={(e) => {
                if (!disabled && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onChange(option.type);
                }
              }}
              className={`
                group relative flex flex-col justify-between p-3.5 rounded-2xl border
                transition-all duration-200 select-none
                ${
                  disabled
                    ? "opacity-60 cursor-not-allowed bg-muted/20 border-border"
                    : "cursor-pointer hover:-translate-y-0.5 hover:shadow-md"
                }
                ${
                  isSelected
                    ? `${option.theme.selectedBorder} ${option.theme.selectedBg} ${option.theme.selectedRing}`
                    : "border-border bg-card/70 hover:border-border-strong hover:bg-card"
                }
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background
              `}
            >
              {/* Header: Icon & Radio Status */}
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div
                  className={`
                    flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border
                    transition-all duration-200
                    ${option.theme.iconBg}
                    ${isSelected ? "scale-105 shadow-sm" : "group-hover:scale-105"}
                  `}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                </div>

                {/* Custom Radio Circle */}
                <div
                  className={`
                    flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2
                    transition-all duration-200
                    ${
                      isSelected
                        ? option.theme.radioActiveColor
                        : "border-border/80 bg-background group-hover:border-muted-foreground"
                    }
                  `}
                >
                  {isSelected && (
                    <CheckCircle2 className="h-4 w-4 text-white shrink-0 fill-current" />
                  )}
                </div>
              </div>

              {/* Body: Title & Description */}
              <div className="flex flex-col gap-1">
                <span
                  className={`
                    text-sm font-bold transition-colors line-clamp-1
                    ${
                      isSelected
                        ? option.theme.selectedText
                        : "text-foreground group-hover:text-foreground"
                    }
                  `}
                >
                  {t(option.titleKey)}
                </span>
                <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
                  {t(option.descKey)}
                </p>
              </div>

              {/* Portal Tag Badge */}
              <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/80">
                  {option.type}
                </span>
                <span
                  className={`
                    text-[10px] font-semibold px-2 py-0.5 rounded-md border
                    ${isSelected ? option.theme.badgeColor : "bg-muted/40 text-muted-foreground border-transparent"}
                  `}
                >
                  /{option.type.toLowerCase()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
