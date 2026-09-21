"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Webhook, Loader2, Globe, Key, FileText, Check } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useUpdateWebhook } from "@/hooks/integration/useUpdateWebhook";
import type { WebhookItem } from "@/types/integration";

interface EditWebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  webhook: WebhookItem | null;
}

const COMMON_EVENTS = [
  { id: "*", label: "Tất cả sự kiện (*)" },
  { id: "job.completed", label: "Tác vụ hoàn tất (job.completed)" },
  { id: "job.failed", label: "Tác vụ thất bại (job.failed)" },
  { id: "system.ping", label: "Bản tin ping (system.ping)" },
  { id: "user.updated", label: "Người dùng cập nhật (user.updated)" },
];

export default function EditWebhookModal({
  isOpen,
  onClose,
  webhook,
}: EditWebhookModalProps) {
  const t = useTranslations("admin.settings.webhooks.modal");
  const [url, setUrl] = useState(webhook?.url || "");
  const [selectedEvents, setSelectedEvents] = useState<string[]>(
    Array.isArray(webhook?.events) && webhook.events.length > 0
      ? webhook.events
      : ["*"]
  );
  const [isActive, setIsActive] = useState(webhook?.isActive ?? true);
  const [secret, setSecret] = useState("");
  const [description, setDescription] = useState(webhook?.description || "");

  const updateMutation = useUpdateWebhook({
    onSuccess: () => {
      onClose();
    },
  });

  if (!webhook) return null;

  const toggleEvent = (eventId: string) => {
    if (eventId === "*") {
      setSelectedEvents(["*"]);
      return;
    }

    let next = selectedEvents.filter((e) => e !== "*");
    if (next.includes(eventId)) {
      next = next.filter((e) => e !== eventId);
    } else {
      next.push(eventId);
    }

    if (next.length === 0) {
      next = ["*"];
    }
    setSelectedEvents(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    updateMutation.mutate({
      id: webhook.id,
      payload: {
        url: url.trim(),
        events: selectedEvents,
        isActive,
        secret: secret.trim() ? secret.trim() : undefined,
        description: description.trim() ? description.trim() : undefined,
      },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("editTitle")} size="md">
      <form onSubmit={handleSubmit} className="space-y-4 px-1 py-1">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5" />
            {t("urlLabel")} <span className="text-red-400">*</span>
          </label>
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t("urlPlaceholder")}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted">
            {t("eventsLabel")}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_EVENTS.map((ev) => {
              const isChecked = selectedEvents.includes(ev.id);
              return (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => toggleEvent(ev.id)}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    isChecked
                      ? "border-primary-light bg-primary-light/15 text-foreground shadow-sm"
                      : "border-border/40 bg-card/40 text-muted hover:border-border-strong hover:text-foreground"
                  }`}
                >
                  {ev.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-card/40">
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`h-5 w-5 rounded border flex items-center justify-center transition-colors ${
              isActive
                ? "bg-emerald-500 border-emerald-500 text-white"
                : "border-border bg-card text-transparent"
            }`}
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <label
            onClick={() => setIsActive(!isActive)}
            className="text-xs font-medium text-foreground cursor-pointer select-none"
          >
            Kích hoạt nhận bản tin từ endpoint này
          </label>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted flex items-center gap-1.5">
            <Key className="h-3.5 w-3.5" />
            {t("secretLabel")}
          </label>
          <Input
            type="text"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Để trống nếu không muốn thay đổi khóa bí mật hiện tại"
            minLength={16}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            {t("descLabel")}
          </label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả bổ sung"
          />
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-border/40">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!url.trim() || updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
            ) : (
              <Webhook className="h-4 w-4 mr-1.5" />
            )}
            {t("submit")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
