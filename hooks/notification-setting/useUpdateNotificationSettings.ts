"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { notificationSettingService } from "@/services/notification-setting.service";
import type { UpdateNotificationSettingPayload } from "@/types/notification-setting";
import { useTranslations } from "next-intl";

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();
  const t = useTranslations("header.notification");

  return useMutation({
    mutationFn: (payload: UpdateNotificationSettingPayload) =>
      notificationSettingService.updateSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-settings"] });
      toast.success(t("settingsSaved") || "Đã lưu cài đặt thông báo thành công");
    },
    onError: (err: unknown) => {
      console.error(err);
      toast.error(t("settingsSaveError") || "Không thể lưu cài đặt thông báo");
    },
  });
}
