"use client";

import { LogOut, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

import { useLogout } from "@/hooks/auth/useLogout";
export default function ProfileActions() {
    const t = useTranslations("admin.profile");
    const { logoutMutate, isLoading } = useLogout();

    return (
        <section className="p-1">
            <div className="mb-6">
                <h2 className="text-xl font-semibold metal-text">
                    {t("accountActions")}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    {t("accountActionsDesc")}
                </p>
            </div>

            <div className="space-y-4">
                <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-50/80 dark:border-emerald-400/15 dark:bg-gradient-to-br dark:from-emerald-500/10 dark:via-transparent dark:to-slate-950 p-5">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,.18),transparent_60%)]" />
                    <div className="absolute left-4 right-4 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                    <div className="relative z-10 flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-300 bg-emerald-100/80 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-semibold text-foreground dark:text-white">
                                {t("accountSecurity")}
                            </h3>
                            <p className="mt-0.5 text-xs leading-5 text-muted-foreground dark:text-slate-300">
                                {t("accountSecurityDesc")}
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => logoutMutate()}
                    disabled={isLoading}
                    className="group relative w-full overflow-hidden rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 hover:border-rose-300 text-rose-700 dark:border-red-500/20 dark:bg-gradient-to-br dark:from-red-500/10 dark:via-red-500/5 dark:to-slate-950 dark:text-red-200 px-5 py-4 transition-all duration-300 hover:shadow-[0_0_30px_rgba(239,68,68,.18)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_center,rgba(239,68,68,.18),transparent_70%)]" />
                    <div className="absolute left-4 right-4 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                    <div className="relative z-10 flex items-center justify-center gap-3">
                        <LogOut className="h-5 w-5 text-rose-600 dark:text-red-300" />
                        <span className="font-medium text-rose-700 dark:text-red-200">
                            {isLoading ? t("loggingOut") : t("logout")}
                        </span>
                    </div>
                </button>
            </div>
        </section>
    );
}
