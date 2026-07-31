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

    const connectStream = async () => {
      const token = getAccessToken();
      if (!token || !state.isAuthenticated || !isMounted) return;

      try {
        // 1. Obtain One-Time Ticket via secure API channel using Header Auth
        const response = await notificationService.getTicket();
        if (!response.success || !response.ticket || !isMounted) return;

        const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
        // Pass short-lived ticket instead of long-lived Access Token via URL
        const streamUrl = `${rawApiUrl.replace(/\/$/, "")}/notifications/stream?ticket=${encodeURIComponent(response.ticket)}`;

        eventSource = new EventSource(streamUrl);

        eventSource.onopen = () => {
          console.log("[NotificationStream] Connected to real-time channel");
          retryCount = 0; // reset retry counter
        };

        eventSource.onmessage = (event) => {
          try {
            if (!event.data) return;
            const parsed = JSON.parse(event.data);

            // Invalidate React Query cache (both list and unread-count) across all tabs
            queryClient.invalidateQueries({ queryKey: ["notifications"] });

            // Classify event type
            const type = parsed.type || (parsed.id ? "NOTIFICATION_NEW" : null);
            const payload = parsed.payload || (parsed.id ? parsed : null);

            if (type === "NOTIFICATION_NEW" && payload) {
              const notification = payload as Notification;
              // Show popup Toast
              toast.custom(
                (t) => (
                  <div
                    onClick={() => toast.dismiss(t.id)}
                    className={`${
                      t.visible ? "animate-in fade-in slide-in-from-top-5 duration-200" : "animate-out fade-out slide-out-to-top-5 duration-150"
                    } max-w-sm w-full bg-[#0B1020]/95 border border-cyan-400/40 shadow-[0_0_25px_rgba(21,174,245,0.35)] rounded-2xl p-4 backdrop-blur-xl cursor-pointer hover:border-cyan-400 transition-all text-white`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
                      <p className="text-xs font-bold metal-text tracking-wide uppercase">New Notification</p>
                    </div>
                    <p className="mt-1.5 text-sm font-semibold text-white truncate">{notification.title}</p>
                    <p className="mt-1 text-xs text-slate-300 line-clamp-2 leading-relaxed">{notification.content}</p>
                  </div>
                ),
                { duration: 5000 }
              );
            }
          } catch (err) {
            console.error("[NotificationStream] Error parsing message:", err);
          }
        };

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
            console.error("[NotificationStream] Max connection retries reached. Stopping stream.");
          }
        };
      } catch (err) {
        console.error("[NotificationStream] Failed to retrieve ticket or initialize stream:", err);
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
