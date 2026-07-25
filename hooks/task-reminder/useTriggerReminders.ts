"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { taskReminderService } from "@/services/task-reminder.service";

export function useTriggerReminders() {
  return useMutation({
    mutationFn: () => taskReminderService.triggerTaskReminders(),

    onSuccess: () => {
      toast.success("Task reminders sent successfully.");
    },

    onError: () => {
      toast.error("Failed to send task reminders.");
    },
  });
}
