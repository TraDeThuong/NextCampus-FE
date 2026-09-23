"use client";

import { useLocale, useTranslations } from "next-intl";
import { useLocaleSwitcher } from "@/providers/LocaleProvider";

export default function LanguageToggle() {
  const t = useTranslations("header.language");
  const locale = useLocale();
  const { setLocale } = useLocaleSwitcher();

  const toggleLocale = () => {
    setLocale(locale === "vi" ? "en" : "vi");
  };

  return (
    <button
      type="button"
      onClick={toggleLocale}
      aria-label={t("toggle")}
      title={locale === "vi" ? t("switchToEn") : t("switchToVi")}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-100/80 text-slate-700 hover:bg-slate-200 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-white transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light"
    >
      <span className="text-base leading-none select-none transition-transform duration-200">
        {locale === "vi" ? "🇻🇳" : "🇺🇸"}
      </span>
    </button>
  );
}
