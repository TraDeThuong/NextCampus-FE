"use client";

import React, {
  forwardRef,
  useId,
  type TextareaHTMLAttributes,
} from "react";
import { AlertCircle } from "lucide-react";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      className = "",
      containerClassName = "",
      id,
      required,
      disabled,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const textareaId = id || generatedId;

    return (
      <div className={`w-full flex flex-col gap-1.5 ${containerClassName}`}>
        {label && (
          <label
            htmlFor={textareaId}
            className="text-xs sm:text-sm font-medium text-foreground/90 select-none flex items-center gap-1"
          >
            {label}
            {required && <span className="text-danger font-bold">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error
              ? `${textareaId}-error`
              : helperText
              ? `${textareaId}-helper`
              : undefined
          }
          className={`
            w-full rounded-xl
            bg-card border text-foreground
            text-sm placeholder:text-muted/60
            transition-all duration-200
            px-4 py-2.5 sm:py-3
            outline-none resize-y
            custom-scrollbar
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

        {error ? (
          <p
            id={`${textareaId}-error`}
            role="alert"
            className="text-xs text-danger flex items-center gap-1.5 mt-0.5 animate-fadeIn"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p id={`${textareaId}-helper`} className="text-xs text-muted mt-0.5">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
