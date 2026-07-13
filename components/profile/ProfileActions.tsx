"use client";

import { LogOut, ShieldCheck } from "lucide-react";

import { useLogout } from "@/hooks/auth/useLogout";

import MetalCard from "../ui/MetalCard";

export default function ProfileActions() {
    const { logoutMutate, isLoading } = useLogout();

    return (
        <MetalCard>
            <section className="p-6">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold metal-text">
                        Account Actions
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                        Manage your account settings and session.
                    </p>
                </div>

                <div className="space-y-4">
                    {/* Security card */}

                    <div className="relative overflow-hidden rounded-2xl border border-emerald-400/15 bg-gradient-to-br from-emerald-500/10 via-transparent to-slate-950 p-5">
                        {/* glow */}

                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,.18),transparent_60%)]" />

                        {/* top chrome */}

                        <div className="absolute left-4 right-4 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

                        <div className="relative z-10 flex items-start gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10">
                                <ShieldCheck className="h-5 w-5 text-emerald-300" />
                            </div>

                            <div>
                                <h3 className="font-semibold text-white">
                                    Account Security
                                </h3>

                                <p className="mt-1 text-sm leading-6 text-slate-300">
                                    Your account is protected with
                                    authentication and password verification.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Logout */}

                    <button
                        type="button"
                        onClick={() => logoutMutate()}
                        disabled={isLoading}
                        className="
                            group relative w-full overflow-hidden

                            rounded-2xl

                            border border-red-500/20

                            bg-gradient-to-br
                            from-red-500/10
                            via-red-500/5
                            to-slate-950

                            px-5 py-4

                            transition-all duration-300

                            hover:border-red-400/35
                            hover:shadow-[0_0_30px_rgba(239,68,68,.18)]

                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        {/* glow */}

                        <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_center,rgba(239,68,68,.18),transparent_70%)]" />

                        {/* chrome line */}

                        <div className="absolute left-4 right-4 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

                        <div className="relative z-10 flex items-center justify-center gap-3">
                            <LogOut className="h-5 w-5 text-red-300" />

                            <span className="font-medium text-red-200">
                                {isLoading
                                    ? "Logging out..."
                                    : "Logout"}
                            </span>
                        </div>
                    </button>
                </div>
            </section>
        </MetalCard>
    );
}