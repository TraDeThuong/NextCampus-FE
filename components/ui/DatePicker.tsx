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
    ChevronLeft,
    ChevronRight,
    X,
    RotateCcw,
    Check,
    AlertCircle,
} from "lucide-react";

// ==========================================
// Date Helpers (Safe against timezone shifts)
// ==========================================

export function parseDateSafe(dateStr?: string | null): Date | null {
    if (!dateStr || !dateStr.includes("-")) return null;
    const parts = dateStr.split("-").map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return null;
    const [y, m, d] = parts;
    return new Date(y, m - 1, d, 12, 0, 0);
}

export function formatDateSafe(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

export function formatDisplayDate(dateStr?: string | null, locale = "vi"): string {
    if (!dateStr) return "";
    const d = parseDateSafe(dateStr);
    if (!d) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const y = d.getFullYear();
    return locale === "en" ? `${m}/${day}/${y}` : `${day}/${m}/${y}`;
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

export interface DatePreset {
    label: string;
    getRange: () => { start: string; end: string };
}

export interface DateRangePickerProps {
    startDate?: string | null;
    endDate?: string | null;
    onChange?: (start: string, end: string) => void;
    onClear?: () => void;
    placeholder?: string;
    minDate?: string;
    maxDate?: string;
    disabled?: boolean;
    className?: string;
    align?: "left" | "right";
    presets?: DatePreset[];
    showPresets?: boolean;
}

export interface DatePickerProps {
    value?: string | null;
    onChange?: (date: string) => void;
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
}

// ==========================================
// DateRangePicker Component
// ==========================================

export function DateRangePicker({
    startDate = "",
    endDate = "",
    onChange,
    onClear,
    placeholder,
    minDate,
    maxDate,
    disabled = false,
    className = "",
    align = "left",
    presets,
    showPresets = true,
}: DateRangePickerProps) {
    const locale = useLocale();
    const isVi = locale === "vi";

    const defaultPlaceholder = isVi ? "Chọn khoảng ngày" : "Select date range";
    const resolvedPlaceholder = placeholder ?? defaultPlaceholder;

    const [open, setOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
    const triggerId = useId();

    // Draft selection state
    const [draftStart, setDraftStart] = useState<string | null>(null);
    const [draftEnd, setDraftEnd] = useState<string | null>(null);
    const [hoveredDate, setHoveredDate] = useState<string | null>(null);

    const activeStart = draftStart !== null ? draftStart : (startDate || "");
    const activeEnd = draftEnd !== null ? draftEnd : (endDate || "");

    // Month view state
    const today = useMemo(() => new Date(), []);
    const initialViewDate = useMemo(() => {
        return parseDateSafe(startDate) || parseDateSafe(endDate) || today;
    }, [startDate, endDate, today]);

    const [viewYear, setViewYear] = useState(initialViewDate.getFullYear());
    const [viewMonth, setViewMonth] = useState(initialViewDate.getMonth());

    // Position calculation with responsive edge flip and viewport clamping
    const updatePosition = useCallback(() => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const isMobile = vw < 640;

        // Dynamic responsive width (fits even small 320px screens)
        const popoverWidth = isMobile ? Math.min(340, vw - 20) : 340;
        const popoverHeight = isMobile ? Math.min(410, vh - 32) : 420;

        // Vertical calculation: flip or clamp inside viewport
        let top = rect.bottom + 8;
        if (top + popoverHeight > vh - 10) {
            if (rect.top - popoverHeight - 8 >= 10) {
                top = rect.top - popoverHeight - 8;
            } else {
                top = Math.max(10, vh - popoverHeight - 10);
            }
        }

        // Horizontal calculation: centered on mobile, aligned on desktop
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

    // Outside click & Escape handlers
    useEffect(() => {
        function handleMouseDown(e: MouseEvent) {
            const target = e.target as Node;
            if (
                popoverRef.current &&
                !popoverRef.current.contains(target) &&
                triggerRef.current &&
                !triggerRef.current.contains(target)
            ) {
                setOpen(false);
            }
        }
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape" && open) {
                setOpen(false);
                triggerRef.current?.focus();
            }
        }
        if (open) {
            document.addEventListener("mousedown", handleMouseDown);
            document.addEventListener("keydown", handleKeyDown);
        }
        return () => {
            document.removeEventListener("mousedown", handleMouseDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open]);

    // Default presets
    const resolvedPresets: DatePreset[] = useMemo(() => {
        if (presets) return presets;
        return [
            {
                label: isVi ? "Hôm nay" : "Today",
                getRange: () => {
                    const str = formatDateSafe(today);
                    return { start: str, end: str };
                },
            },
            {
                label: isVi ? "7 ngày qua" : "Last 7 days",
                getRange: () => {
                    const past = new Date(today);
                    past.setDate(today.getDate() - 6);
                    return {
                        start: formatDateSafe(past),
                        end: formatDateSafe(today),
                    };
                },
            },
            {
                label: isVi ? "30 ngày qua" : "Last 30 days",
                getRange: () => {
                    const past = new Date(today);
                    past.setDate(today.getDate() - 29);
                    return {
                        start: formatDateSafe(past),
                        end: formatDateSafe(today),
                    };
                },
            },
            {
                label: isVi ? "Tuần này" : "This week",
                getRange: () => {
                    const day = today.getDay();
                    const diff = day === 0 ? 6 : day - 1;
                    const mon = new Date(today);
                    mon.setDate(today.getDate() - diff);
                    const sun = new Date(mon);
                    sun.setDate(mon.getDate() + 6);
                    return {
                        start: formatDateSafe(mon),
                        end: formatDateSafe(sun),
                    };
                },
            },
            {
                label: isVi ? "Tháng này" : "This month",
                getRange: () => {
                    const start = new Date(today.getFullYear(), today.getMonth(), 1);
                    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                    return {
                        start: formatDateSafe(start),
                        end: formatDateSafe(end),
                    };
                },
            },
        ];
    }, [presets, isVi, today]);

    function handleToggleOpen() {
        if (disabled) return;
        if (!open) {
            setDraftStart(startDate || "");
            setDraftEnd(endDate || "");
            setHoveredDate(null);
            setOpen(true);
        } else {
            setOpen(false);
        }
    }

    function handlePrevMonth() {
        if (viewMonth === 0) {
            setViewYear((y) => y - 1);
            setViewMonth(11);
        } else {
            setViewMonth((m) => m - 1);
        }
    }

    function handleNextMonth() {
        if (viewMonth === 11) {
            setViewYear((y) => y + 1);
            setViewMonth(0);
        } else {
            setViewMonth((m) => m + 1);
        }
    }

    const calendarMatrix = useMemo(() => {
        return buildCalendarMatrix(viewYear, viewMonth);
    }, [viewYear, viewMonth]);

    function handleDayClick(dayStr: string) {
        if (!activeStart || (activeStart && activeEnd)) {
            setDraftStart(dayStr);
            setDraftEnd("");
            setHoveredDate(null);
        } else if (activeStart && !activeEnd) {
            const d1 = parseDateSafe(activeStart)!;
            const d2 = parseDateSafe(dayStr)!;

            if (isBeforeDay(d2, d1)) {
                setDraftStart(dayStr);
                setDraftEnd(activeStart);
            } else {
                setDraftEnd(dayStr);
            }
            setHoveredDate(null);
        }
    }

    function handleApply() {
        if (activeStart && activeEnd) {
            onChange?.(activeStart, activeEnd);
            setOpen(false);
        } else if (activeStart && !activeEnd) {
            onChange?.(activeStart, activeStart);
            setOpen(false);
        }
    }

    function handleReset() {
        setDraftStart("");
        setDraftEnd("");
        setHoveredDate(null);
        onClear?.();
        setOpen(false);
    }

    function handleApplyPreset(preset: DatePreset) {
        const { start, end } = preset.getRange();
        setDraftStart(start);
        setDraftEnd(end);
        const startDateObj = parseDateSafe(start);
        if (startDateObj) {
            setViewYear(startDateObj.getFullYear());
            setViewMonth(startDateObj.getMonth());
        }
        onChange?.(start, end);
        setOpen(false);
    }

    const hasValue = Boolean(startDate && endDate);
    const triggerLabel = hasValue
        ? `${formatDisplayDate(startDate, locale)} – ${formatDisplayDate(endDate, locale)}`
        : startDate
          ? `${formatDisplayDate(startDate, locale)} – ...`
          : resolvedPlaceholder;

    const monthLabel = useMemo(() => {
        const d = new Date(viewYear, viewMonth, 1);
        return d.toLocaleDateString(isVi ? "vi-VN" : "en-US", {
            month: "long",
            year: "numeric",
        });
    }, [viewYear, viewMonth, isVi]);

    const startObj = parseDateSafe(activeStart);
    const endObj = parseDateSafe(activeEnd);
    const hoverObj = hoveredDate ? parseDateSafe(hoveredDate) : null;

    return (
        <div className={`relative inline-block ${className}`}>
            {/* Trigger Button */}
            <button
                id={triggerId}
                ref={triggerRef}
                type="button"
                aria-haspopup="dialog"
                aria-expanded={open}
                disabled={disabled}
                onClick={handleToggleOpen}
                className={`
                    group flex items-center gap-2.5 rounded-xl border px-3.5 py-2 text-xs font-semibold
                    transition-all duration-300 outline-none select-none cursor-pointer
                    backdrop-blur-xl shadow-glass
                    ${
                        disabled
                            ? "opacity-50 cursor-not-allowed border-border bg-card"
                            : open
                              ? "border-cyan-400/80 bg-cyan-500/10 text-cyan-400 shadow-[0_0_24px_rgba(6,182,212,0.25)]"
                              : hasValue
                                ? "border-cyan-500/40 bg-card/80 text-foreground hover:border-cyan-400/60 hover:bg-card-hover"
                                : "border-border dark:border-white/10 bg-card/60 dark:bg-white/[0.04] text-muted hover:text-foreground hover:border-border-strong hover:bg-card-hover"
                    }
                `}
            >
                <CalendarIcon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                        open || hasValue ? "text-cyan-400" : "text-muted group-hover:text-foreground"
                    }`}
                />
                <span className={`truncate max-w-[200px] ${hasValue ? "text-foreground font-semibold" : "text-muted"}`}>
                    {triggerLabel}
                </span>

                {hasValue && onClear && !disabled && (
                    <span
                        role="button"
                        tabIndex={0}
                        aria-label="Xóa chọn ngày"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleReset();
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.stopPropagation();
                                handleReset();
                            }
                        }}
                        className="ml-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full text-muted hover:bg-white/10 hover:text-white transition"
                    >
                        <X className="h-3 w-3" />
                    </span>
                )}
            </button>

            {/* Calendar Popover */}
            {open &&
                createPortal(
                    <div
                        ref={popoverRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label={resolvedPlaceholder}
                        data-portal="datepicker"
                        style={popoverStyle}
                        className="
                            rounded-2xl border border-white/10 bg-[#0c1322]/95 p-3.5 sm:p-4
                            text-slate-200 shadow-[0_24px_60px_rgba(0,0,0,0.7)]
                            backdrop-blur-2xl ring-1 ring-white/10
                            animate-in fade-in zoom-in-95 duration-200
                            max-h-[calc(100dvh-20px)] overflow-y-auto flex flex-col scrollbar-dropdown
                        "
                    >
                        {/* Quick Presets (horizontal scroll on mobile to save vertical space) */}
                        {showPresets && resolvedPresets.length > 0 && (
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-2.5 border-b border-white/10 no-scrollbar scrollbar-none">
                                {resolvedPresets.map((preset) => (
                                    <button
                                        key={preset.label}
                                        type="button"
                                        onClick={() => handleApplyPreset(preset)}
                                        className="
                                            shrink-0 rounded-lg border border-white/5 bg-white/[0.03]
                                            px-2.5 py-1 text-[11px] font-medium text-slate-400
                                            transition-all duration-200 cursor-pointer
                                            hover:border-cyan-500/40 hover:bg-cyan-500/10 hover:text-cyan-300
                                            active:scale-95
                                        "
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Month Header */}
                        <div className="flex items-center justify-between mb-3 px-1">
                            <button
                                type="button"
                                onClick={handlePrevMonth}
                                aria-label="Tháng trước"
                                className="
                                    flex h-7 w-7 items-center justify-center rounded-lg
                                    border border-white/10 bg-white/[0.04] text-slate-400
                                    transition-all hover:bg-white/10 hover:text-white hover:border-white/20
                                    active:scale-90 cursor-pointer
                                "
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                                {monthLabel}
                            </h4>

                            <button
                                type="button"
                                onClick={handleNextMonth}
                                aria-label="Tháng sau"
                                className="
                                    flex h-7 w-7 items-center justify-center rounded-lg
                                    border border-white/10 bg-white/[0.04] text-slate-400
                                    transition-all hover:bg-white/10 hover:text-white hover:border-white/20
                                    active:scale-90 cursor-pointer
                                "
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Weekday Headers */}
                        <div className="grid grid-cols-7 gap-1 mb-1 text-center">
                            {(isVi ? VI_WEEKDAYS : EN_WEEKDAYS).map((day) => (
                                <div
                                    key={day}
                                    className="text-[10px] font-bold uppercase tracking-wider text-slate-500 py-1"
                                >
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Day Grid */}
                        <div className="grid grid-cols-7 gap-y-1">
                            {calendarMatrix.flatMap((week) =>
                                week.map((cell) => {
                                    const { date, isCurrentMonth, dateStr } = cell;
                                    const isToday = isSameDay(date, today);

                                    const isStart = startObj ? isSameDay(date, startObj) : false;
                                    const isEnd = endObj ? isSameDay(date, endObj) : false;

                                    let isInSelectedRange = false;
                                    if (startObj && endObj) {
                                        isInSelectedRange =
                                            isAfterDay(date, startObj) && isBeforeDay(date, endObj);
                                    }

                                    let isInHoverPreview = false;
                                    if (startObj && !endObj && hoverObj) {
                                        if (isAfterDay(hoverObj, startObj)) {
                                            isInHoverPreview =
                                                isAfterDay(date, startObj) && (isBeforeDay(date, hoverObj) || isSameDay(date, hoverObj));
                                        } else if (isBeforeDay(hoverObj, startObj)) {
                                            isInHoverPreview =
                                                isAfterDay(date, hoverObj) && isBeforeDay(date, startObj);
                                        }
                                    }

                                    const isBeforeMin = minDate
                                        ? isBeforeDay(date, parseDateSafe(minDate)!)
                                        : false;
                                    const isAfterMax = maxDate
                                        ? isAfterDay(date, parseDateSafe(maxDate)!)
                                        : false;
                                    const isCellDisabled = isBeforeMin || isAfterMax;

                                    let cellBg = "";
                                    let textColor = isCurrentMonth
                                        ? "text-slate-200"
                                        : "text-slate-600";

                                    if (isStart && isEnd) {
                                        cellBg =
                                            "bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl shadow-[0_0_14px_rgba(6,182,212,0.4)]";
                                        textColor = "text-white";
                                    } else if (isStart) {
                                        cellBg =
                                            "bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-l-xl shadow-[0_0_14px_rgba(6,182,212,0.4)]";
                                        textColor = "text-white";
                                    } else if (isEnd) {
                                        cellBg =
                                            "bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-r-xl shadow-[0_0_14px_rgba(6,182,212,0.4)]";
                                        textColor = "text-white";
                                    } else if (isInSelectedRange) {
                                        cellBg = "bg-cyan-500/20 text-cyan-200 border-y border-cyan-500/20";
                                        textColor = "text-cyan-200";
                                    } else if (isInHoverPreview) {
                                        cellBg = "bg-cyan-500/10 text-cyan-300 border-y border-dashed border-cyan-500/30";
                                        textColor = "text-cyan-300";
                                    } else {
                                        cellBg = "hover:bg-white/10 hover:text-white rounded-lg";
                                    }

                                    return (
                                        <button
                                            key={dateStr}
                                            type="button"
                                            disabled={isCellDisabled}
                                            onClick={() => handleDayClick(dateStr)}
                                            onMouseEnter={() => {
                                                if (activeStart && !activeEnd) {
                                                    setHoveredDate(dateStr);
                                                }
                                            }}
                                            className={`
                                                relative flex h-8 w-full items-center justify-center text-xs
                                                transition-all duration-150 cursor-pointer select-none
                                                ${cellBg} ${textColor}
                                                ${isCellDisabled ? "opacity-25 cursor-not-allowed pointer-events-none" : ""}
                                            `}
                                        >
                                            {date.getDate()}
                                            {isToday && !isStart && !isEnd && (
                                                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-cyan-400" />
                                            )}
                                        </button>
                                    );
                                }),
                            )}
                        </div>

                        {/* Footer & Actions */}
                        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                            <div className="text-[11px] font-medium text-slate-400 truncate">
                                {activeStart ? (
                                    <span>
                                        {formatDisplayDate(activeStart, locale)}
                                        {activeEnd && ` – ${formatDisplayDate(activeEnd, locale)}`}
                                    </span>
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
                                        text-slate-400 transition hover:bg-white/5 hover:text-white cursor-pointer
                                    "
                                >
                                    <RotateCcw className="h-3 w-3" />
                                    {isVi ? "Đặt lại" : "Reset"}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleApply}
                                    disabled={!activeStart}
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
    );
}

// ==========================================
// Single DatePicker Component
// ==========================================

export function DatePicker({
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
}: DatePickerProps) {
    const locale = useLocale();
    const isVi = locale === "vi";

    const defaultPlaceholder = isVi ? "Chọn ngày" : "Select date";
    const resolvedPlaceholder = placeholder ?? defaultPlaceholder;

    const [open, setOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
    const triggerId = useId();

    const today = useMemo(() => new Date(), []);
    const initialViewDate = useMemo(() => {
        return parseDateSafe(value) || today;
    }, [value, today]);

    const [viewYear, setViewYear] = useState(initialViewDate.getFullYear());
    const [viewMonth, setViewMonth] = useState(initialViewDate.getMonth());

    const updatePosition = useCallback(() => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const isMobile = vw < 640;

        const popoverWidth = isMobile ? Math.min(300, vw - 20) : 300;
        const popoverHeight = isMobile ? Math.min(350, vh - 32) : 360;

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

    useEffect(() => {
        function handleMouseDown(e: MouseEvent) {
            const target = e.target as Node;
            if (
                popoverRef.current &&
                !popoverRef.current.contains(target) &&
                triggerRef.current &&
                !triggerRef.current.contains(target)
            ) {
                setOpen(false);
            }
        }
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape" && open) {
                setOpen(false);
                triggerRef.current?.focus();
            }
        }
        if (open) {
            document.addEventListener("mousedown", handleMouseDown);
            document.addEventListener("keydown", handleKeyDown);
        }
        return () => {
            document.removeEventListener("mousedown", handleMouseDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open]);

    const calendarMatrix = useMemo(() => {
        return buildCalendarMatrix(viewYear, viewMonth);
    }, [viewYear, viewMonth]);

    const selectedObj = parseDateSafe(value);

    function handleDayClick(dayStr: string) {
        onChange?.(dayStr);
        setOpen(false);
    }

    const monthLabel = useMemo(() => {
        const d = new Date(viewYear, viewMonth, 1);
        return d.toLocaleDateString(isVi ? "vi-VN" : "en-US", {
            month: "long",
            year: "numeric",
        });
    }, [viewYear, viewMonth, isVi]);

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
                                      ? "border-border text-foreground hover:border-border-strong hover:bg-card-hover"
                                      : "border-border dark:border-white/10 bg-card/60 dark:bg-white/[0.04] text-muted hover:text-foreground hover:border-border-strong"
                        }
                    `}
                >
                    <div className="flex items-center gap-2 truncate">
                        <CalendarIcon
                            className={`h-4 w-4 shrink-0 transition-colors ${
                                open || value ? "text-cyan-400" : "text-muted group-hover:text-foreground"
                            }`}
                        />
                        <span className={value ? "text-foreground font-medium truncate" : "text-muted/60 truncate"}>
                            {value ? formatDisplayDate(value, locale) : resolvedPlaceholder}
                        </span>
                    </div>

                    {value && onClear && !disabled && (
                        <span
                            role="button"
                            tabIndex={0}
                            aria-label="Xóa chọn ngày"
                            onClick={(e) => {
                                e.stopPropagation();
                                onClear();
                            }}
                            className="flex h-4 w-4 items-center justify-center rounded-full text-muted hover:bg-white/10 hover:text-white transition"
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
                            data-portal="datepicker"
                            style={popoverStyle}
                            className="
                                rounded-2xl border border-white/10 bg-[#0c1322]/95 p-3.5
                                text-slate-200 shadow-[0_24px_60px_rgba(0,0,0,0.7)]
                                backdrop-blur-2xl ring-1 ring-white/10
                                animate-in fade-in zoom-in-95 duration-200
                                max-h-[calc(100dvh-20px)] overflow-y-auto flex flex-col scrollbar-dropdown
                            "
                        >
                            {/* Month Header */}
                            <div className="flex items-center justify-between mb-3 px-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (viewMonth === 0) {
                                            setViewYear((y) => y - 1);
                                            setViewMonth(11);
                                        } else setViewMonth((m) => m - 1);
                                    }}
                                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-400 hover:bg-white/10 hover:text-white transition"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
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
                                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-400 hover:bg-white/10 hover:text-white transition"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Weekdays */}
                            <div className="grid grid-cols-7 gap-1 mb-1 text-center">
                                {(isVi ? VI_WEEKDAYS : EN_WEEKDAYS).map((day) => (
                                    <div
                                        key={day}
                                        className="text-[10px] font-bold uppercase tracking-wider text-slate-500 py-1"
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Grid */}
                            <div className="grid grid-cols-7 gap-1">
                                {calendarMatrix.flatMap((week) =>
                                    week.map((cell) => {
                                        const { date, isCurrentMonth, dateStr } = cell;
                                        const isToday = isSameDay(date, today);
                                        const isSelected = selectedObj
                                            ? isSameDay(date, selectedObj)
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
                                                onClick={() => handleDayClick(dateStr)}
                                                className={`
                                                    relative flex h-8 w-8 items-center justify-center rounded-lg text-xs
                                                    transition-all duration-150 cursor-pointer select-none mx-auto
                                                    ${
                                                        isSelected
                                                            ? "bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                                                            : isCurrentMonth
                                                              ? "text-slate-200 hover:bg-white/10 hover:text-white"
                                                              : "text-slate-600 hover:bg-white/5"
                                                    }
                                                    ${isCellDisabled ? "opacity-25 cursor-not-allowed pointer-events-none" : ""}
                                                `}
                                            >
                                                {date.getDate()}
                                                {isToday && !isSelected && (
                                                    <span className="absolute bottom-1 h-1 w-1 rounded-full bg-cyan-400" />
                                                )}
                                            </button>
                                        );
                                    }),
                                )}
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

export default DatePicker;
