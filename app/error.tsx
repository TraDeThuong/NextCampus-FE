"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertOctagon, RotateCcw, Home } from "lucide-react";
import { useTranslations } from "next-intl";
import ThemeToggle from "@/components/theme/ThemeToggle";
import LanguageToggle from "@/components/layout/LanguageToggle";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  useEffect(() => {
    console.error("[Unhandled App Error]:", error);
  }, [error]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      {/* Top action bar: Theme Toggle first, then Language Toggle */}
      <div className="absolute right-4 top-4 z-50 flex items-center gap-2 sm:right-6 sm:top-6">
        <ThemeToggle />
        <LanguageToggle />
      </div>

      <div className="w-full max-w-md space-y-6 rounded-3xl border border-border bg-card p-8 shadow-glass backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 border border-red-300 text-red-600 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400">
          <AlertOctagon className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">{t("title")}</h1>
          <p className="text-sm text-muted">
            {t("desc")}
          </p>
          {error.digest && (
            <p className="font-mono text-xs text-muted">
              Error Digest: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-main px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-light hover:text-white cursor-pointer active:scale-95"
          >
            <RotateCcw className="h-4 w-4" />
            {t("retry")}
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-slate-100 hover:text-foreground dark:hover:bg-white/10 cursor-pointer active:scale-95"
          >
            <Home className="h-4 w-4" />
            {t("backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
