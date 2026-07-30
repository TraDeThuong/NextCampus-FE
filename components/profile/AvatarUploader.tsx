"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Upload, Loader2 } from "lucide-react";

import { useUploadAvatar } from "@/hooks/profile/useUploadAvatar";
import { MeUser } from "@/types/auth";
import MetalCard from "../ui/MetalCard";

type AvatarUploaderProps = {
    profile: MeUser;
};

export default function AvatarUploader({
    profile,
}: AvatarUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const { uploadAvatar, isPending } = useUploadAvatar();

    const [preview, setPreview] = useState<string | null>(
        profile.avatarUrl ?? null,
    );

    const handleChooseFile = () => {
        inputRef.current?.click();
    };

    const handleFileChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            return;
        }

        if (file.size > 50 * 1024 * 1024) {
            return;
        }

        const previewUrl = URL.createObjectURL(file);

        setPreview(previewUrl);

        uploadAvatar(file);
    };

    const avatarLetter = profile.fullName
        ?.charAt(0)
        .toUpperCase();

    return (
        <MetalCard>
            <section className="rounded-3xl border border-slate-200 p-6 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold metal-text">
                        Profile Picture
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Upload a new avatar for your account.
                    </p>
                </div>

                <div className="flex flex-col items-center">
                    <div className="relative">
                        <div className="relative h-40 w-40 overflow-hidden rounded-full border-4 border-slate-100 bg-slate-100 shadow-md">
                            {preview ? (
                                <Image
                                    src={preview}
                                    alt={profile.fullName}
                                    fill
                                    sizes="160px"
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-5xl font-bold text-slate-500">
                                    {avatarLetter}
                                </div>
                            )}

                            {isPending && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={handleChooseFile}
                            disabled={isPending}
                            className="absolute bottom-2 right-2 flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Camera className="h-5 w-5" />
                        </button>
                    </div>

                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    <button
                        type="button"
                        onClick={handleChooseFile}
                        disabled={isPending}
                        className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Upload className="h-4 w-4" />

                        {isPending
                            ? "Uploading..."
                            : "Choose image"}
                    </button>

                    <p className="mt-4 text-center text-xs text-slate-500">
                        PNG, JPG, WEBP or GIF.
                        <br />
                        Maximum size: 50 MB.
                    </p>
                </div>
            </section>
        </MetalCard>
    );
}