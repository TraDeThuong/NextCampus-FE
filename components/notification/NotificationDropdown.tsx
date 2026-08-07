"use client";

import { useState } from "react";
import { ArrowLeft, Check, BellOff, Info, AlertTriangle, CheckCircle2, ShieldAlert, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useNotifications } from "@/hooks/notification/useNotifications";
import { useMarkAsRead } from "@/hooks/notification/useMarkAsRead";
import { useMarkAllAsRead } from "@/hooks/notification/useMarkAllAsRead";
import { useDeleteNotification } from "@/hooks/notification/useDeleteNotification";
import { useClearReadNotifications } from "@/hooks/notification/useClearReadNotifications";
import type { Notification } from "@/types/notification";
import Spinner from "@/components/ui/Spinner";

export default function NotificationDropdown() {
  const t = useTranslations("header.notification");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const { data, isLoading } = useNotifications({ limit: 10, sortBy: "createdAt", order: "desc" });
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();
  const { mutate: deleteNotification } = useDeleteNotification();
  const { mutate: clearReadNotifications } = useClearReadNotifications();

  const notifications = data?.data ?? [];
  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const readNotifications = notifications.filter((n) => n.isRead);

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  const handleClearRead = () => {
    clearReadNotifications();
  };

  const handleDeleteItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Ngăn mở/đánh dấu đọc khi click vào nút xóa
    deleteNotification(id);
  };

  const handleOpenNotification = (item: Notification) => {
    if (!item.isRead) markAsRead(item.id);
    setSelectedNotification(item);
  };

  const getIconForType = (type: string) => {
    switch (type.toUpperCase()) {
      case "SYSTEM":
        return <Info className="h-4 w-4 text-cyan-400" />;
      case "REGULATION":
      case "POLICY":
        return <ShieldAlert className="h-4 w-4 text-amber-400" />;
      case "TASK":
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-blue-400" />;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(locale, {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-white/10 bg-[#0B1020]/95 p-4 text-white shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          {selectedNotification ? (
            <>
              <button
                onClick={() => setSelectedNotification(null)}
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
                aria-label={t("back")}
                title={t("back")}
              >
                <ArrowLeft size={16} />
              </button>
              <h3 className="font-semibold metal-text tracking-wide text-sm uppercase">{t("details")}</h3>
            </>
          ) : (
            <>
              <h3 className="font-semibold metal-text tracking-wide text-sm uppercase">{t("title")}</h3>
              {unreadNotifications.length > 0 && (
                <span className="rounded-full bg-cyan-400/20 px-2 py-0.5 text-xs font-medium text-cyan-300 border border-cyan-400/30">
                  {t("newCount", { count: unreadNotifications.length })}
                </span>
              )}
            </>
          )}
        </div>

        {!selectedNotification && <div className="flex items-center gap-3">
          {unreadNotifications.length > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
              title={t("markAllReadTitle")}
            >
              <Check size={14} />
              <span>{t("markAllRead")}</span>
            </button>
          )}

          {readNotifications.length > 0 && (
            <button
              onClick={handleClearRead}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
              title={t("clearReadTitle")}
            >
              <Trash2 size={13} />
              <span>{t("clearRead")}</span>
            </button>
          )}
        </div>}
      </div>

      {/* Content */}
      <div className="mt-2 max-h-80 overflow-y-auto divide-y divide-white/5 pr-1 scrollbar-thin scrollbar-thumb-white/10">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Spinner size="sm" />
          </div>
        ) : selectedNotification ? (
          <div className="p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="rounded-lg bg-white/5 p-2 border border-white/10 shrink-0">
                {getIconForType(selectedNotification.type)}
              </div>
              <span className="text-[10px] text-slate-400">
                {formatTime(selectedNotification.createdAt)}
              </span>
            </div>
            <h4 className="mt-3 break-words text-sm font-semibold leading-relaxed text-white">
              {selectedNotification.title}
            </h4>
            <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-relaxed text-slate-300">
              {selectedNotification.content}
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex h-36 flex-col items-center justify-center gap-2 text-slate-400 text-xs">
            <BellOff className="h-8 w-8 text-slate-600" />
            <p>{t("empty")}</p>
          </div>
        ) : (
          notifications.map((item: Notification) => (
            <div
              key={item.id}
              onClick={() => handleOpenNotification(item)}
              onKeyDown={(event) => {
                if (event.target !== event.currentTarget) return;
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleOpenNotification(item);
                }
              }}
              role="button"
              tabIndex={0}
              className={`group relative flex items-start gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                item.isRead
                  ? "bg-transparent hover:bg-white/5 opacity-70"
                  : "bg-white/5 hover:bg-white/10 border-l-2 border-cyan-400"
              }`}
            >
              <div className="mt-0.5 rounded-lg bg-white/5 p-2 border border-white/10 shrink-0">
                {getIconForType(item.type)}
              </div>

              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-xs font-semibold truncate ${item.isRead ? "text-slate-300" : "text-white"}`}>
                    {item.title}
                  </p>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {formatTime(item.createdAt)}
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {item.content}
                </p>
                <span className="mt-1.5 inline-block text-[10px] font-medium text-cyan-300/80 group-hover:text-cyan-300">
                  {tCommon("viewDetails")}
                </span>
              </div>

              {/* Action buttons on hover */}
              <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1 bg-[#0B1020] p-1 rounded-lg border border-white/10 shadow-lg">
                <button
                  onClick={(e) => handleDeleteItem(e, item.id)}
                  className="text-slate-400 hover:text-red-400 transition-colors p-1 cursor-pointer"
                  title={t("deleteTitle")}
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {!item.isRead && (
                <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(21,174,245,0.8)] shrink-0 mt-1 group-hover:hidden" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
