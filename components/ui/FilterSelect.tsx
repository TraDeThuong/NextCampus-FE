"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { ChevronDown, Check } from "lucide-react";

interface Option {
    value: string;
    label: string;
}

interface FilterSelectProps {
    label: string;
    filterField: string;
    options: Option[];
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export default function FilterSelect({
    label,
    filterField,
    options,
    placeholder = "All",
    disabled = false,
    className = "",
}: FilterSelectProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const currentValue = searchParams.get(filterField) ?? "";
    const selected = options.find((o) => o.value === currentValue);

    const [open, setOpen] = useState(false);
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const updatePosition = useCallback(() => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setDropdownStyle({
                position: "fixed",
                top: rect.bottom + 8,
                left: rect.left,
                width: Math.max(rect.width, 200),
                zIndex: 9999,
            });
        }
    }, []);

    useEffect(() => {
        if (open) {
            updatePosition();
            window.addEventListener("scroll", updatePosition, true);
            window.addEventListener("resize", updatePosition);
        }
        return () => {
            window.removeEventListener("scroll", updatePosition, true);
            window.removeEventListener("resize", updatePosition);
        };
    }, [open, updatePosition]);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            const target = e.target as Node;
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(target) &&
                triggerRef.current &&
                !triggerRef.current.contains(target)
            ) {
                setOpen(false);
            }
        }
        if (open) document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    function handleChange(value: string) {
        const params = new URLSearchParams(searchParams.toString());

        if (value) {
            params.set(filterField, value);
        } else {
            params.delete(filterField);
        }

        if (params.get("page")) {
            params.set("page", "1");
        }

        router.push(`${pathname}?${params.toString()}`);
        setOpen(false);
    }

    return (
        <div className={`flex w-full flex-col gap-3 ${className}`}>
            <label
                className="
                    metal-text metal-glow
                    text-sm font-semibold
                    uppercase tracking-[0.18em]
                "
            >
                {label}
            </label>

            <div className="relative">
                <button
                    ref={triggerRef}
                    type="button"
                    onClick={() => !disabled && setOpen(!open)}
                    disabled={disabled}
                    className={`flex w-full items-center justify-between rounded-2xl border border-border bg-card px-5 py-3 text-sm font-medium shadow-glass backdrop-blur-xl transition-all duration-300 outline-none ${
                        disabled
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:border-border-strong hover:bg-card-hover cursor-pointer"
                    } ${
                        open
                            ? "border-primary-light shadow-[0_0_28px_rgba(21,174,245,0.18)]"
                            : ""
                    }`}
                >
                    <span
                        className={
                            selected ? "text-foreground" : "text-muted"
                        }
                    >
                        {selected?.label ?? placeholder}
                    </span>
                    <ChevronDown
                        className={`h-4 w-4 shrink-0 text-muted transition-transform duration-300 ${
                            open ? "rotate-180" : ""
                        }`}
                    />
                </button>

                {open &&
                    createPortal(
                        <div
                            ref={dropdownRef}
                            style={dropdownStyle}
                            className="rounded-xl border border-white/10 bg-[#0f172a] p-1.5 shadow-[0_16px_48px_rgba(0,0,0,.55)] backdrop-blur-2xl"
                        >
                            <div className="max-h-[240px] overflow-y-auto scrollbar-dropdown">
                                {!currentValue ? (
                                    <button
                                        type="button"
                                        onClick={() => handleChange("")}
                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-cyan-400 bg-cyan-400/10"
                                    >
                                        <span className="flex-1 text-left">
                                            {placeholder}
                                        </span>
                                        <Check className="h-3.5 w-3.5 shrink-0" />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handleChange("")}
                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                                    >
                                        <span className="flex-1 text-left">
                                            {placeholder}
                                        </span>
                                    </button>
                                )}

                                {options.map((opt) => {
                                    const isSelected =
                                        opt.value === currentValue;
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() =>
                                                handleChange(opt.value)
                                            }
                                            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                                                isSelected
                                                    ? "text-cyan-400 bg-cyan-400/10"
                                                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                                            }`}
                                        >
                                            <span className="flex-1 truncate text-left">
                                                {opt.label}
                                            </span>
                                            {isSelected && (
                                                <Check className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>,
                        document.body,
                    )}
            </div>
        </div>
    );
}