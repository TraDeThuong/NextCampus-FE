"use client";

import { useForm } from "react-hook-form";
import { Mail, Send, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";

type FormValues = {
    email: string;
};

interface InviteInternFormProps {
    isPending: boolean;
    onSubmit: (email: string, onSuccess: () => void) => void;
    onCloseModal?: () => void;
}

export default function InviteInternForm({
    isPending,
    onSubmit,
    onCloseModal,
}: InviteInternFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>();

    return (
        <div className="px-2 py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400">
                <Mail className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-white">
                Invite Intern
            </h3>
            <p className="mt-2 text-sm text-slate-400">
                Send an onboarding invitation link to the candidate and start the application process.
            </p>

            <form
                onSubmit={handleSubmit((data) => onSubmit(data.email, () => onCloseModal?.()))}
                className="mt-6 space-y-4"
            >
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="email"
                        placeholder="candidate@gmail.com"
                        {...register("email", {
                            required: "Email is required",
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: "Invalid email",
                            },
                        })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-cyan-400/50 placeholder:text-slate-600"
                    />
                </div>
                {errors.email && (
                    <p className="text-sm text-red-400">
                        {errors.email.message}
                    </p>
                )}

                <div className="flex justify-center gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onCloseModal}
                        disabled={isPending}
                        className="rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-sm text-slate-300 transition hover:text-white disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <Button
                        type="submit"
                        disabled={isPending}
                        variant="glass"
                    >
                        {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <span className="flex items-center gap-2">
                                <Send className="h-4 w-4" />
                                Send Invite
                            </span>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
