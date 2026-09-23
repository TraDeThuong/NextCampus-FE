"use client";

import {
    useState,
    useRef,
    useEffect,
    useCallback,
    useMemo,
    useId,
} from "react";
import { createPortal } from "react-dom";
import { useLocale } from "next-intl";
import {
    Clock,
    X,
    RotateCcw,
    Check,
    AlertCircle,
} from "lucide-react";

// ==========================================
// Time Helpers
// ==========================================

export function parseTimeSafe(timeStr?: string | null): { hours: number; minutes: number } | null {
    if (!timeStr || typeof timeStr !== "string") return null;
    const parts = timeStr.trim().split(":");
    if (parts.length < 2) return null;
    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return null;
    }
    return { hours, minutes };
}

export function formatTimeSafe(hours: number, minutes: number): string {
    const h = String(Math.max(0, Math.min(23, hours))).padStart(2, "0");
    const m = String(Math.max(0, Math.min(59, minutes))).padStart(2, "0");
    return `${h}:${m}`;
}

export function isTimeDisabled(
    hours: number,
    minutes: number,
    minTime?: string,
    maxTime?: string,
): boolean {
    const currentTotal = hours * 60 + minutes;
    if (minTime) {
        const minParsed = parseTimeSafe(minTime);
        if (minParsed && currentTotal < minParsed.hours * 60 + minParsed.minutes) {
            return true;
        }
    }
    if (maxTime) {
        const maxParsed = parseTimeSafe(maxTime);
        if (maxParsed && currentTotal > maxParsed.hours * 60 + maxParsed.minutes) {
            return true;
        }
    }
    return false;
}

// ==========================================
// Types
// ==========================================

export interface TimePreset {
    label: string;
    value: string; // "HH:mm"
}

export interface TimePickerProps {
    value?: string | null;
    onChange?: (time: string) => void;
    onClear?: () => void;
    placeholder?: string;
    minTime?: string;
    maxTime?: string;
    disabled?: boolean;
    className?: string;
    align?: "left" | "right";
    label?: string;
    required?: boolean;
    error?: string;
    helperText?: string;
    step?: number; // Minute step (1, 5, 10, 15, 30), default 5
    presets?: TimePreset[];
    showPresets?: boolean;
}

// ==========================================
// Default Quick Presets
// ==========================================

const DEFAULT_PRESETS: TimePreset[] = [
    { label: "08:00", value: "08:00" },
    { label: "09:00", value: "09:00" },
    { label: "12:00", value: "12:00" },
    { label: "13:30", value: "13:30" },
    { label: "17:30", value: "17:30" },
    { label: "21:00", value: "21:00" },
];

// ==========================================
// TimePicker Component
// ==========================================

export function TimePicker({
    value = "",
    onChange,
    onClear,
    placeholder,
    minTime,
    maxTime,
    disabled = false,
    className = "",
    align = "left",
    label,
    required = false,
    error,
    helperText,
    step = 5,
    presets = DEFAULT_PRESETS,
    showPresets = true,
}: TimePickerProps) {
    const locale = useLocale();
    const isVi = locale === "vi";

    const defaultPlaceholder = isVi ? "Chọn giờ" : "Select time";
    const resolvedPlaceholder = placeholder ?? defaultPlaceholder;

    const [open, setOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const hourColRef = useRef<HTMLDivElement>(null);
    const minuteColRef = useRef<HTMLDivElement>(null);
    const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
    const triggerId = useId();

    // Draft time internal selection (null means use parsed value)
    const parsedValue = useMemo(() => parseTimeSafe(value), [value]);
    const [draftHours, setDraftHours] = useState<number | null>(null);
    const [draftMinutes, setDraftMinutes] = useState<number | null>(null);

    const activeHours = draftHours !== null ? draftHours : (parsedValue?.hours ?? 9);
    const activeMinutes = draftMinutes !== null ? draftMinutes : (parsedValue?.minutes ?? 0);

    // Position calculation with responsive flip & clamping
    const updatePosition = useCallback(() => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const isMobile = vw < 640;

        const popoverWidth = isMobile ? Math.min(300, vw - 20) : 290;
        const popoverHeight = isMobile ? Math.min(390, vh - 32) : 380;

        let top = rect.bottom + 8;
        if (top + popoverHeight > vh - 10) {
            if (rect.top - popoverHeight - 8 >= 10) {
                top = rect.top - popoverHeight - 8;
            } else {
                top = Math.max(10, vh - popoverHeight - 10);
            }
        }

        let left: number;
        if (isMobile) {
            left = Math.max(10, Math.round((vw - popoverWidth) / 2));
        } else {
            left = align === "right" ? rect.right - popoverWidth : rect.left;
            if (left + popoverWidth > vw - 12) {
                left = vw - popoverWidth - 12;
            }
            if (left < 12) left = 12;
        }

        setPopoverStyle({
            position: "fixed",
            top,
            left,
            width: popoverWidth,
            maxHeight: `${vh - 20}px`,
            zIndex: 9999,
        });
    }, [align]);

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

    // Auto-scroll selected hour & minute into view when popover opens
    useEffect(() => {
        if (open) {
            const timer = setTimeout(() => {
                if (hourColRef.current) {
                    const activeHourBtn = hourColRef.current.querySelector<HTMLButtonElement>(
                        `[data-hour="${activeHours}"]`,
                    );
                    if (activeHourBtn) {
                        hourColRef.current.scrollTop =
                            activeHourBtn.offsetTop - hourColRef.current.clientHeight / 2 + 16;
                    }
                }
                if (minuteColRef.current) {
                    const activeMinuteBtn = minuteColRef.current.querySelector<HTMLButtonElement>(
                        `[data-minute="${activeMinutes}"]`,
                    );
                    if (activeMinuteBtn) {
                        minuteColRef.current.scrollTop =
                            activeMinuteBtn.offsetTop - minuteColRef.current.clientHeight / 2 + 16;
                    }
                }
            }, 60);
            return () => clearTimeout(timer);
        }
    }, [open, activeHours, activeMinutes]);

    // Outside click & Escape handlers
    useEffect(() => {
        function handleMouseDown(e: MouseEvent | TouchEvent) {
            const target = e.target as Node;
            if (
                popoverRef.current &&
                !popoverRef.current.contains(target) &&
                triggerRef.current &&
                !triggerRef.current.contains(target)
            ) {
                setOpen(false);
                setDraftHours(null);
                setDraftMinutes(null);
            }
        }
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape" && open) {
                setOpen(false);
                setDraftHours(null);
                setDraftMinutes(null);
                triggerRef.current?.focus();
            }
        }
        if (open) {
            document.addEventListener("mousedown", handleMouseDown);
            document.addEventListener("touchstart", handleMouseDown);
            document.addEventListener("keydown", handleKeyDown);
        }
        return () => {
            document.removeEventListener("mousedown", handleMouseDown);
            document.removeEventListener("touchstart", handleMouseDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open]);

    // Hours list (00 - 23)
    const hoursList = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);

    // Minutes list according to step (00 - 59)
    const minutesList = useMemo(() => {
        const list: number[] = [];
        const validStep = Math.max(1, Math.min(30, step));
        for (let m = 0; m < 60; m += validStep) {
            list.push(m);
        }
        if (!list.includes(activeMinutes)) {
            list.push(activeMinutes);
            list.sort((a, b) => a - b);
        }
        return list;
    }, [step, activeMinutes]);

    const handleApply = () => {
        const formatted = formatTimeSafe(activeHours, activeMinutes);
        onChange?.(formatted);
        setOpen(false);
        setDraftHours(null);
        setDraftMinutes(null);
    };

    const handleSelectNow = () => {
        const now = new Date();
        const currentH = now.getHours();
        const currentM = Math.floor(now.getMinutes() / step) * step;
        setDraftHours(currentH);
        setDraftMinutes(currentM);
        const formatted = formatTimeSafe(currentH, currentM);
        onChange?.(formatted);
    };

    const handlePresetClick = (presetValue: string) => {
        const parsed = parseTimeSafe(presetValue);
        if (parsed) {
            setDraftHours(null);
            setDraftMinutes(null);
            onChange?.(presetValue);
            setOpen(false);
        }
    };

    const handleReset = () => {
        setDraftHours(null);
        setDraftMinutes(null);
        onClear?.();
        setOpen(false);
    };

    const draftFormatted = formatTimeSafe(activeHours, activeMinutes);

    return (
        <div className={`relative w-full flex flex-col gap-1.5 ${className}`}>
            {label && (
                <label
                    htmlFor={triggerId}
                    className="text-xs sm:text-sm font-medium text-foreground/90 select-none flex items-center gap-1"
                >
                    {label}
                    {required && <span className="text-danger font-bold">*</span>}
                </label>
            )}

            <div className="relative w-full">
                <button
                    id={triggerId}
                    ref={triggerRef}
                    type="button"
                    aria-haspopup="dialog"
                    aria-expanded={open}
                    disabled={disabled}
                    onClick={() => {
                        if (disabled) return;
                        setOpen((prev) => !prev);
                    }}
                    className={`
                        group flex w-full items-center justify-between gap-2.5 rounded-xl border px-4 py-2.5 sm:py-3 text-sm font-medium
                        h-[42px] sm:h-[46px]
                        transition-all duration-200 outline-none select-none cursor-pointer
                        backdrop-blur-xl shadow-glass
                        ${
                            disabled
                                ? "opacity-50 cursor-not-allowed border-border bg-card"
                                : open
                                  ? "border-cyan-400/80 bg-cyan-500/10 text-cyan-400 shadow-[0_0_24px_rgba(6,182,212,0.2)]"
                                  : error
                                    ? "border-danger focus-visible:border-danger focus-visible:ring-2 focus-visible:ring-danger/40"
                                    : value
                                      ? "border-border text-foreground hover:border-border-strong hover:bg-card-hover font-mono"
                                      : "border-border dark:border-white/10 bg-card/60 dark:bg-white/[0.04] text-muted hover:text-foreground hover:border-border-strong"
                        }
                    `}
                >
                    <div className="flex items-center gap-2 truncate">
                        <Clock
                            className={`h-4 w-4 shrink-0 transition-colors ${
                                open || value ? "text-cyan-400" : "text-muted group-hover:text-foreground"
                            }`}
                        />
                        <span className={value ? "text-foreground font-semibold truncate" : "text-muted/60 truncate"}>
                            {value || resolvedPlaceholder}
                        </span>
                    </div>

                    {value && onClear && !disabled && (
                        <span
                            role="button"
                            tabIndex={0}
                            aria-label="Xóa chọn giờ"
                            onClick={(e) => {
                                e.stopPropagation();
                                onClear();
                            }}
                            className="flex h-4 w-4 items-center justify-center rounded-full text-muted hover:bg-white/10 hover:text-white transition cursor-pointer"
                        >
                            <X className="h-3 w-3" />
                        </span>
                    )}
                </button>

                {open &&
                    createPortal(
                        <div
                            ref={popoverRef}
                            role="dialog"
                            aria-modal="true"
                            aria-label={label ?? resolvedPlaceholder}
                            data-portal="timepicker"
                            style={popoverStyle}
                            className="
                                rounded-2xl border border-white/10 bg-[#0c1322]/95 p-3.5
                                text-slate-200 shadow-[0_24px_60px_rgba(0,0,0,0.7)]
                                backdrop-blur-2xl ring-1 ring-white/10
                                animate-in fade-in zoom-in-95 duration-200
                                max-h-[calc(100dvh-20px)] overflow-y-auto flex flex-col scrollbar-dropdown
                            "
                        >
                            {/* Header: Current Selection & Now action */}
                            <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10 px-1">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-500/10 text-cyan-400">
                                        <Clock className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="font-mono text-base font-bold text-cyan-300 tracking-wider">
                                        {draftFormatted}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSelectNow}
                                    className="
                                        flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold
                                        text-cyan-400 bg-cyan-500/10 border border-cyan-400/20 hover:bg-cyan-500/20
                                        transition cursor-pointer
                                    "
                                >
                                    {isVi ? "Bây giờ" : "Now"}
                                </button>
                            </div>

                            {/* Quick Presets Bar */}
                            {showPresets && presets && presets.length > 0 && (
                                <div className="flex items-center gap-1.5 pb-2.5 mb-2 overflow-x-auto no-scrollbar border-b border-white/10">
                                    {presets.map((preset) => {
                                        const isSelected = value === preset.value;
                                        return (
                                            <button
                                                key={preset.value}
                                                type="button"
                                                onClick={() => handlePresetClick(preset.value)}
                                                className={`
                                                    shrink-0 rounded-lg px-2 py-1 text-[11px] font-mono font-medium transition cursor-pointer
                                                    ${
                                                        isSelected
                                                            ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                                                            : "border border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/10 hover:text-white"
                                                    }
                                                `}
                                            >
                                                {preset.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Dual Columns: Hours & Minutes */}
                            <div className="grid grid-cols-2 gap-2 my-1">
                                {/* Hours Column */}
                                <div className="flex flex-col">
                                    <div className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 py-1">
                                        {isVi ? "Giờ" : "Hour"}
                                    </div>
                                    <div
                                        ref={hourColRef}
                                        className="h-48 overflow-y-auto scrollbar-dropdown flex flex-col gap-1 pr-1"
                                    >
                                        {hoursList.map((h) => {
                                            const isSelected = activeHours === h;
                                            const isDisabled = isTimeDisabled(h, activeMinutes, minTime, maxTime);
                                            const hStr = String(h).padStart(2, "0");
                                            return (
                                                <button
                                                    key={h}
                                                    data-hour={h}
                                                    type="button"
                                                    disabled={isDisabled}
                                                    onClick={() => setDraftHours(h)}
                                                    className={`
                                                        relative flex h-8 w-full items-center justify-center rounded-lg text-xs font-mono
                                                        transition-all duration-150 cursor-pointer select-none
                                                        ${
                                                            isSelected
                                                                ? "bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                                                                : "text-slate-300 hover:bg-white/10 hover:text-white"
                                                        }
                                                        ${isDisabled ? "opacity-25 cursor-not-allowed pointer-events-none" : ""}
                                                    `}
                                                >
                                                    {hStr}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Minutes Column */}
                                <div className="flex flex-col">
                                    <div className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 py-1">
                                        {isVi ? "Phút" : "Minute"}
                                    </div>
                                    <div
                                        ref={minuteColRef}
                                        className="h-48 overflow-y-auto scrollbar-dropdown flex flex-col gap-1 pr-1"
                                    >
                                        {minutesList.map((m) => {
                                            const isSelected = activeMinutes === m;
                                            const isDisabled = isTimeDisabled(activeHours, m, minTime, maxTime);
                                            const mStr = String(m).padStart(2, "0");
                                            return (
                                                <button
                                                    key={m}
                                                    data-minute={m}
                                                    type="button"
                                                    disabled={isDisabled}
                                                    onClick={() => setDraftMinutes(m)}
                                                    className={`
                                                        relative flex h-8 w-full items-center justify-center rounded-lg text-xs font-mono
                                                        transition-all duration-150 cursor-pointer select-none
                                                        ${
                                                            isSelected
                                                                ? "bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                                                                : "text-slate-300 hover:bg-white/10 hover:text-white"
                                                        }
                                                        ${isDisabled ? "opacity-25 cursor-not-allowed pointer-events-none" : ""}
                                                    `}
                                                >
                                                    {mStr}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Footer & Actions */}
                            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="
                                        flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold
                                        text-slate-400 transition hover:bg-white/5 hover:text-white cursor-pointer
                                    "
                                >
                                    <RotateCcw className="h-3 w-3" />
                                    {isVi ? "Đặt lại" : "Reset"}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleApply}
                                    className="
                                        flex items-center gap-1 rounded-lg
                                        bg-gradient-to-r from-cyan-500 to-blue-600
                                        px-3 py-1 text-xs font-semibold text-white
                                        shadow-[0_0_12px_rgba(6,182,212,0.3)]
                                        transition hover:scale-105 active:scale-95 cursor-pointer
                                    "
                                >
                                    <Check className="h-3 w-3" />
                                    {isVi ? "Áp dụng" : "Apply"}
                                </button>
                            </div>
                        </div>,
                        document.body,
                    )}
            </div>

            {error ? (
                <p
                    role="alert"
                    className="text-xs text-danger flex items-center gap-1.5 mt-0.5 animate-fadeIn"
                >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{error}</span>
                </p>
            ) : helperText ? (
                <p className="text-xs text-muted mt-0.5">{helperText}</p>
            ) : null}
        </div>
    );
}

export default TimePicker;
