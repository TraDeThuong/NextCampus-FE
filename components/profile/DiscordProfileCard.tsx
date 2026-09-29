"use client";

import React, { useState } from "react";
import {
  Hash,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  X,
  Edit3,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-hot-toast";
import MetalCard from "@/components/ui/MetalCard";
import type { Intern } from "@/types/intern";

/** Inline Discord SVG icon (official "clyde" mark) */
function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 -28.5 256 256"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971523 75.7283628,183.341318 79.7352139,175.300148 C72.104019,172.400648 64.7949724,168.822208 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420996 176.223542,175.320496 C180.230393,183.341318 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911932,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z" />
    </svg>
  );
}

export interface DiscordProfileCardProps {
  intern?: Intern;
  discordUserId?: string | null;
  discordUsername?: string | null;
  roleName?: string;
  onUpdate: (data: {
    discordUserId?: string | null;
    discordUsername?: string | null;
  }) => Promise<void>;
  translationNamespace?: "admin.profile" | "leader.profile" | "intern.profile";
}

export default function DiscordProfileCard({
  intern,
  discordUserId: propDiscordUserId,
  discordUsername: propDiscordUsername,
  roleName,
  onUpdate,
  translationNamespace,
}: DiscordProfileCardProps) {
  const normalizedRole = roleName?.toUpperCase() || (intern ? "INTERN" : "ADMIN");
  const defaultNamespace =
    normalizedRole === "ADMIN"
      ? "admin.profile"
      : normalizedRole === "LEADER"
        ? "leader.profile"
        : "intern.profile";

  const t = useTranslations(translationNamespace || defaultNamespace);

  const activeUserId = (propDiscordUserId !== undefined ? propDiscordUserId : intern?.discordUserId) ?? "";
  const activeUsername = (propDiscordUsername !== undefined ? propDiscordUsername : intern?.discordUsername) ?? "";

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [inputUserId, setInputUserId] = useState(activeUserId);
  const [inputUsername, setInputUsername] = useState(activeUsername);
  const [errors, setErrors] = useState<{ discordUserId?: string }>({});

  const handleStartEdit = () => {
    setInputUserId(activeUserId);
    setInputUsername(activeUsername);
    setErrors({});
    setIsEditing(true);
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (inputUserId && !/^\d{17,20}$/.test(inputUserId.trim())) {
      newErrors.discordUserId = t("discordUserIdInvalid");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      await onUpdate({
        discordUserId: inputUserId.trim() || null,
        discordUsername: inputUsername.trim() || null,
      });
      toast.success(t("discordSaveSuccess"));
      setIsEditing(false);
    } catch {
      toast.error(t("discordSaveFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setInputUserId(activeUserId);
    setInputUsername(activeUsername);
    setErrors({});
    setIsEditing(false);
  };

  // Trạng thái phân quyền:
  // - Nếu là intern: theo dõi cờ discordRoleGranted do bot đồng bộ
  // - Nếu là admin hoặc leader: khi đã cung cấp Discord User ID sẽ được tự động đồng bộ vào các thread
  const roleGranted = intern ? Boolean(intern.discordRoleGranted) : Boolean(activeUserId);

  return (
    <MetalCard>
      <section className="rounded-3xl p-6">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-indigo-300 bg-indigo-100/80 text-indigo-600 dark:border-indigo-400/30 dark:bg-indigo-500/15 dark:text-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.2)]">
              <DiscordIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold metal-text">{t("discordSection")}</h2>
              <p className="text-xs text-muted">{t("discordSectionDesc")}</p>
            </div>
          </div>

          {/* Role Status Badge */}
          <div className="flex items-center gap-2 shrink-0">
            {roleGranted ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {t("discordRoleGranted")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-300">
                <AlertCircle className="h-3.5 w-3.5" />
                {t("discordRoleNotGranted")}
              </span>
            )}

            {!isEditing && (
              <button
                type="button"
                onClick={handleStartEdit}
                className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-500 hover:bg-indigo-500/20 dark:text-indigo-400 transition active:scale-95 cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5" />
                {t("discordEdit")}
              </button>
            )}
          </div>
        </div>

        {/* Display / Edit Mode */}
        {isEditing ? (
          <div className="space-y-4">
            {/* Discord User ID Input */}
            <div>
              <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-foreground/90 select-none">
                <Hash className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                {t("discordUserId")}
                <span className="text-muted">({t("discordUserIdHint")})</span>
              </label>
              <input
                type="text"
                value={inputUserId}
                onChange={(e) => setInputUserId(e.target.value)}
                placeholder={t("discordUserIdPlaceholder")}
                className={`
                  w-full rounded-xl border bg-card px-4 py-2.5 text-sm text-foreground
                  placeholder:text-muted/60 focus:outline-none focus:ring-2 transition-all
                  ${errors.discordUserId
                    ? "border-rose-400 focus:border-rose-400 focus:ring-rose-400/20"
                    : "border-border focus:border-indigo-400 focus:ring-indigo-400/20"
                  }
                `}
              />
              {errors.discordUserId && (
                <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {errors.discordUserId}
                </p>
              )}
            </div>

            {/* Discord Username Input */}
            <div>
              <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-foreground/90 select-none">
                <DiscordIcon className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                {t("discordUsername")}
              </label>
              <input
                type="text"
                value={inputUsername}
                onChange={(e) => setInputUsername(e.target.value)}
                placeholder={t("discordPlaceholder")}
                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 transition-all"
              />
              <p className="mt-1 text-xs text-muted">{t("discordUsernameHint")}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-card/80 transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:brightness-110 transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSaving ? t("saving") : t("saveChanges")}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {/* Discord User ID Display */}
            <div className="rounded-2xl border border-border bg-slate-50/80 dark:border-white/10 dark:bg-white/[0.03] p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted">
                <Hash className="h-4 w-4 shrink-0 text-cyan-500" />
                <span>{t("discordUserId")}</span>
              </div>
              {activeUserId ? (
                <p className="font-mono text-sm font-medium text-foreground truncate">
                  {activeUserId}
                </p>
              ) : (
                <p className="text-sm text-muted italic">{t("discordNotSet")}</p>
              )}
            </div>

            {/* Discord Username Display */}
            <div className="rounded-2xl border border-border bg-slate-50/80 dark:border-white/10 dark:bg-white/[0.03] p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted">
                <DiscordIcon className="h-4 w-4 shrink-0 text-indigo-400" />
                <span>{t("discordUsername")}</span>
              </div>
              {activeUsername ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 font-mono text-sm font-medium text-indigo-500 dark:text-indigo-400">
                    {activeUsername}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-muted italic">{t("discordNotSet")}</p>
              )}
            </div>

            {/* Discord Role Status */}
            <div className="rounded-2xl border border-border bg-slate-50/80 dark:border-white/10 dark:bg-white/[0.03] p-4 sm:col-span-2">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{t("discordRoleStatus")}</span>
              </div>
              <div className="flex items-center gap-2">
                {roleGranted ? (
                  <>
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-400/20 animate-pulse" />
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      {t("discordRoleGranted")}
                    </span>
                    <span className="text-xs text-muted">—</span>
                    <span className="text-xs text-muted">{t("discordRoleGrantedDesc")}</span>
                  </>
                ) : (
                  <>
                    <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-amber-400/20" />
                    <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                      {t("discordRoleNotGranted")}
                    </span>
                    <span className="text-xs text-muted">—</span>
                    <span className="text-xs text-muted">{t("discordRoleNotGrantedDesc")}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </MetalCard>
  );
}
