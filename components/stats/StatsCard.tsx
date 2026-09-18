"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import MetalCard from "../ui/MetalCard";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    text: string;
    positive?: boolean;
  };
  href?: string;
  badgeColor?: string;
  className?: string;
  onCardClick?: () => void;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  href,
  className = "",
  onCardClick,
}: StatsCardProps) {
  const t = useTranslations();
  const content = (
    <MetalCard className={`p-4 sm:p-6 h-full flex flex-col ${href ? "cursor-pointer group/card" : ""} ${className}`}>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted group-hover/card:text-primary-light transition-colors truncate">
                {title}
              </p>
              {href && (
                <span className="text-xs text-muted/40 group-hover/card:text-primary-light transition-all transform group-hover/card:translate-x-0.5">
                  ↗
                </span>
              )}
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground metal-text tracking-tight truncate">
              {value}
            </h3>
            {subtitle && (
              <p className="text-[11px] sm:text-xs text-muted/80 pt-0.5 line-clamp-1">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 text-primary-light backdrop-blur-md shadow-inner group-hover/card:border-primary-light/40 group-hover/card:bg-primary-light/10 transition-all">
              {icon}
            </div>
          )}
        </div>
      </div>

      {trend && (
        <div className="mt-3 sm:mt-4 flex items-center justify-between gap-1.5 text-xs font-medium">
          <span
            className={`inline-flex items-center justify-center gap-1.5 rounded-full px-2.5 py-1 leading-none ${
              trend.positive
                ? "bg-emerald-50 text-emerald-700 border-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                : "bg-amber-50 text-amber-700 border-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
            }`}
          >
            {trend.text}
          </span>
          {href && (
            <span className="text-[11px] text-muted opacity-0 group-hover/card:opacity-100 transition-opacity font-normal">
              {t("common.viewDetails")}
            </span>
          )}
        </div>
      )}
    </MetalCard>
  );

  if (href) {
    return <Link href={href} className="block h-full">{content}</Link>;
  }

  if (onCardClick) {
    return <button type="button" onClick={onCardClick} className="block w-full h-full text-left">{content}</button>;
  }

  return content;
}
