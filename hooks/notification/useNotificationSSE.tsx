"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/auth/useAuth";
import { notificationService } from "@/services/notification.service";

interface NotificationPayload {
  id?: string;
  title?: string;
  content?: string;
  type?: string;
  createdAt?: string;
  actionUrl?: string | null;
  [key: string]: unknown;
}

const EVENT_LABELS: Record<string, string> = {
  NOTIFICATION_NEW: "Thông báo mới",
  "notification:new": "Thông báo mới",
  "notification:broadcast": "Thông báo chung",
  TASK_ASSIGNED: "Công việc mới",
  SUBMISSION_REVIEWED: "Đánh giá bài nộp",
  REPORT_REMINDER: "Nhắc nhở báo cáo",
  DAILY_REPORT_REMINDER: "Nhắc nhở báo cáo",
};

export function useNotificationSSE() {
  const queryClient = useQueryClient();
  const { state } = useAuth();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

  useEffect(() => {
    let isMounted = true;
    const maxRetries = 8;

    const clearReconnectTimer = () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };

    const closeCurrentStream = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };

    const handleNotificationData = (eventType: string, payload: unknown) => {
      // Luôn làm mới cache React Query cho danh sách, unread-count và action-counts
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["action-counts"] });

      if (!payload || typeof payload !== "object") return;
      const notif = payload as NotificationPayload;

      // Không hiển thị Toast cho các sự kiện cập nhật trạng thái đọc hoặc connected
      if (
        eventType === "notification:read" ||
        eventType === "notification:read_all" ||
        eventType === "connected"
      ) {
        return;
      }

      const label = EVENT_LABELS[eventType] || "Thông báo mới";
      const title = notif.title || "Bạn có thông báo mới";
      const content = notif.content || "";

      toast.custom(
        (t) => (
          <div
            onClick={() => toast.dismiss(t.id)}
            className={`${
              t.visible
                ? "animate-in fade-in slide-in-from-top-5 duration-200"
                : "animate-out fade-out slide-out-to-top-5 duration-150"
            } max-w-sm w-full bg-white/95 dark:bg-[#0B1020]/95 border border-slate-200/90 dark:border-cyan-400/40 shadow-[0_10px_30px_rgba(15,23,42,0.08),0_2px_8px_rgba(15,23,42,0.04)] dark:shadow-[0_0_25px_rgba(21,174,245,0.35)] rounded-2xl p-4 backdrop-blur-xl cursor-pointer hover:border-primary-light/60 dark:hover:border-cyan-400 transition-all text-slate-900 dark:text-white`}
          >
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-pulse shrink-0" />
              <p className="text-xs font-bold metal-text tracking-wide uppercase">
                {label}
              </p>
            </div>
            <p className="mt-1.5 text-sm font-semibold text-slate-900 dark:text-white truncate">
              {title}
            </p>
            {content && (
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                {content}
              </p>
            )}
          </div>
        ),
        { duration: 5000 }
      );
    };

    const connect = async () => {
      clearReconnectTimer();

      if (!state.isAuthenticated || !isMounted) {
        closeCurrentStream();
        return;
      }

      try {
        // Bước 1: Gọi POST /api/v2/notifications/ticket lấy One-Time Ticket ngắn hạn (TTL 60s)
        const ticketRes = await notificationService.getTicket();
        if (!isMounted) return;

        if (!ticketRes?.success || !ticketRes?.ticket) {
          throw new Error("Không thể khởi tạo One-Time Ticket cho SSE stream");
        }

        const rawApiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:9999/api/v2";
        const baseUrl = rawApiUrl.replace(/\/$/, "");
        const streamUrl = `${baseUrl}/notifications/stream?ticket=${encodeURIComponent(
          ticketRes.ticket
        )}`;

        closeCurrentStream();

        // Bước 2: Khởi tạo kết nối SSE EventSource với One-Time Ticket
        const es = new EventSource(streamUrl);
        eventSourceRef.current = es;

        es.onopen = () => {
          retryCountRef.current = 0; // Reset retry counter on success
        };

        // Bước 3: Lắng nghe các sự kiện chuẩn
        const createEventListener = (eventName: string) => (e: MessageEvent) => {
          try {
            if (!e.data) return;
            const parsed =
              typeof e.data === "string" ? JSON.parse(e.data) : e.data;
            handleNotificationData(eventName, parsed);
          } catch (err) {
            console.warn(
              `[useNotificationSSE] Lỗi phân tích dữ liệu sự kiện ${eventName}:`,
              err
            );
          }
        };

        const eventTypes = [
          "NOTIFICATION_NEW",
          "TASK_ASSIGNED",
          "SUBMISSION_REVIEWED",
          "REPORT_REMINDER",
          "DAILY_REPORT_REMINDER",
          "notification:new",
          "notification:broadcast",
          "notification:read",
          "notification:read_all",
          "NOTIFICATION",
          "connected",
        ];

        eventTypes.forEach((evt) => {
          es.addEventListener(evt, createEventListener(evt));
        });

        // Lắng nghe fallback trên onmessage thông thường
        es.onmessage = (event) => {
          try {
            if (!event.data) return;
            const parsed =
              typeof event.data === "string" ? JSON.parse(event.data) : event.data;
            const eventType =
              (parsed as NotificationPayload)?.type || "NOTIFICATION_NEW";
            const payload = (parsed as { payload?: unknown })?.payload || parsed;
            handleNotificationData(eventType, payload);
          } catch (err) {
            console.warn("[useNotificationSSE] Lỗi phân tích tin nhắn fallback:", err);
          }
        };

        // Bước 4: Cơ chế Auto-Reconnect với Exponential Backoff khi gặp sự cố mạng
        es.onerror = () => {
          closeCurrentStream();

          if (!isMounted || !state.isAuthenticated) return;

          if (retryCountRef.current < maxRetries) {
            retryCountRef.current++;
            // Exponential backoff với jitter: min(1000 * 2^(retries-1), 30000) + random(0..500ms)
            const delay =
              Math.min(1000 * Math.pow(2, retryCountRef.current - 1), 30000) +
              Math.random() * 500;

            clearReconnectTimer();
            reconnectTimerRef.current = setTimeout(() => {
              if (isMounted && state.isAuthenticated) {
                connect();
              }
            }, delay);
          } else {
            console.warn(
              "[useNotificationSSE] Đã vượt quá số lần thử kết nối lại tối đa."
            );
          }
        };
      } catch {
        if (!isMounted || !state.isAuthenticated) return;

        if (retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          const delay =
            Math.min(1000 * Math.pow(2, retryCountRef.current - 1), 30000) +
            Math.random() * 500;

          clearReconnectTimer();
          reconnectTimerRef.current = setTimeout(() => {
            if (isMounted && state.isAuthenticated) {
              connect();
            }
          }, delay);
        }
      }
    };

    if (state.isAuthenticated) {
      connect();
    } else {
      closeCurrentStream();
      clearReconnectTimer();
    }

    const handleBeforeUnload = () => {
      closeCurrentStream();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      isMounted = false;
      window.removeEventListener("beforeunload", handleBeforeUnload);
      clearReconnectTimer();
      closeCurrentStream();
    };
  }, [state.isAuthenticated, queryClient]);
}
