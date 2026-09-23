"use client";

import { useSearchParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLogin } from "@/hooks/auth/useLogin";
import LoginHeader from "./LoginHeader";
import PasswordInput from "./PasswordInput";
import Button from "../ui/Button";
import Link from "next/link";
import Spinner from "../ui/Spinner";

export default function LoginForm() {
    const t = useTranslations("auth");
    const { register, errors, isSubmitting, loginError, handleSubmit } = useLogin();
    const searchParams = useSearchParams();
    const isInactive = searchParams.get("reason") === "inactive";

    return (
        <>
            <LoginHeader />

            {isInactive && (
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-sm text-red-300">
                    <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
                    <span>{t("accountInactive")}</span>
                </div>
            )}

            {loginError && !isInactive && (
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-sm text-red-300 animate-fadeIn">
                    <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
                    <span>{loginError}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-5">
                {/* Email Field */}
                <div className="space-y-2">
                    <label 
                        htmlFor="email" 
                        className="block text-sm font-medium text-foreground/90"
                    >
                        {t("emailLabel")}
                    </label>
                    <input
                        id="email"
                        type="email"
                        placeholder={t("emailPlaceholder")}
                        className={`w-full rounded-xl border bg-transparent px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted/60 
                            ${errors.email 
                                ? "border-danger focus:border-danger focus:ring-4 focus:ring-danger/10" 
                                : "border-border focus:border-primary-light focus:ring-4 focus:ring-primary-light/10"
                            }`}
                        {...register("email", { 
                            required: t("emailRequired"),
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: t("invalidEmail"),
                            }
                        })}
                    />
                    {errors.email && (
                        <p className="text-xs font-medium text-danger mt-1.5 flex items-center gap-1 animate-fadeIn">
                            <span>⚠</span> {errors.email.message}
                        </p>
                    )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                    <PasswordInput
                        register={register}
                        error={errors.password?.message}
                        label={t("passwordLabel")}
                        placeholder={t("passwordPlaceholder")}
                        rules={{ required: t("passwordRequired") }}
                    />
                </div>

                {/* Remember Me & Forgot Password Utilities */}
                <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center cursor-pointer select-none group">
                        <input
                            id="remember"
                            type="checkbox"
                            className="h-4 w-4 rounded border-border bg-transparent text-primary-main focus:ring-primary-light/20 cursor-pointer transition accent-primary-main"
                            {...register("remember")}
                        />
                        <span className="ml-2 text-sm text-muted group-hover:text-foreground transition">
                            {t("rememberMe")}
                        </span>
                    </label>
                    <Link
                        href="/forgot-password"
                        className="text-sm font-medium text-primary-main hover:text-primary-main/80 hover:underline dark:text-primary-light dark:hover:text-white transition"
                    >
                        {t("forgotPassword")}
                    </Link>
                </div>

                {/* Submit Sign In Button */}
                <Button                     
                    type="submit"
                    disabled={isSubmitting}
                    className ="relative flex w-full items-center justify-center">
                        {isSubmitting ? (
                            <div className="flex items-center gap-2">
                                <Spinner size="sm"/>
                                <span>{t("signingIn")}</span>
                            </div>
                        ) : (
                            <span className="tracking-wide">{t("signIn")}</span>
                        )}

                </Button>
            </form>
        </>
    );
}