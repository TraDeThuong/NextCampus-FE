"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getAccessToken } from "@/lib/token";
import type { Notification } from "@/types/notification";
import { useAuth } from "@/hooks/auth/useAuth";
import { notificationService } from "@/services/notification.service";

export function useNotificationSocket() {
  const queryClient = useQueryClient();
  const { state } = useAuth();

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 5;

    const handleNotificationData = (type: string, payload: any) => {
      // Invalidate React Query cache (cả danh sách và unread-count) trên tất cả các Tab
      queryClient.invalidateQueries({ queryKey: ["notifications"] });

      if (
        (type === "NOTIFICATION_NEW" ||
          type === "notification:new" ||
          type === "notification:broadcast") &&
        payload
      ) {
        const notification = payload as Notification;
        // Hiển thị Toast nổi
        toast.custom(
          (t) => (
            <div
              onClick={() => toast.dismiss(t.id)}
              className={`${
                t.visible
                  ? "animate-in fade-in slide-in-from-top-5 duration-200"
                  : "animate-out fade-out slide-out-to-top-5 duration-150"
              } max-w-sm w-full bg-[#0B1020]/95 border border-cyan-400/40 shadow-[0_0_25px_rgba(21,174,245,0.35)] rounded-2xl p-4 backdrop-blur-xl cursor-pointer hover:border-cyan-400 transition-all text-white`}
            >
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <p className="text-xs font-bold metal-text tracking-wide uppercase">
                  {type === "notification:broadcast"
                    ? "Thông báo chung"
                    : "Thông báo mới"}
                </p>
              </div>
              <p className="mt-1.5 text-sm font-semibold text-white truncate">
                {notification.title}
              </p>
              <p className="mt-1 text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {notification.content}
              </p>
            </div>
          ),
          { duration: 5000 },
        );
      }
    };

    const connectStream = async () => {
      const token = getAccessToken();
      if (!token || !state.isAuthenticated || !isMounted) return;

      try {
        let ticket: string | null = null;
        try {
          // 1. Lấy One-Time Ticket qua kênh API an toàn bằng Header Auth
          const response = await notificationService.getTicket();
          if (response?.success && response?.ticket) {
            ticket = response.ticket;
          }
        } catch (err) {
          console.warn(
            "[NotificationStream] Failed to retrieve ticket, falling back to token parameter:",
            err,
          );
        }

        if (!isMounted) return;

        const rawApiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:9999/api/v2";
        const baseUrl = rawApiUrl.replace(/\/$/, "");

        // Ưu tiên One-Time Ticket ngắn hạn, fallback sang Token query parameter
        const streamUrl = ticket
          ? `${baseUrl}/notifications/stream?ticket=${encodeURIComponent(ticket)}`
          : `${baseUrl}/notifications/stream?token=${encodeURIComponent(token)}`;

        eventSource = new EventSource(streamUrl);

        eventSource.onopen = () => {
          console.log("[NotificationStream] Connected to real-time channel");
          retryCount = 0; // reset retry counter
        };

        // Lắng nghe sự kiện mặc định (message)
        eventSource.onmessage = (event) => {
          try {
            if (!event.data) return;
            const parsed = JSON.parse(event.data);
            const type =
              parsed.type || (parsed.id ? "NOTIFICATION_NEW" : "unknown");
            const payload = parsed.payload || (parsed.id ? parsed : null);
            handleNotificationData(type, payload);
          } catch (err) {
            console.error("[NotificationStream] Error parsing message:", err);
          }
        };

        // Lắng nghe các sự kiện theo tên chuẩn của v2 SSE Manager
        const onCustomEvent = (eventType: string) => (e: MessageEvent) => {
          try {
            if (!e.data) return;
            const parsed =
              typeof e.data === "string" ? JSON.parse(e.data) : e.data;
            handleNotificationData(eventType, parsed);
          } catch (err) {
            console.error(
              `[NotificationStream] Error parsing ${eventType} event:`,
              err,
            );
          }
        };

        eventSource.addEventListener(
          "notification:new",
          onCustomEvent("notification:new"),
        );
        eventSource.addEventListener(
          "notification:broadcast",
          onCustomEvent("notification:broadcast"),
        );
        eventSource.addEventListener(
          "notification:read",
          onCustomEvent("notification:read"),
        );
        eventSource.addEventListener(
          "notification:read_all",
          onCustomEvent("notification:read_all"),
        );

        eventSource.onerror = () => {
          console.warn("[NotificationStream] Connection error. Retrying...");
          if (eventSource) {
            eventSource.close();
          }

          if (retryCount < maxRetries) {
            retryCount++;
            const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
            setTimeout(() => {
              if (isMounted) connectStream();
            }, delay);
          } else {
            console.error(
              "[NotificationStream] Max connection retries reached. Stopping stream.",
            );
          }
        };
      } catch (err) {
        console.error(
          "[NotificationStream] Failed to initialize notification stream:",
          err,
        );
      }
    };

    connectStream();

    return () => {
      isMounted = false;
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [state.isAuthenticated, queryClient]);
}
