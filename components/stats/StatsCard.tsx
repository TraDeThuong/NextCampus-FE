"use client";

import { ReactNode } from "react";
import Link from "next/link";
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
  const content = (
    <MetalCard className={`p-6 ${href ? "cursor-pointer group/card" : ""} ${className}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted group-hover/card:text-primary-light transition-colors">
              {title}
            </p>
            {href && (
              <span className="text-xs text-muted/40 group-hover/card:text-primary-light transition-all transform group-hover/card:translate-x-0.5">
                ↗
              </span>
            )}
          </div>
          <h3 className="text-3xl font-extrabold text-foreground metal-text tracking-tight">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-muted/80 pt-0.5">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-primary-light backdrop-blur-md shadow-inner group-hover/card:border-primary-light/40 group-hover/card:bg-primary-light/10 transition-all">
            {icon}
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-4 flex items-center justify-between gap-1.5 text-xs font-medium">
          <span
            className={`inline-flex items-center justify-center gap-1.5 rounded-full px-2.5 py-1 leading-none ${
              trend.positive
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
            }`}
          >
            {trend.text}
          </span>
          {href && (
            <span className="text-[11px] text-muted opacity-0 group-hover/card:opacity-100 transition-opacity font-normal">
              View details
            </span>
          )}
        </div>
      )}
    </MetalCard>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }

  if (onCardClick) {
    return <button type="button" onClick={onCardClick} className="block w-full text-left">{content}</button>;
  }

  return content;
}
