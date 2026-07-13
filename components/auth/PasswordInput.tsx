"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { UseFormRegister, FieldError, RegisterOptions } from "react-hook-form";

type PasswordInputProps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    register: UseFormRegister<any>;
    error?: FieldError["message"];
    name?: string;
    label?: string;
    placeholder?: string;
    rules?: RegisterOptions;
};

export default function PasswordInput({
    register,
    error,
    name = "password",
    label = "Password",
    placeholder = "Enter your password",
    rules,
}: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="space-y-2">
            <label
                htmlFor={name}
                className="block text-sm font-medium text-foreground/90"
            >
                {label}
            </label>

            <div className="relative flex items-center">
                <input
                    id={name}
                    type={showPassword ? "text" : "password"}
                    placeholder={placeholder}
                    className={`w-full rounded-xl border bg-transparent py-3 pl-4 pr-12 text-sm text-foreground outline-none transition-all placeholder:text-muted/60
                        ${error
                            ? "border-danger focus:border-danger focus:ring-4 focus:ring-danger/10"
                            : "border-border focus:border-primary-light focus:ring-4 focus:ring-primary-light/10"
                        }`}
                    {...register(name, rules || { required: `${label} is required` })}
                />

                <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-white/[0.04] active:scale-95 transition-all select-none"
                    tabIndex={-1}
                >
                    {showPassword ? (
                        <EyeOff size={18} />
                    ) : (
                        <Eye size={18} />
                    )}
                </button>
            </div>

            {error && (
                <p className="text-xs font-medium text-danger flex items-center gap-1 mt-1.5 animate-fadeIn">
                    <span>⚠</span> {error}
                </p>
            )}
        </div>
    );
}
