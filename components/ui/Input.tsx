"use client";

import React, {
  forwardRef,
  useState,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className = "",
      containerClassName = "",
      type = "text",
      id,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";
    const computedType = isPassword
      ? showPassword
        ? "text"
        : "password"
      : type;

    return (
      <div className={`w-full flex flex-col gap-1.5 ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs sm:text-sm font-medium text-foreground/90 select-none flex items-center gap-1"
          >
            {label}
            {required && <span className="text-danger font-bold">*</span>}
          </label>
        )}

        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center justify-center text-muted pointer-events-none shrink-0">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={computedType}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            className={`
              w-full rounded-xl
              bg-card border text-foreground
              text-sm placeholder:text-muted/60
              transition-all duration-200
              ${leftIcon ? "pl-10" : "pl-4"}
              ${rightIcon || isPassword ? "pr-10" : "pr-4"}
              py-2.5 sm:py-3
              outline-none
              disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-white/5
              ${
                error
                  ? "border-danger focus-visible:border-danger focus-visible:ring-2 focus-visible:ring-danger/40"
                  : "border-border hover:border-border-strong focus-visible:border-primary-light/50 focus-visible:ring-2 focus-visible:ring-primary-light"
              }
              ${className}
            `}
            {...props}
          />

          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              tabIndex={-1}
              className="absolute right-3 flex items-center justify-center text-muted hover:text-foreground transition-colors cursor-pointer p-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 shrink-0" />
              ) : (
                <Eye className="w-4 h-4 shrink-0" />
              )}
            </button>
          ) : rightIcon ? (
            <div className="absolute right-3.5 flex items-center justify-center text-muted pointer-events-none shrink-0">
              {rightIcon}
            </div>
          ) : null}
        </div>

        {error ? (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="text-xs text-danger flex items-center gap-1.5 mt-0.5 animate-fadeIn"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p id={`${inputId}-helper`} className="text-xs text-muted mt-0.5">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
