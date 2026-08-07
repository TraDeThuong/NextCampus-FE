"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Briefcase, Building2, Phone, type LucideIcon } from "lucide-react";
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

    const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<FormValues>({
        defaultValues: { phone: leader.phone ?? "" },
    });

    useEffect(() => { reset({ phone: leader.phone ?? "" }); }, [leader, reset]);

    const onSubmit = (data: FormValues) => {
        updateLeader({ phone: data.phone.trim() || null });
    };

    return (
        <MetalCard>
            <section className="rounded-3xl border border-slate-200 p-6 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold metal-text">{t("leaderInfo")}</h2>
                    <p className="mt-1 text-sm text-slate-500">{t("leaderInfoDesc")}</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                            <Phone className="h-4 w-4" /><span>{t("phone")}</span>
                        </label>
                        <input type="tel" {...register("phone", { validate: (value) => !value.trim() || VIETNAMESE_PHONE_PATTERN.test(value.trim()) || t("invalidPhone") })}
                            placeholder={t("phonePlaceholder")} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-slate-400" />
                        {errors.phone && <p className="mt-2 text-sm text-red-500">{errors.phone.message}</p>}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <InfoField icon={Building2} label={t("departments")} value={leader.departments.map((d) => d.name).join(", ") || t("notSet")} />
                        <InfoField icon={Briefcase} label={t("position")} value={leader.position ?? t("notSet")} />
                    </div>

                    {isDirty && (
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => reset()} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:border-white/20 hover:text-white">
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
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500"><Icon className="h-4 w-4" /><span>{label}</span></div>
            <p className="text-sm font-medium text-white">{value}</p>
        </div>
    );
}
