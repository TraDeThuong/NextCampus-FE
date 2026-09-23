"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { User, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { useUpdateProfile } from "@/hooks/profile/useUpdateProfile";
import { MeUser } from "@/types/auth";
import MetalCard from "../ui/MetalCard";
import Button from "../ui/Button";

type ProfileInfoCardProps = {
    profile: MeUser;
};

type FormValues = {
    fullName: string;
};

export default function ProfileInfoCard({ profile }: ProfileInfoCardProps) {
    const t = useTranslations("profile");
    const { updateProfileAsync, isPending } = useUpdateProfile();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm<FormValues>({
        defaultValues: { fullName: profile.fullName },
    });

    useEffect(() => {
        reset({ fullName: profile.fullName });
    }, [profile, reset]);

    const onSubmit = async (data: FormValues) => {
        await updateProfileAsync({ fullName: data.fullName });
    };

    return (
        <MetalCard>
            <section className="rounded-3xl border border-border p-6 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold metal-text">
                        {t("personalInfo")}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t("personalInfoDesc")}
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Full Name */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs sm:text-sm font-medium text-foreground/90 select-none flex items-center gap-1">
                            <User className="h-4 w-4 shrink-0" />
                            {t("fullName")}
                        </label>
                        <input
                            type="text"
                            {...register("fullName", {
                                required: t("fullNameRequired"),
                                minLength: {
                                    value: 2,
                                    message: t("fullNameMinLength"),
                                },
                            })}
                            className={`
                                h-[42px] sm:h-[46px] w-full rounded-xl border
                                bg-card text-foreground text-sm
                                px-4 py-2.5 sm:py-3
                                outline-none transition-all duration-200
                                ${errors.fullName
                                    ? "border-danger focus-visible:border-danger focus-visible:ring-2 focus-visible:ring-danger/40"
                                    : "border-border hover:border-border-strong focus-visible:border-primary-light/50 focus-visible:ring-2 focus-visible:ring-primary-light"
                                }
                            `}
                        />
                        {errors.fullName && (
                            <p className="text-xs text-danger flex items-center gap-1.5 mt-0.5 animate-fadeIn">
                                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                {errors.fullName.message}
                            </p>
                        )}
                    </div>

                    {isDirty && (
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => reset()}
                                className="flex items-center gap-2 rounded-xl border border-border bg-slate-100 dark:border-white/10 dark:bg-white/5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 transition hover:bg-slate-200 dark:hover:bg-white/10 hover:text-foreground dark:hover:text-white active:scale-95"
                            >
                                {t("cancel")}
                            </button>
                            <Button type="submit" disabled={isPending} variant="glass">
                                {isPending ? t("saving") : t("saveChanges")}
                            </Button>
                        </div>
                    )}
                </form>
            </section>
        </MetalCard>
    );
}
