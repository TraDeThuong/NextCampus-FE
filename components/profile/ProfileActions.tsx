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
                <div className="relative overflow-hidden rounded-2xl border border-emerald-300 bg-emerald-50/90 dark:border-emerald-400/20 dark:bg-emerald-500/5 p-5 shadow-xs">
                    <div className="relative z-10 flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-300 bg-emerald-100/80 text-emerald-700 hover:bg-emerald-200/80 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300 shadow-xs transition-colors">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-semibold text-emerald-950 dark:text-emerald-300">
                                {t("accountSecurity")}
                            </h3>
                            <p className="mt-0.5 text-xs leading-5 text-emerald-800/80 dark:text-muted">
                                {t("accountSecurityDesc")}
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => logoutMutate()}
                    disabled={isLoading}
                    className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl border border-rose-300 bg-rose-100/80 hover:bg-rose-200/80 text-rose-700 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20 px-5 py-3.5 text-sm font-semibold transition-all duration-300 hover:shadow-[0_0_20px_rgba(244,63,94,0.2)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer select-none"
                >
                    <LogOut className="h-5 w-5 text-rose-700 dark:text-rose-400 shrink-0 transition-transform duration-300 group-hover:-translate-x-0.5" />
                    <span className="font-semibold text-rose-700 dark:text-rose-300">
                        {isLoading ? t("loggingOut") : t("logout")}
                    </span>
                </button>
            </div>
        </section>
    );
}
