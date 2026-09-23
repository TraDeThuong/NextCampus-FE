"use client";

import Image from "next/image";
import { CalendarDays, Mail, ShieldCheck, Camera, Loader2, Fingerprint } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslations, useLocale } from "next-intl";

import { useUploadAvatar } from "@/hooks/profile/useUploadAvatar";
import { exceedsUploadLimit, IMAGE_MIME_TYPES, UPLOAD_LIMITS_MB } from "@/lib/upload-policy";
import { MeUser } from "@/types/auth";

type ProfileHeaderProps = {
    profile: MeUser;
};

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
    const t = useTranslations("admin.profile");
    const locale = useLocale();

    const joinedDate = new Date(profile.createdAt).toLocaleDateString(
        locale === "vi" ? "vi-VN" : "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );

    const inputRef = useRef<HTMLInputElement>(null);
    const { uploadAvatarAsync, isPending } = useUploadAvatar();
    const [preview, setPreview] = useState<string | null>(null);

    const handleChooseFile = () => {
        inputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!IMAGE_MIME_TYPES.has(file.type)) {
            toast.error(t("avatarInvalidType"));
            return;
        }
        if (exceedsUploadLimit(file, UPLOAD_LIMITS_MB.avatar)) {
            toast.error(t("avatarTooLarge", { limit: UPLOAD_LIMITS_MB.avatar }));
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);
        try {
            await uploadAvatarAsync(file);
        } finally {
            setPreview(null);
            URL.revokeObjectURL(previewUrl);
        }
    };

    return (
        <section className="group relative overflow-hidden rounded-[32px] border border-border bg-card shadow-sm dark:border-white/10 dark:bg-[linear-gradient(145deg,#101827_0%,#1a2235_25%,#0f172a_60%,#050816_100%)] dark:shadow-[0_18px_60px_rgba(0,0,0,.45)]">
            <div className="absolute left-8 right-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 dark:via-white/90 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(21,174,245,.08),transparent_45%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(21,174,245,.16),transparent_45%)]" />
            <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(90deg,rgba(0,0,0,.02)_0px,rgba(0,0,0,.02)_1px,transparent_1px,transparent_3px)] dark:bg-[repeating-linear-gradient(90deg,rgba(255,255,255,.02)_0px,rgba(255,255,255,.02)_1px,transparent_1px,transparent_3px)]" />
            <div className="absolute -left-[40%] top-0 h-full w-[28%] -skew-x-[18deg] bg-white/10 blur-3xl opacity-0 transition-all duration-1000 group-hover:left-[130%] group-hover:opacity-100" />

            <div className="h-36 bg-gradient-to-r from-sky-400/20 via-cyan-400/15 to-blue-500/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800" />

            <div className="relative px-8 pb-8">
                <div className="-mt-16 sm:-mt-20 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                        <div className="relative shrink-0">
                            <div className="absolute inset-0 rounded-[32px] bg-cyan-400/20 blur-xl" />
                            <button
                                type="button"
                                onClick={handleChooseFile}
                                disabled={isPending}
                                className="group/avatar relative h-36 w-36 sm:h-40 sm:w-40 overflow-hidden rounded-[32px] border border-border bg-card shadow-md dark:border-white/15 dark:bg-gradient-to-br dark:from-slate-700 dark:to-slate-950 dark:shadow-[0_12px_40px_rgba(0,0,0,.45)] disabled:cursor-not-allowed"
                            >
                                {(preview || profile.avatarUrl) ? (
                                    <Image
                                        src={preview ?? profile.avatarUrl!}
                                        alt={profile.fullName}
                                        fill
                                        sizes="160px"
                                        className="object-cover transition group-hover/avatar:scale-110"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-6xl font-bold text-slate-500 dark:text-slate-300">
                                        {profile.fullName?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover/avatar:opacity-100">
                                    <Camera className="h-9 w-9 text-white" />
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover/avatar:opacity-0 pointer-events-none" />
                                {isPending && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                                        <Loader2 className="h-9 w-9 animate-spin text-white" />
                                    </div>
                                )}
                            </button>
                            <input
                                ref={inputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/webp,image/gif"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h1 className="text-4xl font-bold metal-text">
                                    {profile.fullName}
                                </h1>
                                <div className="mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                    <Mail className="h-4 w-4 text-cyan-600 dark:text-primary-light" />
                                    <span>{profile.email}</span>
                                </div>
                                <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
                                    <Fingerprint className="h-4 w-4 text-cyan-600 dark:text-primary-light" />
                                    <span>{profile.id}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700 dark:border-cyan-400/100 dark:bg-cyan-400/10 dark:text-primary-light backdrop-blur-xl">
                                    <ShieldCheck className="h-4 w-4" />
                                    {profile.role}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[24px] border border-border bg-slate-50/80 dark:border-white/10 dark:bg-white/[0.03] px-6 py-5 backdrop-blur-xl">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-300 bg-sky-100/80 text-sky-700 dark:border-white/10 dark:bg-white/5 dark:text-cyan-300">
                                <CalendarDays className="h-5 w-5 shrink-0" />
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                                    {t("joined")}
                                </p>
                                <p className="mt-1 text-lg font-semibold text-foreground dark:text-white">
                                    {joinedDate}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
