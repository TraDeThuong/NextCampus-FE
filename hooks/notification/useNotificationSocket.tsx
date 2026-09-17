"use client";

import { useNotificationSSE } from "./useNotificationSSE";

/**
 * @deprecated Sử dụng useNotificationSSE thay thế cho useNotificationSocket.
 */
export function useNotificationSocket() {
  return useNotificationSSE();
}

export default useNotificationSocket;
