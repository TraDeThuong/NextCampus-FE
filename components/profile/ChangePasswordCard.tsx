"use client";

import { Lock, KeyRound, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { useChangePassword } from "@/hooks/profile/useChangePassword";
import MetalCard from "../ui/MetalCard";
import Button from "../ui/Button";

export default function ChangePasswordCard() {
    const t = useTranslations("admin.profile");
    const { register, handleSubmit, watch, errors, isPending, isDirty, reset } = useChangePassword();
    const [showPassword, setShowPassword] = useState(false);

    return (
        <MetalCard>
            <section className="rounded-3xl border border-slate-200 p-6 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold metal-text">
                        <span className="inline-flex items-center gap-2">
                            <KeyRound className="h-5 w-5" /> {t("security")}
                        </span>
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        {t("securityDesc")}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            {t("currentPassword")}
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder={t("currentPasswordPlaceholder")}
                                {...register("oldPassword", {
                                    required: t("currentPasswordRequired"),
                                })}
                                className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none transition focus:border-slate-400"
                            />
                        </div>
                        {errors.oldPassword && (
                            <p className="mt-2 text-sm text-red-500">{errors.oldPassword.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            {t("newPassword")}
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder={t("newPasswordPlaceholder")}
                                {...register("newPassword", {
                                    required: t("newPasswordRequired"),
                                    minLength: {
                                        value: 8,
                                        message: t("passwordMinLength"),
                                    },
                                    pattern: {
                                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/,
                                        message: t("passwordPattern"),
                                    },
                                })}
                                className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none transition focus:border-slate-400"
                            />
                        </div>
                        {errors.newPassword && (
                            <p className="mt-2 text-sm text-red-500">{errors.newPassword.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            {t("confirmPassword")}
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder={t("confirmPasswordPlaceholder")}
                                {...register("confirmPassword", {
                                    required: t("confirmPasswordRequired"),
                                    validate: (value) =>
                                        value === watch("newPassword") || t("passwordsDoNotMatch"),
                                })}
                                className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none transition focus:border-slate-400"
                            />
                        </div>
                        {errors.confirmPassword && (
                            <p className="mt-2 text-sm text-red-500">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    <div
                        className={`flex justify-end gap-3 overflow-hidden transition-all duration-300 ${
                            isDirty ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
                        }`}
                    >
                        <button
                            type="button"
                            onClick={() => {
                                reset();
                                setShowPassword(false);
                            }}
                            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:border-white/20 hover:text-white"
                        >
                            {t("cancel")}
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:border-white/20 hover:text-white"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            {showPassword ? t("hide") : t("show")}
                        </button>

                        <Button type="submit" disabled={isPending} variant="glass">
                            {isPending ? t("updating") : t("changePassword")}
                        </Button>
                    </div>
                </form>
            </section>
        </MetalCard>
    );
}
