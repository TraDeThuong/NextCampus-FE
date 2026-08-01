"use client";

import { useState, useRef, useEffect, useId } from "react";
import { ChevronDown, Check, Loader2 } from "lucide-react";

type Option = {
    value: string | null;
    label: string;
};

type InlineSelectProps = {
    ariaLabel: string;
    value: string | null;
    placeholder: string;
    loading?: boolean;
    disabled?: boolean;
    onDisabledClick?: () => void;
    onChange: (value: string | null) => void;
    options: Option[];
    renderTrigger?: (label: string) => React.ReactNode;
};

export default function InlineSelect({
    ariaLabel,
    value,
    placeholder,
    loading,
    disabled,
    onDisabledClick,
    onChange,
    options,
    renderTrigger,
}: InlineSelectProps) {
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const listboxId = useId();

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        if (open) document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    const selected = options.find((o) => o.value === value);
    const label = selected?.label ?? placeholder;
    const isPlaceholder = !selected;
    const selectedIndex = Math.max(
        0,
        options.findIndex((option) => option.value === value),
    );

    const focusOption = (index: number) => {
        const nextIndex = (index + options.length) % options.length;
        setActiveIndex(nextIndex);
        optionRefs.current[nextIndex]?.focus();
    };

    const openDropdown = () => {
        setActiveIndex(selectedIndex);
        setOpen(true);
        requestAnimationFrame(() => optionRefs.current[selectedIndex]?.focus());
    };

    const closeDropdown = () => {
        setOpen(false);
        triggerRef.current?.focus();
    };

    const trigger = renderTrigger ? (
        renderTrigger(label)
    ) : (
        <span className={isPlaceholder ? "italic text-slate-600" : ""}>
            {label}
        </span>
    );

    return (
        <div ref={ref} className="relative">
            <button
                ref={triggerRef}
                type="button"
                aria-label={ariaLabel}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={listboxId}
                onClick={() => {
                    if (disabled) {
                        onDisabledClick?.();
                        return;
                    }
                    if (open) {
                        setOpen(false);
                    } else {
                        openDropdown();
                    }
                }}
                onKeyDown={(event) => {
                    if (disabled) return;
                    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                        event.preventDefault();
                        openDropdown();
                    }
                }}
                disabled={loading}
                className="flex w-full items-center gap-1 text-left transition hover:text-cyan-400 disabled:opacity-50"
            >
                {loading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                ) : (
                    <>
                        <span className="min-w-0 truncate">{trigger}</span>
                        <ChevronDown
                            className={`h-3 w-3 shrink-0 text-slate-500 transition-transform ${
                                open ? "rotate-180" : ""
                            }`}
                        />
                    </>
                )}
            </button>

            {open && (
                <div
                    id={listboxId}
                    role="listbox"
                    aria-label={ariaLabel}
                    onKeyDown={(event) => {
                        if (event.key === "Escape") {
                            event.preventDefault();
                            closeDropdown();
                        } else if (event.key === "ArrowDown") {
                            event.preventDefault();
                            focusOption(activeIndex + 1);
                        } else if (event.key === "ArrowUp") {
                            event.preventDefault();
                            focusOption(activeIndex - 1);
                        }
                    }}
                    className="absolute left-0 top-full z-50 mt-1 min-w-[180px] max-w-[280px] rounded-xl border border-white/10 bg-[#0f172a] p-1.5 shadow-[0_16px_48px_rgba(0,0,0,.55)] backdrop-blur-2xl"
                >
                    <div className="max-h-[220px] overflow-y-auto">
                        {options.map((opt, index) => {
                            const isSelected =
                                opt.value === value ||
                                (opt.value === null && value === null);
                            return (
                                <button
                                    ref={(element) => {
                                        optionRefs.current[index] = element;
                                    }}
                                    key={String(opt.value)}
                                    type="button"
                                    role="option"
                                    aria-selected={isSelected}
                                    tabIndex={index === activeIndex ? 0 : -1}
                                    onClick={() => {
                                        onChange(opt.value);
                                        closeDropdown();
                                    }}
                                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
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
                </div>
            )}
        </div>
    );
}
