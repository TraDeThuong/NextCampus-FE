"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Webhook, Loader2, Globe, Key, FileText } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useCreateWebhook } from "@/hooks/integration/useCreateWebhook";

interface CreateWebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMON_EVENTS = [
  { id: "*", label: "Tất cả sự kiện (*)" },
  { id: "job.completed", label: "Tác vụ hoàn tất (job.completed)" },
  { id: "job.failed", label: "Tác vụ thất bại (job.failed)" },
  { id: "system.ping", label: "Bản tin ping (system.ping)" },
  { id: "user.updated", label: "Người dùng cập nhật (user.updated)" },
];

export default function CreateWebhookModal({
  isOpen,
  onClose,
}: CreateWebhookModalProps) {
  const t = useTranslations("admin.settings.webhooks.modal");
  const [url, setUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>(["*"]);
  const [secret, setSecret] = useState("");
  const [description, setDescription] = useState("");

  const createMutation = useCreateWebhook({
    onSuccess: () => {
      onClose();
      setUrl("");
      setSelectedEvents(["*"]);
      setSecret("");
      setDescription("");
    },
  });

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

    createMutation.mutate({
      url: url.trim(),
      events: selectedEvents,
      secret: secret.trim() ? secret.trim() : undefined,
      description: description.trim() ? description.trim() : undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("createTitle")} size="md">
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
            autoFocus
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

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted flex items-center gap-1.5">
            <Key className="h-3.5 w-3.5" />
            {t("secretLabel")}
          </label>
          <Input
            type="text"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder={t("secretPlaceholder")}
            minLength={16}
          />
          <p className="text-[11px] text-muted">
            Nếu để trống, hệ thống sẽ tự động tạo một khóa ký HMAC SHA-256 an toàn.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            {t("descLabel")}
          </label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="VD: Webhook đồng bộ dữ liệu người dùng sang CRM nội bộ"
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
            disabled={!url.trim() || createMutation.isPending}
          >
            {createMutation.isPending ? (
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
