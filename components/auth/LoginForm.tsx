"use client";

import { useLogin } from "@/hooks/useLogin";
import LoginHeader from "./LoginHeader";
import PasswordInput from "./PasswordInput";

export default function LoginForm() {
    const { register, errors, isSubmitting, handleSubmit } = useLogin();

    return (
        <>
            <LoginHeader />

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                {/* Email Field */}
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
                                message: "Invalid email address"
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
                    <PasswordInput register={register} error={errors.password?.message} />
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
                            Remember me
                        </span>
                    </label>
                    <a 
                        href="#" 
                        className="text-sm font-medium text-primary-light hover:text-white hover:underline transition metal-glow"
                    >
                        Forgot password?
                    </a>
                </div>

                {/* Submit Sign In Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="relative flex w-full items-center justify-center rounded-xl bg-primary-main px-4 py-3.5 text-sm font-semibold text-white shadow-soft transition-all duration-200 hover:bg-primary-light active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {isSubmitting ? (
                        <div className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>Signing In...</span>
                        </div>
                    ) : (
                        <span className="tracking-wide">Sign In</span>
                    )}
                </button>
            </form>
        </>
    );
}