"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { AlertCircle, Briefcase, Building2, Phone, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { useUpdateLeader } from "@/hooks/profile/useUpdateLeader";
import type { Leader } from "@/types/leader";
import Button from "../ui/Button";
import MetalCard from "../ui/MetalCard";

type LeaderInfoCardProps = { leader: Leader };
type FormValues = { phone: string };

const VIETNAMESE_PHONE_PATTERN = /^(0|\+84|84)(3|5|7|8|9)[0-9]{8}$/;

export default function LeaderInfoCard({ leader }: LeaderInfoCardProps) {
    const t = useTranslations("leader.profile");
    const { mutate: updateLeader, isPending } = useUpdateLeader();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm<FormValues>({
        defaultValues: { phone: leader.phone ?? "" },
    });

    useEffect(() => {
        reset({ phone: leader.phone ?? "" });
    }, [leader, reset]);

    const onSubmit = (data: FormValues) => {
        updateLeader({ phone: data.phone.trim() || null });
    };

    return (
        <MetalCard>
            <section className="rounded-3xl border border-border p-6 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold metal-text">
                        {t("leaderInfo")}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t("leaderInfoDesc")}
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Phone Number */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs sm:text-sm font-medium text-foreground/90 select-none flex items-center gap-1">
                            <Phone className="h-4 w-4 shrink-0" />
                            {t("phone")}
                        </label>
                        <input
                            type="tel"
                            {...register("phone", {
                                validate: (value) =>
                                    !value.trim() ||
                                    VIETNAMESE_PHONE_PATTERN.test(value.trim()) ||
                                    t("invalidPhone"),
                            })}
                            placeholder={t("phonePlaceholder")}
                            className={`
                                h-[42px] sm:h-[46px] w-full rounded-xl border
                                bg-card text-foreground text-sm
                                px-4 py-2.5 sm:py-3
                                outline-none transition-all duration-200
                                placeholder:text-muted-foreground
                                ${errors.phone
                                    ? "border-danger focus-visible:border-danger focus-visible:ring-2 focus-visible:ring-danger/40"
                                    : "border-border hover:border-border-strong focus-visible:border-primary-light/50 focus-visible:ring-2 focus-visible:ring-primary-light"
                                }
                            `}
                        />
                        {errors.phone && (
                            <p className="text-xs text-danger flex items-center gap-1.5 mt-0.5 animate-fadeIn">
                                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                {errors.phone.message}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <InfoField
                            icon={Building2}
                            label={t("departments")}
                            value={leader.departments.map((d) => d.name).join(", ") || t("notSet")}
                        />
                        <InfoField
                            icon={Briefcase}
                            label={t("position")}
                            value={leader.position ?? t("notSet")}
                        />
                    </div>

                    {isDirty && (
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => reset()}
                                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:border-white/20 hover:text-white active:scale-95"
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

type InfoFieldProps = { icon: LucideIcon; label: string; value: string };

function InfoField({ icon: Icon, label, value }: InfoFieldProps) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-2 flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground">
                <Icon className="h-4 w-4 shrink-0" />
                <span>{label}</span>
            </div>
            <p className="text-sm font-medium text-foreground truncate">{value}</p>
        </div>
    );
}
