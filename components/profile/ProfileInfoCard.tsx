"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
    Mail,
    Shield,
    Calendar,
    User,
    Fingerprint,
} from "lucide-react";

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

export default function ProfileInfoCard({
    profile,
}: ProfileInfoCardProps) {
    const { updateProfileAsync, isPending } = useUpdateProfile();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm<FormValues>({
        defaultValues: {
            fullName: profile.fullName,
        },
    });

    useEffect(() => {
        reset({
            fullName: profile.fullName,
        });
    }, [profile, reset]);

    const onSubmit = async (data: FormValues) => {
        await updateProfileAsync({
            fullName: data.fullName,
        });
    };

    const roleName = profile.role;

    const createdAt = new Date(
        profile.createdAt,
    ).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

    return (
        <MetalCard>
            <section className="rounded-3xl border border-slate-200 p-6 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold metal-text">
                        Personal Information
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Update your profile information.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    {/* Full name */}

                    <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                            <User className="h-4 w-4" />
                            Full name
                        </label>

                        <input
                            type="text"
                            {...register("fullName", {
                                required: "Full name is required",
                                minLength: {
                                    value: 2,
                                    message:
                                        "Full name must contain at least 2 characters",
                                },
                            })}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400 text-white"
                        />

                        {errors.fullName && (
                            <p className="mt-2 text-sm text-red-500">
                                {errors.fullName.message}
                            </p>
                        )}
                    </div>

                    {/* Read-only fields */}

                    <div className="grid gap-4 md:grid-cols-2 ">
                        <ReadonlyField
                            icon={<Mail className="h-4 w-4" />}
                            label="Email"
                            value={profile.email}
                        />

                        <ReadonlyField
                            icon={<Shield className="h-4 w-4" />}
                            label="Role"
                            value={roleName}
                        />

                        <ReadonlyField
                            icon={<Fingerprint className="h-4 w-4" />}
                            label="User ID"
                            value={profile.id}
                        />

                        <ReadonlyField
                            icon={<Calendar className="h-4 w-4" />}
                            label="Created at"
                            value={createdAt}
                        />
                    </div>

                    {
                        isDirty && (
                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={isPending}
                                    variant="glass">
                                        {isPending ? "Saving..." : "Save changes"}
                                </Button>
                            </div>
                        )
                    }
                </form>
            </section>
        </MetalCard>
    );
}

type ReadonlyFieldProps = {
    label: string;
    value: string;
    icon: React.ReactNode;
};

function ReadonlyField({
    label,
    value,
    icon,
}: ReadonlyFieldProps) {
    return (
        <div className="rounded-2xl border border-slate-200 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
                {icon}

                <span>{label}</span>
            </div>

            <p className="break-all text-sm font-medium text-white">
                {value}
            </p>
        </div>
    );
}