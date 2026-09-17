import React, { type HTMLAttributes } from "react";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: "pulse" | "shimmer";
}

export default function Skeleton({
  className = "",
  variant = "pulse",
  ...props
}: SkeletonProps) {
  const baseClass = "rounded-lg bg-slate-200/80 dark:bg-white/5";
  const animationClass =
    variant === "shimmer"
      ? "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"
      : "animate-pulse";

  return (
    <div
      className={`${baseClass} ${animationClass} ${className}`}
      {...props}
    />
  );
}

function SkeletonText({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <Skeleton className={`h-4 w-full rounded-md ${className}`} {...props} />
  );
}

function SkeletonAvatar({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <Skeleton
      className={`h-10 w-10 rounded-full shrink-0 ${className}`}
      {...props}
    />
  );
}

function SkeletonButton({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <Skeleton
      className={`h-10 w-24 rounded-xl shrink-0 ${className}`}
      {...props}
    />
  );
}

function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-glass backdrop-blur-xl ${className}`}
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-1/3 mb-2 rounded-md" />
      <Skeleton className="h-7 w-1/2 mb-3 rounded-lg" />
      <Skeleton className="h-3 w-4/5 rounded-md" />
    </div>
  );
}

function SkeletonTable({
  rows = 5,
  columns = "2fr 1fr 1fr 1fr",
  className = "",
}: {
  rows?: number;
  columns?: string;
  className?: string;
}) {
  const colCount = columns.split(" ").length;

  return (
    <div
      className={`w-full rounded-3xl border border-border bg-card shadow-glass backdrop-blur-xl overflow-hidden ${className}`}
    >
      {/* Header */}
      <div
        style={{ gridTemplateColumns: columns }}
        className="grid items-center gap-x-4 md:gap-x-6 border-b border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.02)_100%)] px-4 md:px-6 py-4"
      >
        {Array.from({ length: colCount }).map((_, i) => (
          <Skeleton
            key={`th-skel-${i}`}
            className={`h-3.5 rounded-md ${
              i === 0 ? "w-2/3" : i % 2 === 0 ? "w-1/2" : "w-1/3"
            }`}
          />
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-white/5">
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={`tr-skel-${r}`}
            style={{ gridTemplateColumns: columns }}
            className="grid items-center gap-x-4 md:gap-x-6 px-4 md:px-6 py-4 animate-pulse"
          >
            {Array.from({ length: colCount }).map((_, c) => (
              <Skeleton
                key={`td-skel-${r}-${c}`}
                className={`h-4 rounded-md ${
                  c === 0 ? "w-3/4" : c % 2 === 0 ? "w-1/2" : "w-2/3"
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonDashboard() {
  return (
    <div className="space-y-6 w-full animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Table Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-28 rounded-xl" />
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
        </div>
        <SkeletonTable rows={6} />
      </div>
    </div>
  );
}

Skeleton.Text = SkeletonText;
Skeleton.Avatar = SkeletonAvatar;
Skeleton.Button = SkeletonButton;
Skeleton.Card = SkeletonCard;
Skeleton.Table = SkeletonTable;
Skeleton.Dashboard = SkeletonDashboard;
