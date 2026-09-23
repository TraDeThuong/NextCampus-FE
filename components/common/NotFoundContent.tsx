"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import { useTranslations } from "next-intl";
import ThemeToggle from "@/components/theme/ThemeToggle";
import LanguageToggle from "@/components/layout/LanguageToggle";

export default function NotFoundContent() {
  const t = useTranslations("notFound");

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background text-foreground transition-colors duration-200 px-4 py-12 text-center">
      {/* Top action bar: Theme Toggle first, then Language Toggle */}
      <div className="absolute right-4 top-4 z-50 flex items-center gap-2 sm:right-6 sm:top-6">
        <ThemeToggle />
        <LanguageToggle />
      </div>

      <div className="w-full max-w-md space-y-6 rounded-3xl border border-border bg-card p-8 shadow-glass backdrop-blur-xl">
        <div className="space-y-2">
          <h1 className="text-7xl sm:text-8xl font-black tracking-tight text-primary-main dark:text-primary-light drop-shadow-sm">
            404
          </h1>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            {t("heading")}
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            {t("desc")}
          </p>
        </div>

        <div className="pt-2 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-main px-6 py-3 text-sm font-semibold text-white shadow-soft transition-all duration-200 hover:bg-primary-light hover:text-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light cursor-pointer"
          >
            <Home className="h-4 w-4" />
            <span>{t("backHome")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
