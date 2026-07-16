"use client";

import { Lock, KeyRound } from "lucide-react";

import { useChangePassword } from "@/hooks/profile/useChangePassword";
import MetalCard from "../ui/MetalCard";
import Button from "../ui/Button";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function ChangePasswordCard() {
    const {
        register,
        handleSubmit,
        watch,
        errors,
        isPending,
        isDirty,
        reset,
    } = useChangePassword();

    const [showPassword, setShowPassword] = useState(false);

    return (
        <MetalCard>
            <section className="rounded-3xl border border-slate-200 p-6 shadow-sm">
                <div className="mb-6">
                    
                    <h2 className="text-xl font-semibold metal-text">
                        {/* prettier-ignore */}
                        <span className="inline-flex items-center gap-2"><KeyRound className="h-5 w-5" /> Security</span>
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Change your password to keep your account secure.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    {/* Current password */}

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Current password
                        </label>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your current password"
                                {...register("oldPassword", {
                                    required:
                                        "Current password is required",
                                })}
                                className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none transition focus:border-slate-400"
                            />
                        </div>

                        {errors.oldPassword && (
                            <p className="mt-2 text-sm text-red-500">
                                {errors.oldPassword.message}
                            </p>
                        )}
                    </div>

                    {/* New password */}

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            New password
                        </label>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your new password"
                                {...register("newPassword", {
                                    required:
                                        "New password is required",
                                    minLength: {
                                        value: 8,
                                        message:
                                            "Password must contain at least 8 characters",
                                    },
                                    pattern: {
                                        value:
                                            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/,
                                        message:
                                            "Password must contain uppercase, lowercase, number and special character",
                                    },
                                })}
                                className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none transition focus:border-slate-400"
                            />
                        </div>

                        {errors.newPassword && (
                            <p className="mt-2 text-sm text-red-500">
                                {errors.newPassword.message}
                            </p>
                        )}
                    </div>

                    {/* Confirm password */}

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Confirm password
                        </label>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Confirm your new password"
                                {...register("confirmPassword", {
                                    required:
                                        "Please confirm your password",
                                    validate: (value) =>
                                        value ===
                                            watch("newPassword") ||
                                        "Passwords do not match",
                                })}
                                className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none transition focus:border-slate-400"
                            />
                        </div>

                        {errors.confirmPassword && (
                            <p className="mt-2 text-sm text-red-500">
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </div>

                    <div
                        className={`
                            flex justify-end gap-3 overflow-hidden
                            transition-all duration-300

                            ${
                                isDirty
                                    ? "max-h-20 opacity-100"
                                    : "max-h-0 opacity-0"
                            }
                        `}
                    >
                        <button
                            type="button"
                            onClick={() => {
                                reset();
                                setShowPassword(false);
                            }}
                            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:border-white/20 hover:text-white"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:border-white/20 hover:text-white"
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                            {showPassword ? "Hide" : "Show"}
                        </button>

                        <Button
                            type="submit"
                            disabled={isPending}
                            variant="glass"
                        >
                            {isPending
                                ? "Updating..."
                                : "Change password"}
                        </Button>
                    </div>
                </form>
            </section>
        </MetalCard>
    );
}