"use client";

import Link from "next/link";
import { useForgotPassword } from "@/hooks/auth/useForgotPassword";
import Button from "../ui/Button";

export default function ForgotPasswordForm() {
    const { register, errors, isSubmitting, handleSubmit } = useForgotPassword();

    return (
        <>
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-white">Forgot Password</h1>
                <p className="text-sm text-muted">
                    Enter your email address and we will send you a link to reset your password.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="space-y-2">
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-foreground/90"
                    >
                        Email address
                    </label>
                    <input
                        id="email"
                        type="email"
                        placeholder="name@company.com"
                        className={`w-full rounded-xl border bg-transparent px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted/60
                            ${errors.email
                                ? "border-danger focus:border-danger focus:ring-4 focus:ring-danger/10"
                                : "border-border focus:border-primary-light focus:ring-4 focus:ring-primary-light/10"
                            }`}
                        {...register("email", {
                            required: "Email is required",
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "Invalid email address",
                            },
                        })}
                    />
                    {errors.email && (
                        <p className="text-xs font-medium text-danger mt-1.5 flex items-center gap-1 animate-fadeIn">
                            <span>⚠</span> {errors.email.message}
                        </p>
                    )}
                </div>

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
                            <span>Sending...</span>
                        </div>
                    ) : (
                        <span className="tracking-wide">Send Reset Link</span>
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
