"use client";

import Link from "next/link";
import { Check, BellOff, Info, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { useNotifications } from "@/hooks/notification/useNotifications";
import { useMarkAsRead } from "@/hooks/notification/useMarkAsRead";
import { useMarkAllAsRead } from "@/hooks/notification/useMarkAllAsRead";
import type { Notification } from "@/types/notification";
import Spinner from "@/components/ui/Spinner";

type NotificationDropdownProps = {
  onClose?: () => void;
};

export default function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const { data, isLoading } = useNotifications({ limit: 10, sortBy: "createdAt", order: "desc" });
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();

  const notifications = data?.data ?? [];
  const unreadNotifications = notifications.filter((n) => !n.isRead);

  const handleMarkAllRead = () => {
    markAllAsRead();
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
      return date.toLocaleDateString("vi-VN", {
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
          <h3 className="font-semibold metal-text tracking-wide text-sm">THÔNG BÁO</h3>
          {unreadNotifications.length > 0 && (
            <span className="rounded-full bg-cyan-400/20 px-2 py-0.5 text-xs font-medium text-cyan-300 border border-cyan-400/30">
              {unreadNotifications.length} mới
            </span>
          )}
        </div>

        {unreadNotifications.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
            title="Đánh dấu tất cả là đã đọc"
          >
            <Check size={14} />
            <span>Đã đọc tất cả</span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="mt-2 max-h-80 overflow-y-auto divide-y divide-white/5 pr-1 scrollbar-thin scrollbar-thumb-white/10">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Spinner size="sm" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex h-36 flex-col items-center justify-center gap-2 text-slate-400 text-xs">
            <BellOff className="h-8 w-8 text-slate-600" />
            <p>Không có thông báo nào</p>
          </div>
        ) : (
          notifications.map((item: Notification) => (
            <div
              key={item.id}
              onClick={() => {
                if (!item.isRead) markAsRead(item.id);
                if (onClose) onClose();
              }}
              className={`group flex items-start gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                item.isRead
                  ? "bg-transparent hover:bg-white/5 opacity-70"
                  : "bg-white/5 hover:bg-white/10 border-l-2 border-cyan-400"
              }`}
            >
              <div className="mt-0.5 rounded-lg bg-white/5 p-2 border border-white/10">
                {getIconForType(item.type)}
              </div>

              <div className="flex-1 min-w-0">
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
              </div>

              {!item.isRead && (
                <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(21,174,245,0.8)] shrink-0 mt-1" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
