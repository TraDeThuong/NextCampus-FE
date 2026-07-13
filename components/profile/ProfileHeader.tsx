"use client";

import Image from "next/image";
import {
    CalendarDays,
    Mail,
    ShieldCheck,
    Circle,
} from "lucide-react";

import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { useUploadAvatar } from "@/hooks/profile/useUploadAvatar";
import MetalCard from "../ui/MetalCard";
import { MeUser } from "@/types/auth";

type ProfileHeaderProps = {
    profile: MeUser;
};

export default function ProfileHeader({
    profile,
}: ProfileHeaderProps) {
    const joinedDate = new Date(
        profile.createdAt,
    ).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

    const inputRef = useRef<HTMLInputElement>(null);

    const { uploadAvatarAsync, isPending } = useUploadAvatar();

    const [preview, setPreview] = useState<string | null>(null);

    const handleChooseFile = () => {
        inputRef.current?.click();
    };

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];

        if (!file) return;
        if (!file.type.startsWith("image/")) return;
        if (file.size > 50 * 1024 * 1024) return;

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
        <section className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(145deg,#101827_0%,#1a2235_25%,#0f172a_60%,#050816_100%)] shadow-[0_18px_60px_rgba(0,0,0,.45)]">
            {/* Top chrome line */}

            <div className="absolute left-8 right-8 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />

            {/* Blue glow */}

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(21,174,245,.16),transparent_45%)]" />

            {/* Metal texture */}

            <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,.02)_0px,rgba(255,255,255,.02)_1px,transparent_1px,transparent_3px)]" />

            {/* Reflection */}

            <div className="absolute -left-[40%] top-0 h-full w-[28%] -skew-x-[18deg] bg-white/10 blur-3xl opacity-0 transition-all duration-1000 group-hover:left-[130%] group-hover:opacity-100" />

            {/* Cover */}

            <div className="h-36 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800" />

            <div className="relative px-8 pb-8">
                <div className="-mt-16 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                    {/* Left */}

                    <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
                        {/* Avatar — click to upload */}
                        <div className="relative">
                            <div className="absolute inset-0 rounded-[28px] bg-cyan-400/20 blur-xl" />

                            <button
                                type="button"
                                onClick={handleChooseFile}
                                disabled={isPending}
                                className="group/avatar relative h-32 w-32 overflow-hidden rounded-[28px] border border-white/15 bg-gradient-to-br from-slate-700 to-slate-950 shadow-[0_12px_40px_rgba(0,0,0,.45)] disabled:cursor-not-allowed"
                            >
                                {(preview || profile.avatarUrl) ? (
                                    <Image
                                        src={preview ?? profile.avatarUrl!}
                                        alt={profile.fullName}
                                        fill
                                        className="object-cover transition group-hover/avatar:scale-110"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-5xl font-bold text-slate-300">
                                        {profile.fullName?.charAt(0).toUpperCase()}
                                    </div>
                                )}

                                {/* Upload overlay on hover */}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover/avatar:opacity-100">
                                    <Camera className="h-8 w-8 text-white" />
                                </div>

                                {/* Loading overlay */}
                                {isPending && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                                        <Loader2 className="h-8 w-8 animate-spin text-white" />
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

                        {/* User info */}

                        <div className="space-y-4">
                            <div>
                                <h1 className="text-4xl font-bold metal-text">
                                    {profile.fullName}
                                </h1>

                                <div className="mt-3 flex items-center gap-2 text-sm text-slate-300">
                                    <Mail className="h-4 w-4 text-primary-light" />

                                    <span>{profile.email}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {/* Role */}

                                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/100 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-primary-light backdrop-blur-xl">
                                    <ShieldCheck className="h-4 w-4" />

                                    {profile.role}
                                </span>

                                {/* Status */}

                                <span
                                    className={`
                                        inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium backdrop-blur-xl

                                        ${
                                            profile.isActive
                                                ? "border border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                                                : "border border-red-400/20 bg-red-500/10 text-red-300"
                                        }
                                    `}
                                >
                                    <Circle className="h-3 w-3 fill-current" />

                                    {profile.isActive
                                        ? "Active"
                                        : "Inactive"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Joined card */}

                    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] px-6 py-5 backdrop-blur-xl">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                                <CalendarDays className="h-5 w-5 text-cyan-300" />
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                                    Joined
                                </p>

                                <p className="mt-1 text-lg font-semibold text-white">
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