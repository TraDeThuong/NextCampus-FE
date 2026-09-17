import React, { type HTMLAttributes, type ReactNode } from "react";

export type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "purple"
  | "glass"
  | "outline";

export type BadgeSize = "sm" | "md";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  pulse?: boolean;
  children: ReactNode;
}

export default function Badge({
  children,
  variant = "default",
  size = "md",
  dot = false,
  pulse = false,
  className = "",
  ...props
}: BadgeProps) {
  const sizeStyles: Record<BadgeSize, string> = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
  };

  const variantStyles: Record<BadgeVariant, string> = {
    default:
      "bg-white/10 text-slate-300 border border-white/10 dark:bg-white/5 dark:text-slate-300",
    primary:
      "bg-primary-main/20 text-primary-light border border-primary-light/30 shadow-[0_0_10px_rgba(21,174,245,0.15)]",
    success:
      "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]",
    warning:
      "bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]",
    danger:
      "bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.15)]",
    info: "bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-[0_0_10px_rgba(14,165,233,0.15)]",
    purple:
      "bg-purple-500/15 text-purple-400 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.15)]",
    glass:
      "bg-card text-foreground border border-border backdrop-blur-md shadow-glass",
    outline: "bg-transparent border border-border text-muted",
  };

  const dotColors: Record<BadgeVariant, string> = {
    default: "bg-slate-400",
    primary: "bg-primary-light",
    success: "bg-emerald-400",
    warning: "bg-amber-400",
    danger: "bg-rose-400",
    info: "bg-sky-400",
    purple: "bg-purple-400",
    glass: "bg-foreground",
    outline: "bg-muted",
  };

  return (
    <span
      className={`
        inline-flex items-center justify-center font-medium
        rounded-full border backdrop-blur-sm select-none
        transition-colors duration-200
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColors[variant]} ${
            pulse ? "animate-pulse" : ""
          }`}
        />
      )}
      {children}
    </span>
  );
}

/**
 * Utility helper mapping common task / system statuses to Badge variants
 */
export function getStatusBadgeVariant(status: string): BadgeVariant {
  const s = status?.toUpperCase();
  switch (s) {
    case "DONE":
    case "COMPLETED":
    case "ACTIVE":
    case "APPROVED":
    case "PASSED":
      return "success";
    case "IN_PROGRESS":
    case "PENDING":
    case "REVIEW":
    case "EVALUATING":
      return "primary";
    case "TODO":
    case "DRAFT":
    case "UPCOMING":
      return "default";
    case "BLOCKED":
    case "REJECTED":
    case "CANCELLED":
    case "FAILED":
      return "danger";
    case "OVERDUE":
    case "WARNING":
    case "LATE":
      return "warning";
    default:
      return "default";
  }
}
