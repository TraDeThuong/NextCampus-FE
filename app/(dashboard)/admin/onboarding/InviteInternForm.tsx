"use client";

import { useForm } from "react-hook-form";
import { Mail, Send, Loader2, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
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
    const t = useTranslations();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>();

    return (
        <div className="px-2 py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-400/20">
                <Mail className="h-6 w-6 shrink-0" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">
                {t("admin.onboarding.inviteModalTitle")}
            </h3>
            <p className="mt-2 text-sm text-muted max-w-sm mx-auto">
                {t("admin.onboarding.inviteModalDescription")}
            </p>

            <form
                onSubmit={handleSubmit((data) => onSubmit(data.email, () => onCloseModal?.()))}
                className="mt-6 space-y-4 text-left"
            >
                <div>
                    <label className="block text-xs font-semibold uppercase text-muted mb-1.5">
                        {t("admin.onboarding.emailLabel")} <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                        <input
                            type="email"
                            placeholder={t("admin.onboarding.emailPlaceholder")}
                            {...register("email", {
                                required: t("admin.onboarding.emailRequired"),
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: t("admin.onboarding.invalidEmail"),
                                },
                            })}
                            className={`w-full rounded-xl border py-3 pl-11 pr-4 text-sm text-foreground outline-none transition bg-card/60 placeholder:text-muted/60 ${
                                errors.email
                                    ? "border-destructive focus:border-destructive focus:ring-1 focus:ring-destructive"
                                    : "border-border dark:border-white/10 focus:border-cyan-400/50"
                            }`}
                        />
                    </div>
                    {errors.email && (
                        <p className="text-xs text-destructive flex items-center gap-1.5 mt-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            {errors.email.message}
                        </p>
                    )}
                </div>

                <div className="flex justify-center gap-3 pt-3">
                    <button
                        type="button"
                        onClick={onCloseModal}
                        disabled={isPending}
                        className="rounded-xl border border-border dark:border-white/10 bg-card/40 px-5 py-2 text-sm text-muted transition hover:text-foreground hover:bg-card active:scale-[0.98] disabled:opacity-50"
                    >
                        {t("admin.onboarding.cancel")}
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
                                <Send className="h-4 w-4 shrink-0" />
                                {t("admin.onboarding.sendInvite")}
                            </span>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
