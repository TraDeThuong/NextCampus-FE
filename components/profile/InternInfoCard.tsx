"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
    Building2,
    Briefcase,
    Phone,
    Calendar,
    Clock,
    Circle,
    Pencil,
    X,
    Check,
    type LucideIcon,
    User,
} from "lucide-react";

import { useUpdateIntern } from "@/hooks/profile/useUpdateIntern";
import type { Intern } from "@/types/intern";
import MetalCard from "../ui/MetalCard";
import Button from "../ui/Button";

type InternInfoCardProps = {
    intern: Intern;
};

type FormValues = {
    phone: string;
    discordUsername: string;
};

export default function InternInfoCard({ intern }: InternInfoCardProps) {
    const [editing, setEditing] = useState(false);
    const { mutate: updateIntern, isPending } = useUpdateIntern();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm<FormValues>({
        defaultValues: {
            phone: intern.phone,
            discordUsername: intern.discordUsername ?? "",
        },
    });

    useEffect(() => {
        reset({
            phone: intern.phone,
            discordUsername: intern.discordUsername ?? "",
        });
    }, [intern, reset]);

    const startDate = new Date(intern.startDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

    const endDate = new Date(intern.startDate);
    endDate.setMonth(endDate.getMonth() + intern.duration);
    const endDateStr = endDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

    const statusConfig: Record<
        string,
        { label: string; className: string; dotClass: string }
    > = {
        ACTIVE: {
            label: "Active",
            className: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
            dotClass: "text-emerald-400",
        },
        COMPLETED: {
            label: "Completed",
            className: "border-blue-400/20 bg-blue-500/10 text-blue-300",
            dotClass: "text-blue-400",
        },
        DROPPED: {
            label: "Dropped",
            className: "border-red-400/20 bg-red-500/10 text-red-300",
            dotClass: "text-red-400",
        },
    };

    const status = statusConfig[intern.status] ?? {
        label: intern.status,
        className: "border-slate-400/20 bg-slate-500/10 text-slate-300",
        dotClass: "text-slate-400",
    };

    const onSubmit = async (data: FormValues) => {
        updateIntern({
            phone: data.phone,
            discordUsername: data.discordUsername || null,
        });
    };

    return (
        <MetalCard>
            <section className="rounded-3xl border border-slate-200 p-6 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold metal-text">
                        Internship Information
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Update your internship information.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                            label="Phone"
                            icon={<Phone className="h-4 w-4" />}
                            error={errors.phone?.message}
                        >
                            <input
                                type="text"
                                {...register("phone", {
                                    required: "Phone is required",
                                    minLength: {
                                        value: 9,
                                        message: "Phone must be at least 9 digits",
                                    },
                                })}
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400 text-white"
                            />
                        </FormField>

                        <FormField
                            label="Discord Username"
                            icon={<User className="h-4 w-4" />}
                        >
                            <input
                                type="text"
                                {...register("discordUsername")}
                                placeholder="username#0000"
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400 text-white placeholder:text-slate-600"
                            />
                        </FormField>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <InfoField
                            icon={Building2}
                            label="Department"
                            value={intern.department?.name ?? "—"}
                        />

                        <InfoField
                            icon={Briefcase}
                            label="Position"
                            value={intern.position?.name ?? "—"}
                        />

                        <InfoField
                            icon={Calendar}
                            label="Start Date"
                            value={startDate}
                        />

                        <InfoField
                            icon={Clock}
                            label="Duration"
                            value={`${intern.duration} month${intern.duration > 1 ? "s" : ""}`}
                            extra={endDateStr}
                            extraLabel="Est. end"
                        />

                        <StatusField status={status} />

                        {intern.leader && (
                            <InfoField
                                icon={Briefcase}
                                label="Leader"
                                value={intern.leader.fullName ?? intern.leader.email}
                            />
                        )}
                    </div>

                    {isDirty && (
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => reset()}
                                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:border-white/20 hover:text-white"
                            >
                                Cancel
                            </button>

                            <Button
                                type="submit"
                                disabled={isPending}
                                variant="glass"
                            >
                                {isPending ? "Saving..." : "Save changes"}
                            </Button>
                        </div>
                    )}
                </form>
            </section>
        </MetalCard>
    );
}

type InfoFieldProps = {
    icon: LucideIcon;
    label: string;
    value: string;
    extra?: string;
    extraLabel?: string;
};

function InfoField({ icon: Icon, label, value, extra, extraLabel }: InfoFieldProps) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
                <Icon className="h-4 w-4" />
                <span>{label}</span>
            </div>
            <p className="text-sm font-medium text-white">{value}</p>
            {extra && (
                <p className="mt-1 text-xs text-slate-500">
                    {extraLabel && `${extraLabel}: `}
                    {extra}
                </p>
            )}
        </div>
    );
}

type FormFieldProps = {
    label: string;
    icon: React.ReactNode;
    error?: string;
    children: React.ReactNode;
};

function FormField({ label, icon, error, children }: FormFieldProps) {
    return (
        <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                {icon}
                <span>{label}</span>
            </label>
            {children}
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
    );
}

function StatusField({
    status,
}: {
    status: { label: string; className: string; dotClass: string };
}) {
    return (
        <div className="rounded-2xl border border-slate-200 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
                <Circle className="h-4 w-4" />
                <span>Status</span>
            </div>
            <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${status.className}`}
            >
                <Circle className={`h-3 w-3 fill-current ${status.dotClass}`} />
                {status.label}
            </span>
        </div>
    );
}
