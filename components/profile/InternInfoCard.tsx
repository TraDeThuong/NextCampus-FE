"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Building2, Briefcase, Phone, Calendar, Clock, Circle, User, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { useUpdateIntern } from "@/hooks/profile/useUpdateIntern";
import type { Intern } from "@/types/intern";
import MetalCard from "../ui/MetalCard";
import Button from "../ui/Button";

type InternInfoCardProps = { intern: Intern };
type FormValues = { phone: string; discordUsername: string };

export default function InternInfoCard({ intern }: InternInfoCardProps) {
    const t = useTranslations("intern.profile");
    const { mutate: updateIntern, isPending } = useUpdateIntern();

    const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<FormValues>({
        defaultValues: { phone: intern.phone, discordUsername: intern.discordUsername ?? "" },
    });

    useEffect(() => { reset({ phone: intern.phone, discordUsername: intern.discordUsername ?? "" }); }, [intern, reset]);

    const startDate = new Date(intern.startDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const endDate = new Date(intern.startDate); endDate.setMonth(endDate.getMonth() + intern.duration);
    const endDateStr = endDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

    const statusConfig: Record<string, { label: string; className: string; dotClass: string }> = {
        ACTIVE: { label: t("active"), className: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300", dotClass: "text-emerald-400" },
        COMPLETED: { label: t("completed"), className: "border-blue-400/20 bg-blue-500/10 text-blue-300", dotClass: "text-blue-400" },
        DROPPED: { label: t("dropped"), className: "border-red-400/20 bg-red-500/10 text-red-300", dotClass: "text-red-400" },
    };

    const status = statusConfig[intern.status] ?? { label: intern.status, className: "border-slate-400/20 bg-slate-500/10 text-slate-300", dotClass: "text-slate-400" };

    const onSubmit = async (data: FormValues) => { updateIntern({ phone: data.phone, discordUsername: data.discordUsername || null }); };

    return (
        <MetalCard>
            <section className="rounded-3xl border border-slate-200 p-6 shadow-sm">
                <div className="mb-6"><h2 className="text-xl font-semibold metal-text">{t("internshipInfo")}</h2><p className="mt-1 text-sm text-slate-500">{t("internshipInfoDesc")}</p></div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField label={t("phone")} icon={<Phone className="h-4 w-4" />} error={errors.phone?.message}>
                            <input type="text" {...register("phone", { required: t("phoneRequired"), minLength: { value: 9, message: t("phoneMinLength") } })} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400 text-white" />
                        </FormField>
                        <FormField label={t("discordUsername")} icon={<User className="h-4 w-4" />}>
                            <input type="text" {...register("discordUsername")} placeholder={t("discordPlaceholder")} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400 text-white placeholder:text-slate-600" />
                        </FormField>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <InfoField icon={Building2} label={t("department")} value={intern.department?.name ?? "—"} />
                        <InfoField icon={Briefcase} label={t("position")} value={intern.position?.name ?? "—"} />
                        <InfoField icon={Calendar} label={t("startDate")} value={startDate} />
                        <InfoField icon={Clock} label={t("duration")} value={t("durationMonths", { n: intern.duration, plural: intern.duration > 1 ? "s" : "" })} extra={endDateStr} extraLabel={t("estEnd")} />
                        <StatusField status={status} label={t("status")} />
                        {intern.leader && <InfoField icon={Briefcase} label={t("leader")} value={intern.leader.fullName ?? intern.leader.email} />}
                    </div>

                    {isDirty && (
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => reset()} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:border-white/20 hover:text-white">{t("cancel")}</button>
                            <Button type="submit" disabled={isPending} variant="glass">{isPending ? t("saving") : t("saveChanges")}</Button>
                        </div>
                    )}
                </form>
            </section>
        </MetalCard>
    );
}

type InfoFieldProps = { icon: LucideIcon; label: string; value: string; extra?: string; extraLabel?: string };
function InfoField({ icon: Icon, label, value, extra, extraLabel }: InfoFieldProps) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500"><Icon className="h-4 w-4" /><span>{label}</span></div>
            <p className="text-sm font-medium text-white">{value}</p>
            {extra && <p className="mt-1 text-xs text-slate-500">{extraLabel && `${extraLabel}: `}{extra}</p>}
        </div>
    );
}

type FormFieldProps = { label: string; icon: React.ReactNode; error?: string; children: React.ReactNode };
function FormField({ label, icon, error, children }: FormFieldProps) {
    return (
        <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">{icon}<span>{label}</span></label>
            {children}
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
    );
}

function StatusField({ status, label }: { status: { label: string; className: string; dotClass: string }; label: string }) {
    return (
        <div className="rounded-2xl border border-slate-200 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500"><Circle className="h-4 w-4" /><span>{label}</span></div>
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${status.className}`}><Circle className={`h-3 w-3 fill-current ${status.dotClass}`} />{status.label}</span>
        </div>
    );
}
