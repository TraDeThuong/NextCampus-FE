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
    <MetalCard className={`p-4 sm:p-5 lg:p-6 h-full flex flex-col group/card ${href ? "cursor-pointer" : ""} ${className}`}>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.1em] sm:tracking-[0.16em] text-muted group-hover/card:text-primary-light transition-colors truncate">
                {title}
              </p>
              {href && (
                <span className="text-xs text-muted/40 group-hover/card:text-primary-light transition-all transform group-hover/card:translate-x-0.5">
                  ↗
                </span>
              )}
            </div>
            <h3 className="chrome-text mt-1.5 sm:mt-2 text-2xl sm:text-4xl lg:text-5xl font-bold leading-none tracking-tight truncate">
              {value}
            </h3>
            <div className="mt-2.5 sm:mt-3 h-[2px] w-10 sm:w-16 rounded-full bg-gradient-to-r from-primary-light/70 to-transparent" />
            {subtitle && (
              <p className="text-[11px] sm:text-xs text-muted/80 pt-1 line-clamp-1">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 text-primary-light backdrop-blur-md shadow-inner group-hover/card:border-primary-light/40 group-hover/card:bg-primary-light/10 transition-all duration-500 group-hover/card:rotate-6 group-hover/card:scale-110">
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
