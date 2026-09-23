"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useResetPassword } from "@/hooks/auth/useResetPassword";
import PasswordInput from "./PasswordInput";
import Button from "../ui/Button";

export default function ResetPasswordForm() {
    const t = useTranslations("auth");
    const { register, errors, isSubmitting, handleSubmit, watch, token } = useResetPassword();

    if (!token) {
        return (
            <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold text-foreground">{t("invalidLink")}</h1>
                <p className="text-sm text-muted">
                    {t("invalidLinkDesc")}
                </p>
                <Link
                    href="/forgot-password"
                    className="inline-block text-sm font-medium text-primary-main hover:text-primary-main/80 hover:underline dark:text-primary-light dark:hover:text-white transition"
                >
                    {t("requestNewLink")}
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-foreground">{t("resetTitle")}</h1>
                <p className="text-sm text-muted">
                    {t("resetDesc")}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <PasswordInput
                    register={register}
                    error={errors.password?.message}
                    name="password"
                    label={t("newPassword")}
                    placeholder={t("newPassword")}
                    rules={{
                        required: t("passwordRequired"),
                        minLength: { value: 8, message: t("passwordMinLength") },
                        pattern: {
                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
                            message: t("passwordComplexity"),
                        },
                    }}
                />

                <PasswordInput
                    register={register}
                    error={errors.confirmPassword?.message}
                    name="confirmPassword"
                    label={t("confirmPassword")}
                    placeholder={t("confirmPassword")}
                    rules={{
                        required: t("confirmPasswordRequired"),
                        validate: (value: string) =>
                            value === watch("password") || t("passwordsDoNotMatch"),
                    }}
                />

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="relative flex w-full items-center justify-center"
                >
                    {isSubmitting ? (
                        <div className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>{t("resetting")}</span>
                        </div>
                    ) : (
                        <span className="tracking-wide">{t("resetTitle")}</span>
                    )}
                </Button>

                <div className="text-center">
                    <Link
                        href="/login"
                        className="text-sm font-medium text-primary-main hover:text-primary-main/80 hover:underline dark:text-primary-light dark:hover:text-white transition"
                    >
                        {t("backToSignIn")}
                    </Link>
                </div>
            </form>
        </>
    );
}
