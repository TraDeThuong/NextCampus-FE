"use client";

import React, { useState } from "react";
import { Send, Loader2, Tag, Hash } from "lucide-react";
import { SiDiscord } from "react-icons/si";
import { useTranslations } from "next-intl";
import { toast } from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import type { Department } from "@/types/department";
import type {
  DiscordWebhookConfig,
  DiscordWebhookScope,
  DiscordWebhookPurpose,
  CreateDiscordWebhookPayload,
} from "@/types/discord";
import {
  useCreateDiscordWebhook,
  useUpdateDiscordWebhook,
  useTestDiscordWebhook,
} from "@/hooks/discord";

const DISCORD_WEBHOOK_REGEX =
  /^https:\/\/(ptb\.|canary\.)?discord\.com\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+$/;

interface DiscordWebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingWebhook: DiscordWebhookConfig | null;
  departments: Department[];
  defaultDepartmentId?: string;
  defaultPurpose?: DiscordWebhookPurpose;
  defaultScope?: DiscordWebhookScope;
}

interface DiscordWebhookFormProps {
  onClose: () => void;
  editingWebhook: DiscordWebhookConfig | null;
  departments: Department[];
  defaultDepartmentId?: string;
  defaultPurpose?: DiscordWebhookPurpose;
  defaultScope?: DiscordWebhookScope;
}

function DiscordWebhookFormContent({
  onClose,
  editingWebhook,
  departments,
  defaultDepartmentId,
  defaultPurpose,
  defaultScope,
}: DiscordWebhookFormProps) {
  const t = useTranslations("discord");
  const createMutation = useCreateDiscordWebhook();
  const updateMutation = useUpdateDiscordWebhook();
  const testMutation = useTestDiscordWebhook();

  const [scope, setScope] = useState<DiscordWebhookScope>(() => {
    if (editingWebhook) return editingWebhook.scope;
    return defaultScope || (defaultDepartmentId ? "DEPARTMENT" : "GLOBAL");
  });

  const [departmentId, setDepartmentId] = useState<string>(() => {
    if (editingWebhook) return editingWebhook.departmentId || "";
    return defaultDepartmentId || "";
  });

  const [purpose, setPurpose] = useState<DiscordWebhookPurpose>(() => {
    if (editingWebhook) return editingWebhook.purpose;
    return defaultPurpose || "DAILY_STANDUP";
  });

  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [threadId, setThreadId] = useState<string>(() => {
    if (editingWebhook) return editingWebhook.threadId || "";
    return "";
  });
  const [discordRoleId, setDiscordRoleId] = useState<string>(() => {
    if (editingWebhook) return editingWebhook.discordRoleId || "";
    return "";
  });

  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    if (editingWebhook) return editingWebhook.isEnabled;
    return true;
  });

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPreTesting, setIsPreTesting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!editingWebhook && !webhookUrl.trim()) {
      newErrors.webhookUrl = t("validation.urlRequired");
    } else if (webhookUrl.trim() && !DISCORD_WEBHOOK_REGEX.test(webhookUrl.trim())) {
      newErrors.webhookUrl = t("validation.invalidUrl");
    }

    if (scope === "DEPARTMENT" && !departmentId) {
      newErrors.departmentId = t("validation.departmentRequired");
    }

    if (!purpose) {
      newErrors.purpose = t("validation.purposeRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePreSaveTest = async () => {
    if (!webhookUrl.trim()) {
      setErrors((prev) => ({
        ...prev,
        webhookUrl: t("validation.preTestUrlRequired"),
      }));
      return;
    }

    if (!DISCORD_WEBHOOK_REGEX.test(webhookUrl.trim())) {
      setErrors((prev) => ({
        ...prev,
        webhookUrl: t("validation.invalidUrl"),
      }));
      return;
    }

    try {
      setIsPreTesting(true);
      const res = await testMutation.mutateAsync({
        webhookUrl: webhookUrl.trim(),
      });
      if (res.success) {
        toast.success(
          t("toasts.testSuccess", { ms: res.data?.responseTimeMs ?? 150 })
        );
      } else {
        toast.error(
          t("toasts.testFailed", { message: res.message || "Error" })
        );
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error";
      toast.error(t("toasts.connectionError", { message: errorMsg }));
    } finally {
      setIsPreTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (editingWebhook) {
        await updateMutation.mutateAsync({
          id: editingWebhook.id,
          payload: {
            webhookUrl: webhookUrl.trim() || undefined,
            threadId: threadId.trim() || null,
            discordRoleId: discordRoleId.trim() || null,
            isEnabled,
            scope,
            departmentId: scope === "DEPARTMENT" ? departmentId : null,
            purpose,
          },
        });
        toast.success(t("toasts.updateSuccess"));
      } else {
        const payload: CreateDiscordWebhookPayload = {
          webhookUrl: webhookUrl.trim(),
          threadId: threadId.trim() || undefined,
          discordRoleId: discordRoleId.trim() || undefined,
          isEnabled,
          scope,
          departmentId: scope === "DEPARTMENT" ? departmentId : undefined,
          purpose,
        };
        await createMutation.mutateAsync(payload);
        toast.success(t("toasts.createSuccess"));
      }
      onClose();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Error";
      toast.error(errorMsg);
    }
  };

  const scopeOptions = [
    { value: "GLOBAL", label: t("modal.scopeGlobal") },
    { value: "DEPARTMENT", label: t("modal.scopeDepartment") },
  ];

  const purposeOptions = [
    { value: "DAILY_STANDUP", label: t("modal.purposeStandup") },
    { value: "TASK_BOARD", label: t("modal.purposeTaskBoard") },
    { value: "MEETING_ROOM", label: t("modal.purposeMeetingRoom") },
    { value: "LEADERBOARD", label: t("modal.purposeLeaderboard") },
    { value: "LEADER_ALERTS", label: t("modal.purposeLeaderAlerts") },
  ];

  const departmentOptions = departments.map((d) => ({
    value: d.id,
    label: d.name,
  }));

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Scope Selection */}
      <div>
        <Select
          label={t("modal.scopeLabel")}
          options={scopeOptions}
          value={scope}
          onChange={(val) => setScope(val as DiscordWebhookScope)}
          required
        />
      </div>

      {/* Department Selection (if DEPARTMENT scope) */}
      {scope === "DEPARTMENT" && (
        <div>
          <Select
            label={t("modal.departmentLabel")}
            options={departmentOptions}
            value={departmentId}
            onChange={(val) => setDepartmentId(val)}
            placeholder={t("modal.selectDepartment")}
            error={errors.departmentId}
            searchable
            required
          />
        </div>
      )}

      {/* Channel Purpose Selection */}
      <div>
        <Select
          label={t("modal.purposeLabel")}
          options={purposeOptions}
          value={purpose}
          onChange={(val) => setPurpose(val as DiscordWebhookPurpose)}
          placeholder={t("modal.selectPurpose")}
          error={errors.purpose}
          required
        />
      </div>

      {/* Webhook URL Input */}
      <div className="space-y-1.5">
        <Input
          label={t("modal.webhookUrlLabel")}
          type="text"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          placeholder={
            editingWebhook
              ? "••••••••••••"
              : t("modal.webhookUrlPlaceholder")
          }
          error={errors.webhookUrl}
          helperText={t("modal.webhookUrlHelp")}
          required={!editingWebhook}
          leftIcon={<SiDiscord className="h-4 w-4 text-indigo-400" />}
        />

        {/* Inline Test Ping Button */}
        {webhookUrl.trim() && (
          <div className="flex justify-end">
            <button
              type="button"
              disabled={isPreTesting}
              onClick={handlePreSaveTest}
              className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium transition cursor-pointer"
            >
              {isPreTesting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              <span>{t("modal.testBeforeSave")}</span>
            </button>
          </div>
        )}
      </div>

      {/* Discord Thread ID Input (Optional) */}
      <div>
        <Input
          label={t("modal.threadIdLabel")}
          type="text"
          value={threadId}
          onChange={(e) => setThreadId(e.target.value)}
          placeholder={t("modal.threadIdPlaceholder")}
          helperText={t("modal.threadIdHelp")}
          leftIcon={<Hash className="h-4 w-4 text-cyan-400" />}
        />
      </div>

      {/* Discord Role ID Input (Optional) */}
      <div>
        <Input
          label={t("modal.roleIdLabel")}
          type="text"
          value={discordRoleId}
          onChange={(e) => setDiscordRoleId(e.target.value)}
          placeholder={t("modal.roleIdPlaceholder")}
          helperText={t("modal.roleIdHelp")}
          leftIcon={<Tag className="h-4 w-4 text-muted" />}
        />
      </div>

      {/* Is Enabled Toggle */}
      <div className="flex items-center gap-3 pt-2">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => setIsEnabled(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
        </label>
        <span className="text-sm font-medium text-foreground">
          {t("modal.isEnabledLabel")}
        </span>
      </div>

      {/* Modal Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={onClose}
          disabled={isSaving}
          className="h-[42px] sm:h-[46px] px-5 rounded-xl border border-border bg-card hover:bg-card/80 text-sm font-medium text-foreground transition active:scale-95 cursor-pointer disabled:opacity-50"
        >
          {t("modal.cancelButton")}
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="
            inline-flex items-center justify-center gap-2 h-[42px] sm:h-[46px] px-5 rounded-xl text-sm font-semibold
            bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white
            hover:brightness-110 active:scale-95 transition-all
            shadow-[0_0_20px_rgba(99,102,241,0.3)]
            disabled:opacity-50 disabled:pointer-events-none cursor-pointer
          "
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t("modal.savingButton")}</span>
            </>
          ) : (
            <span>{t("modal.saveButton")}</span>
          )}
        </button>
      </div>
    </form>
  );
}

export default function DiscordWebhookModal({
  isOpen,
  onClose,
  editingWebhook,
  departments,
  defaultDepartmentId,
  defaultPurpose,
  defaultScope,
}: DiscordWebhookModalProps) {
  const t = useTranslations("discord");

  if (!isOpen) return null;

  const formKey = editingWebhook
    ? `edit-${editingWebhook.id}`
    : `create-${defaultDepartmentId || "global"}-${defaultPurpose || "any"}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingWebhook ? t("modal.editTitle") : t("modal.addTitle")}
      size="md"
    >
      <DiscordWebhookFormContent
        key={formKey}
        onClose={onClose}
        editingWebhook={editingWebhook}
        departments={departments}
        defaultDepartmentId={defaultDepartmentId}
        defaultPurpose={defaultPurpose}
        defaultScope={defaultScope}
      />
    </Modal>
  );
}
