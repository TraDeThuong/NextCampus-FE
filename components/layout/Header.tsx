"use client";

import { createPortal } from "react-dom";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { LogOut, User, Menu } from "lucide-react";
import { useAuth } from "@/hooks/auth/useAuth";
import { useLogout } from "@/hooks/auth/useLogout";
import { useTranslations, useLocale } from "next-intl";
import { useLocaleSwitcher } from "@/providers/LocaleProvider";
import Spinner from "../ui/Spinner";
import NotificationBell from "../notification/NotificationBell";

type HeaderProps = {
  role: string;
  onMenuClick?: () => void;
};

export default function Header({ role, onMenuClick }: HeaderProps) {
    const t = useTranslations();
    const locale = useLocale();
    const { setLocale } = useLocaleSwitcher();
    const { state } = useAuth();
    const { logoutMutate, isLoading } = useLogout();

    const handleLogout = () => {
        logoutMutate();
    };

    const toggleLanguage = () => {
      setLocale(locale === "vi" ? "en" : "vi");
    };

  return (
    <>
      {/* FULL PAGE SPINNER: Shown while logging out */}
      {typeof document !== "undefined" && isLoading && createPortal(
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md">
          <Spinner size="lg" />
          <p className="mt-4 text-white/80 text-sm font-medium tracking-wide animate-pulse">
            {t("header.loggingOut")}
          </p>
        </div>,
        document.body
      )}

      <header className="sticky top-0 z-20 h-20 border-b border-white/10 bg-white/5 backdrop-blur-xl px-4 md:px-8 flex items-center justify-between">
        {/* Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white cursor-pointer transition-colors"
            aria-label="Menu"
          >
            <Menu size={20} />
          </button>
          <h2 className="text-base sm:text-xl metal-text font-semibold tracking-wide truncate">
            {role} {t("header.dashboard")}
          </h2>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3 md:gap-6">
          {/* Language Switch */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition cursor-pointer"
          >
            <span className="text-2xl">
              {locale === "vi" ? "🇻🇳" : "🇺🇸"}
            </span>
            <span className="hidden sm:inline">
              {locale === "vi" ? "VN" : "EN"}
            </span>
          </button>

          {/* Notification Bell */}
          <NotificationBell />

          {/* Profile */}
          <Link
            href={`/${role.toLowerCase()}/profile`}
            className="flex items-center gap-2 sm:gap-3 rounded-full border border-white/10 bg-white/5 p-1 sm:px-3 sm:py-2 backdrop-blur-lg transition hover:bg-white/10 cursor-pointer"
          >
            {state.user?.avatarUrl ? (
              <Image
                src={state.user.avatarUrl}
                alt={state.user.fullName ?? "User"}
                width={40}
                height={40}
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-linear-to-br from-primary-main to-primary-light">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
            )}
            <p
              className="hidden sm:block text-sm sm:text-lg font-medium metal-text"
              style={{ fontFamily: "var(--font-body-vi), sans-serif" }}
            >
              {state.user?.fullName ?? "User"}
            </p>
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="
                flex items-center justify-center
                w-11 h-11 rounded-xl
                border border-white/10
                bg-white/10
                backdrop-blur-lg
                text-white/70
                transition-all duration-300
                hover:bg-red-500/20
                hover:text-red-400
                cursor-pointer
            "
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>
    </>
  );
}
