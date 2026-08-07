"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { useTranslations } from "next-intl";
import { useUnreadCount } from "@/hooks/notification/useUnreadCount";
import { useNotificationSocket } from "@/hooks/notification/useNotificationSocket";
import useOutsideClick from "@/hooks/useOutsideClick";
import NotificationDropdown from "./NotificationDropdown";

export default function NotificationBell() {
  const t = useTranslations("header.notification");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useOutsideClick<HTMLDivElement>(() => setIsOpen(false));

  useNotificationSocket();

  const { data: unreadCount = 0 } = useUnreadCount();

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/10 backdrop-blur-lg text-white/70 transition-all duration-300 hover:bg-white/20 hover:text-white cursor-pointer"
        aria-label={t("label")}
        title={t("label")}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-400 px-1 text-[11px] font-bold text-slate-950 shadow-[0_0_10px_rgba(21,174,245,0.8)] animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && <NotificationDropdown />}
    </div>
  );
}
