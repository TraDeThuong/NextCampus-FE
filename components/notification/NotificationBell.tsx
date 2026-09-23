"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { useTranslations } from "next-intl";
import { useUnreadCount } from "@/hooks/notification/useUnreadCount";
import { useNotificationSSE } from "@/hooks/notification/useNotificationSSE";
import useOutsideClick from "@/hooks/useOutsideClick";
import NotificationDropdown from "./NotificationDropdown";

export default function NotificationBell() {
  const t = useTranslations("header.notification");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useOutsideClick<HTMLDivElement>(() => setIsOpen(false));

  useNotificationSSE();

  const { data: unreadCount = 0 } = useUnreadCount();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-100/80 text-slate-700 hover:bg-slate-200 hover:text-slate-900 dark:border-white/10 dark:bg-white/10 dark:text-white/70 dark:hover:bg-white/20 dark:hover:text-white backdrop-blur-lg transition-all duration-300 cursor-pointer"
        aria-label={t("label")}
        title={t("label")}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-500 text-white dark:bg-cyan-400 dark:text-slate-950 px-1 text-[11px] font-bold shadow-sm dark:shadow-[0_0_10px_rgba(21,174,245,0.8)] animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && <NotificationDropdown onClose={() => setIsOpen(false)} />}
    </div>
  );
}
