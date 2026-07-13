"use client";

import Link from "next/link";
import { useResetPassword } from "@/hooks/auth/useResetPassword";
import PasswordInput from "./PasswordInput";
import Button from "../ui/Button";

export default function ResetPasswordForm() {
    const { register, errors, isSubmitting, handleSubmit, watch, token } = useResetPassword();

    if (!token) {
        return (
            <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold text-white">Invalid Link</h1>
                <p className="text-sm text-muted">
                    The password reset link is missing or invalid. Please request a new one.
                </p>
                <Link
                    href="/forgot-password"
                    className="inline-block text-sm font-medium text-primary-light hover:text-white hover:underline transition"
                >
                    Request New Reset Link
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-white">Reset Password</h1>
                <p className="text-sm text-muted">
                    Enter your new password below.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <PasswordInput
                    register={register}
                    error={errors.password?.message}
                    name="password"
                    label="New Password"
                    placeholder="Enter new password"
                    rules={{
                        required: "Password is required",
                        minLength: { value: 8, message: "Password must be at least 8 characters" },
                        pattern: {
                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
                            message: "Password must include uppercase, lowercase, number, and special character",
                        },
                    }}
                />

                <PasswordInput
                    register={register}
                    error={errors.confirmPassword?.message}
                    name="confirmPassword"
                    label="Confirm Password"
                    placeholder="Re-enter new password"
                    rules={{
                        required: "Please confirm your password",
                        validate: (value: string) =>
                            value === watch("password") || "Passwords do not match",
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
                            <span>Resetting...</span>
                        </div>
                    ) : (
                        <span className="tracking-wide">Reset Password</span>
                    )}
                </Button>

                <div className="text-center">
                    <Link
                        href="/login"
                        className="text-sm font-medium text-primary-light hover:text-white hover:underline transition"
                    >
                        Back to Sign In
                    </Link>
                </div>
            </form>
        </>
    );
}
