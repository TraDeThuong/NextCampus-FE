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
    Calendar as CalendarIcon,
    Clock,
    ChevronLeft,
    ChevronRight,
    X,
    RotateCcw,
    Check,
    AlertCircle,
} from "lucide-react";
import {
    parseDateSafe,
    formatDateSafe,
} from "./DatePicker";

// ==========================================
// DateTime Helpers
// ==========================================

export function parseDateTimeSafe(dtStr?: string | null): Date | null {
    if (!dtStr || typeof dtStr !== "string") return null;
    const cleanStr = dtStr.trim();
    if (!cleanStr) return null;

    // Handle "YYYY-MM-DDTHH:mm" or "YYYY-MM-DD HH:mm" or ISO strings
    const match = cleanStr.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2}))?/);
    if (!match) {
        const d = new Date(cleanStr);
        return isNaN(d.getTime()) ? null : d;
    }

    const y = Number(match[1]);
    const m = Number(match[2]) - 1;
    const d = Number(match[3]);
    const hours = match[4] !== undefined ? Number(match[4]) : 12;
    const minutes = match[5] !== undefined ? Number(match[5]) : 0;

    return new Date(y, m, d, hours, minutes, 0, 0);
}

export function formatDateTimeSafe(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${day}T${hours}:${minutes}`;
}

export function formatDisplayDateTime(dtStr?: string | null, locale = "vi"): string {
    if (!dtStr) return "";
    const d = parseDateTimeSafe(dtStr);
    if (!d) return dtStr;

    const day = String(d.getDate()).padStart(2, "0");
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const y = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return locale === "en"
        ? `${m}/${day}/${y} ${hours}:${minutes}`
        : `${day}/${m}/${y} ${hours}:${minutes}`;
}

function isSameDay(a: Date, b: Date): boolean {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

function isBeforeDay(a: Date, b: Date): boolean {
    const da = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
    const db = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
    return da < db;
}

function isAfterDay(a: Date, b: Date): boolean {
    const da = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
    const db = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
    return da > db;
}

const VI_WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const EN_WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
    dateStr: string;
}

function buildCalendarMatrix(year: number, month: number): CalendarDay[][] {
    const firstDayOfMonth = new Date(year, month, 1);
    let startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun, 1 = Mon ...
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // Mon = 0, Sun = 6

    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const weeks: CalendarDay[][] = [];
    let currentWeek: CalendarDay[] = [];

    // Previous month padding
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const d = new Date(year, month - 1, daysInPrevMonth - i, 12, 0, 0);
        currentWeek.push({
            date: d,
            isCurrentMonth: false,
            dateStr: formatDateSafe(d),
        });
    }

    // Current month days
    for (let day = 1; day <= daysInCurrentMonth; day++) {
        const d = new Date(year, month, day, 12, 0, 0);
        currentWeek.push({
            date: d,
            isCurrentMonth: true,
            dateStr: formatDateSafe(d),
        });

        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    }

    // Next month padding
    if (currentWeek.length > 0) {
        let nextDay = 1;
        while (currentWeek.length < 7) {
            const d = new Date(year, month + 1, nextDay++, 12, 0, 0);
            currentWeek.push({
                date: d,
                isCurrentMonth: false,
                dateStr: formatDateSafe(d),
            });
        }
        weeks.push(currentWeek);
    }

    return weeks;
}

// ==========================================
// Types
// ==========================================

export interface DateTimePreset {
    label: string;
    getDateTime: () => string; // returns "YYYY-MM-DDTHH:mm"
}

export interface DateTimePickerProps {
    value?: string | null;
    onChange?: (datetime: string) => void;
    onClear?: () => void;
    placeholder?: string;
    minDate?: string;
    maxDate?: string;
    disabled?: boolean;
    className?: string;
    align?: "left" | "right";
    label?: string;
    required?: boolean;
    error?: string;
    helperText?: string;
    minuteStep?: number; // Minute step (1, 5, 10, 15, 30), default 5
    presets?: DateTimePreset[];
    showPresets?: boolean;
}

// ==========================================
// Default DateTime Presets
// ==========================================

const buildDefaultPresets = (isVi: boolean): DateTimePreset[] => [
    {
        label: isVi ? "Bây giờ" : "Now",
        getDateTime: () => formatDateTimeSafe(new Date()),
    },
    {
        label: isVi ? "+1 Giờ" : "+1 Hour",
        getDateTime: () => {
            const d = new Date();
            d.setHours(d.getHours() + 1);
            return formatDateTimeSafe(d);
        },
    },
    {
        label: isVi ? "Hôm nay 18:00" : "Today 18:00",
        getDateTime: () => {
            const d = new Date();
            d.setHours(18, 0, 0, 0);
            return formatDateTimeSafe(d);
        },
    },
    {
        label: isVi ? "Hôm nay 23:59" : "Today 23:59",
        getDateTime: () => {
            const d = new Date();
            d.setHours(23, 59, 0, 0);
            return formatDateTimeSafe(d);
        },
    },
    {
        label: isVi ? "Ngày mai 09:00" : "Tomorrow 09:00",
        getDateTime: () => {
            const d = new Date();
            d.setDate(d.getDate() + 1);
            d.setHours(9, 0, 0, 0);
            return formatDateTimeSafe(d);
        },
    },
];

// ==========================================
// DateTimePicker Component
// ==========================================

export function DateTimePicker({
    value = "",
    onChange,
    onClear,
    placeholder,
    minDate,
    maxDate,
    disabled = false,
    className = "",
    align = "left",
    label,
    required = false,
    error,
    helperText,
    minuteStep = 5,
    presets,
    showPresets = true,
}: DateTimePickerProps) {
    const locale = useLocale();
    const isVi = locale === "vi";

    const defaultPlaceholder = isVi ? "Chọn ngày & giờ" : "Select date & time";
    const resolvedPlaceholder = placeholder ?? defaultPlaceholder;

    const [open, setOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const hourColRef = useRef<HTMLDivElement>(null);
    const minuteColRef = useRef<HTMLDivElement>(null);
    const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
    const triggerId = useId();

    // Mobile tabs state: "date" | "time"
    const [mobileTab, setMobileTab] = useState<"date" | "time">("date");

    // Parsed initial value
    const parsedValue = useMemo(() => parseDateTimeSafe(value), [value]);
    const today = useMemo(() => new Date(), []);

    // Draft selection state: null means fall back to parsed/current value
    const [draftDate, setDraftDate] = useState<string | null>(null);
    const [draftHours, setDraftHours] = useState<number | null>(null);
    const [draftMinutes, setDraftMinutes] = useState<number | null>(null);

    const activeDate = draftDate !== null ? draftDate : (parsedValue ? formatDateSafe(parsedValue) : formatDateSafe(today));
    const activeHours = draftHours !== null ? draftHours : (parsedValue ? parsedValue.getHours() : 9);
    const activeMinutes = draftMinutes !== null ? draftMinutes : (parsedValue ? parsedValue.getMinutes() : 0);

    // Month view state
    const initialViewDate = useMemo(() => parsedValue || today, [parsedValue, today]);
    const [viewYear, setViewYear] = useState(initialViewDate.getFullYear());
    const [viewMonth, setViewMonth] = useState(initialViewDate.getMonth());

    // Position calculation with responsive flip & clamping
    const updatePosition = useCallback(() => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const isMobile = vw < 640;

        const popoverWidth = isMobile ? Math.min(340, vw - 20) : 510;
        const popoverHeight = isMobile ? Math.min(460, vh - 32) : 440;

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

    // Auto-scroll time columns when opened or tab changed
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
    }, [open, mobileTab, activeHours, activeMinutes]);

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
                setDraftDate(null);
                setDraftHours(null);
                setDraftMinutes(null);
            }
        }
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape" && open) {
                setOpen(false);
                setDraftDate(null);
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

    const calendarMatrix = useMemo(() => {
        return buildCalendarMatrix(viewYear, viewMonth);
    }, [viewYear, viewMonth]);

    const selectedDayObj = useMemo(() => parseDateSafe(activeDate), [activeDate]);

    const hoursList = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);

    const minutesList = useMemo(() => {
        const list: number[] = [];
        const validStep = Math.max(1, Math.min(30, minuteStep));
        for (let m = 0; m < 60; m += validStep) {
            list.push(m);
        }
        if (!list.includes(activeMinutes)) {
            list.push(activeMinutes);
            list.sort((a, b) => a - b);
        }
        return list;
    }, [minuteStep, activeMinutes]);

    const monthLabel = useMemo(() => {
        const d = new Date(viewYear, viewMonth, 1);
        return d.toLocaleDateString(isVi ? "vi-VN" : "en-US", {
            month: "long",
            year: "numeric",
        });
    }, [viewYear, viewMonth, isVi]);

    const effectivePresets = useMemo(() => {
        return presets ?? buildDefaultPresets(isVi);
    }, [presets, isVi]);

    const handleApply = () => {
        if (!activeDate) return;
        const [y, m, d] = activeDate.split("-").map(Number);
        const targetDate = new Date(y, m - 1, d, activeHours, activeMinutes, 0, 0);
        onChange?.(formatDateTimeSafe(targetDate));
        setOpen(false);
        setDraftDate(null);
        setDraftHours(null);
        setDraftMinutes(null);
    };

    const handlePresetClick = (getDateTime: () => string) => {
        const result = getDateTime();
        const parsed = parseDateTimeSafe(result);
        if (parsed) {
            setViewYear(parsed.getFullYear());
            setViewMonth(parsed.getMonth());
            setDraftDate(null);
            setDraftHours(null);
            setDraftMinutes(null);
            onChange?.(result);
            setOpen(false);
        }
    };

    const handleReset = () => {
        setDraftDate(null);
        setDraftHours(null);
        setDraftMinutes(null);
        onClear?.();
        setOpen(false);
    };

    const draftDisplayStr = useMemo(() => {
        if (!activeDate) return "";
        const [y, m, d] = activeDate.split("-").map(Number);
        const targetDate = new Date(y, m - 1, d, activeHours, activeMinutes, 0, 0);
        return formatDisplayDateTime(formatDateTimeSafe(targetDate), locale);
    }, [activeDate, activeHours, activeMinutes, locale]);

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
                        <div className="relative flex items-center shrink-0">
                            <CalendarIcon
                                className={`h-4 w-4 transition-colors ${
                                    open || value ? "text-cyan-400" : "text-muted group-hover:text-foreground"
                                }`}
                            />
                        </div>
                        <span className={value ? "text-foreground font-semibold truncate" : "text-muted/60 truncate"}>
                            {value ? formatDisplayDateTime(value, locale) : resolvedPlaceholder}
                        </span>
                    </div>

                    {value && onClear && !disabled && (
                        <span
                            role="button"
                            tabIndex={0}
                            aria-label="Xóa chọn ngày và giờ"
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
                            data-portal="datetimepicker"
                            style={popoverStyle}
                            className="
                                rounded-2xl border border-border dark:border-white/10 bg-card/95 dark:bg-[#0c1322]/95 p-3.5
                                text-foreground dark:text-slate-200 shadow-2xl
                                backdrop-blur-2xl ring-1 ring-border dark:ring-white/10
                                animate-in fade-in zoom-in-95 duration-200
                                max-h-[calc(100dvh-20px)] overflow-y-auto flex flex-col scrollbar-dropdown
                            "
                        >
                            {/* Mobile Tab Switcher (visible on < sm screens) */}
                            <div className="flex sm:hidden items-center justify-between pb-2 mb-2 border-b border-border dark:border-white/10">
                                <div className="grid grid-cols-2 gap-1 w-full p-1 bg-slate-100 dark:bg-white/[0.04] rounded-xl border border-border dark:border-white/5">
                                    <button
                                        type="button"
                                        onClick={() => setMobileTab("date")}
                                        className={`
                                            flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer
                                            ${
                                                mobileTab === "date"
                                                    ? "bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-400/30 shadow-xs"
                                                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                                            }
                                        `}
                                    >
                                        <CalendarIcon className="h-3.5 w-3.5" />
                                        <span>{isVi ? "Ngày" : "Date"}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMobileTab("time")}
                                        className={`
                                            flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer
                                            ${
                                                mobileTab === "time"
                                                    ? "bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-400/30 shadow-xs"
                                                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                                            }
                                        `}
                                    >
                                        <Clock className="h-3.5 w-3.5" />
                                        <span className="font-mono">
                                            {String(activeHours).padStart(2, "0")}:{String(activeMinutes).padStart(2, "0")}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Quick Presets Bar */}
                            {showPresets && effectivePresets.length > 0 && (
                                <div className="flex items-center gap-1.5 pb-2.5 mb-2 overflow-x-auto no-scrollbar border-b border-border dark:border-white/10">
                                    {effectivePresets.map((preset) => (
                                        <button
                                            key={preset.label}
                                            type="button"
                                            onClick={() => handlePresetClick(preset.getDateTime)}
                                            className="
                                                shrink-0 rounded-lg px-2 py-1 text-[11px] font-medium transition cursor-pointer
                                                border border-border dark:border-white/10 bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 dark:hover:text-white
                                            "
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Main Body: Desktop side-by-side / Mobile tabbed */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* Calendar Panel (Desktop: Always, Mobile: When tab is "date") */}
                                <div className={`flex-1 flex-col ${mobileTab === "date" ? "flex" : "hidden sm:flex"}`}>
                                    {/* Month Navigation */}
                                    <div className="flex items-center justify-between mb-2 px-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (viewMonth === 0) {
                                                    setViewYear((y) => y - 1);
                                                    setViewMonth(11);
                                                } else setViewMonth((m) => m - 1);
                                            }}
                                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border dark:border-white/10 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] text-slate-700 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white transition cursor-pointer"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground dark:text-slate-200">
                                            {monthLabel}
                                        </h4>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (viewMonth === 11) {
                                                    setViewYear((y) => y + 1);
                                                    setViewMonth(0);
                                                } else setViewMonth((m) => m + 1);
                                            }}
                                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border dark:border-white/10 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] text-slate-700 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white transition cursor-pointer"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {/* Weekdays */}
                                    <div className="grid grid-cols-7 gap-1 mb-1 text-center">
                                        {(isVi ? VI_WEEKDAYS : EN_WEEKDAYS).map((day) => (
                                            <div
                                                key={day}
                                                className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-500 py-1"
                                            >
                                                {day}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Day Grid */}
                                    <div className="grid grid-cols-7 gap-1">
                                        {calendarMatrix.flatMap((week) =>
                                            week.map((cell) => {
                                                const { date, isCurrentMonth, dateStr } = cell;
                                                const isToday = isSameDay(date, today);
                                                const isSelected = selectedDayObj
                                                    ? isSameDay(date, selectedDayObj)
                                                    : false;

                                                const isBeforeMin = minDate
                                                    ? isBeforeDay(date, parseDateSafe(minDate)!)
                                                    : false;
                                                const isAfterMax = maxDate
                                                    ? isAfterDay(date, parseDateSafe(maxDate)!)
                                                    : false;
                                                const isCellDisabled = isBeforeMin || isAfterMax;

                                                return (
                                                    <button
                                                        key={dateStr}
                                                        type="button"
                                                        disabled={isCellDisabled}
                                                        onClick={() => {
                                                            setDraftDate(dateStr);
                                                            // On mobile, auto-switch to time tab after selecting date
                                                            if (window.innerWidth < 640) {
                                                                setMobileTab("time");
                                                            }
                                                        }}
                                                        className={`
                                                            relative flex h-8 w-8 items-center justify-center rounded-lg text-xs
                                                            transition-all duration-150 cursor-pointer select-none mx-auto
                                                            ${
                                                                isSelected
                                                                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                                                                    : isCurrentMonth
                                                                      ? "text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
                                                                      : "text-slate-400 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-white/5"
                                                            }
                                                            ${isCellDisabled ? "opacity-25 cursor-not-allowed pointer-events-none" : ""}
                                                        `}
                                                    >
                                                        {date.getDate()}
                                                        {isToday && !isSelected && (
                                                            <span className="absolute bottom-1 h-1 w-1 rounded-full bg-cyan-600 dark:bg-cyan-400" />
                                                        )}
                                                    </button>
                                                );
                                            }),
                                        )}
                                    </div>
                                </div>

                                {/* Divider (Desktop only) */}
                                <div className="hidden sm:block w-[1px] bg-border dark:bg-white/10 my-1 self-stretch" />

                                {/* Time Panel (Desktop: Always, Mobile: When tab is "time") */}
                                <div
                                    className={`sm:w-44 flex flex-col ${
                                        mobileTab === "time" ? "flex" : "hidden sm:flex"
                                    }`}
                                >
                                    <div className="flex items-center justify-center gap-1.5 pb-2 mb-1 border-b border-border dark:border-white/10">
                                        <Clock className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                                        <span className="font-mono text-sm font-bold text-cyan-700 dark:text-cyan-300">
                                            {String(activeHours).padStart(2, "0")}:{String(activeMinutes).padStart(2, "0")}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 my-1">
                                        {/* Hours */}
                                        <div className="flex flex-col">
                                            <div className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-500 py-1">
                                                {isVi ? "Giờ" : "Hour"}
                                            </div>
                                            <div
                                                ref={hourColRef}
                                                className="h-44 overflow-y-auto scrollbar-dropdown flex flex-col gap-1 pr-1"
                                            >
                                                {hoursList.map((h) => {
                                                    const isSelected = activeHours === h;
                                                    const hStr = String(h).padStart(2, "0");
                                                    return (
                                                        <button
                                                            key={h}
                                                            data-hour={h}
                                                            type="button"
                                                            onClick={() => setDraftHours(h)}
                                                            className={`
                                                                flex h-7 w-full items-center justify-center rounded-lg text-xs font-mono
                                                                transition cursor-pointer select-none
                                                                ${
                                                                    isSelected
                                                                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                                                                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
                                                                }
                                                            `}
                                                        >
                                                            {hStr}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Minutes */}
                                        <div className="flex flex-col">
                                            <div className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-500 py-1">
                                                {isVi ? "Phút" : "Min"}
                                            </div>
                                            <div
                                                ref={minuteColRef}
                                                className="h-44 overflow-y-auto scrollbar-dropdown flex flex-col gap-1 pr-1"
                                            >
                                                {minutesList.map((m) => {
                                                    const isSelected = activeMinutes === m;
                                                    const mStr = String(m).padStart(2, "0");
                                                    return (
                                                        <button
                                                            key={m}
                                                            data-minute={m}
                                                            type="button"
                                                            onClick={() => setDraftMinutes(m)}
                                                            className={`
                                                                flex h-7 w-full items-center justify-center rounded-lg text-xs font-mono
                                                                transition cursor-pointer select-none
                                                                ${
                                                                    isSelected
                                                                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                                                                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
                                                                }
                                                            `}
                                                        >
                                                            {mStr}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer & Actions */}
                            <div className="mt-3 pt-3 border-t border-border dark:border-white/10 flex items-center justify-between gap-2">
                                <div className="text-[11px] font-medium text-slate-600 dark:text-slate-400 truncate">
                                    {draftDisplayStr ? (
                                        <span className="font-mono text-cyan-700 dark:text-cyan-300 font-semibold">{draftDisplayStr}</span>
                                    ) : (
                                        <span className="text-slate-500">{resolvedPlaceholder}</span>
                                    )}
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="
                                            flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold
                                            text-slate-600 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white cursor-pointer
                                        "
                                    >
                                        <RotateCcw className="h-3 w-3" />
                                        {isVi ? "Đặt lại" : "Reset"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleApply}
                                        disabled={!activeDate}
                                        className="
                                            flex items-center gap-1 rounded-lg
                                            bg-gradient-to-r from-cyan-500 to-blue-600
                                            px-3 py-1 text-xs font-semibold text-white
                                            shadow-[0_0_12px_rgba(6,182,212,0.3)]
                                            transition hover:scale-105 active:scale-95
                                            disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer
                                        "
                                    >
                                        <Check className="h-3 w-3" />
                                        {isVi ? "Áp dụng" : "Apply"}
                                    </button>
                                </div>
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

export default DateTimePicker;
