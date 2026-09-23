"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
} from "react";
import { createPortal } from "react-dom";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { ChevronDown, Check } from "lucide-react";

export interface SortOption {
  sortBy: string;
  order: string;
  label: string;
}

export interface SortSelectProps {
  label: string;
  options: SortOption[];
  sortByField?: string;
  orderField?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function SortSelect({
  label,
  options,
  sortByField = "sortBy",
  orderField = "order",
  placeholder,
  disabled = false,
  className = "",
}: SortSelectProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const currentSortBy = searchParams.get(sortByField) ?? "";
  const currentOrder = searchParams.get(orderField) ?? "";

  const currentValue = currentSortBy && currentOrder
    ? `${currentSortBy}:${currentOrder}`
    : "";

  const selectedOption = options.find(
    (o) => `${o.sortBy}:${o.order}` === currentValue,
  ) ?? (currentValue === "" ? options[0] : undefined);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const triggerId = useId();
  const listboxId = useId();

  const selectedIndex = Math.max(
    0,
    options.findIndex(
      (opt) => `${opt.sortBy}:${opt.order}` === currentValue,
    ),
  );

  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const ESTIMATED_HEIGHT = 280;
      const vh = window.innerHeight;
      const spaceBelow = vh - rect.bottom;
      const spaceAbove = rect.top;
      const openUpward = spaceBelow < ESTIMATED_HEIGHT && spaceAbove > spaceBelow;
      const maxHeight = openUpward
        ? Math.min(320, Math.max(120, spaceAbove - 16))
        : Math.min(320, Math.max(120, spaceBelow - 16));

      setDropdownStyle({
        position: "fixed",
        top: openUpward ? undefined : rect.bottom + 8,
        bottom: openUpward ? vh - rect.top + 8 : undefined,
        left: rect.left,
        width: Math.max(rect.width, 220),
        maxHeight,
        zIndex: 9999,
      });
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();

    function handleOutside(e: MouseEvent | TouchEvent) {
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

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside, { passive: true });

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [open, updatePosition]);

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      const [sortBy, order] = value.split(":");
      params.set(sortByField, sortBy);
      params.set(orderField, order);
    } else {
      params.delete(sortByField);
      params.delete(orderField);
    }

    if (params.get("page")) {
      params.set("page", "1");
    }

    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  }

  function focusOption(index: number) {
    const nextIndex = (index + options.length) % options.length;
    setActiveIndex(nextIndex);
    optionRefs.current[nextIndex]?.focus();
  }

  function openDropdown() {
    setActiveIndex(selectedIndex);
    setOpen(true);
    requestAnimationFrame(() => {
      optionRefs.current[selectedIndex]?.focus();
    });
  }

  function closeDropdown() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div className={`flex w-full flex-col gap-3 ${className}`}>
      <label
        htmlFor={triggerId}
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
          id={triggerId}
          ref={triggerRef}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          onClick={() => {
            if (disabled) return;
            if (open) {
              setOpen(false);
            } else {
              openDropdown();
            }
          }}
          onKeyDown={(event) => {
            if (
              !disabled &&
              (event.key === "ArrowDown" || event.key === "ArrowUp")
            ) {
              event.preventDefault();
              openDropdown();
            }
          }}
          disabled={disabled}
          className={`flex h-[46px] w-full items-center justify-between rounded-2xl border border-border bg-card px-5 text-sm font-medium shadow-glass backdrop-blur-xl transition-all duration-300 outline-none ${
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
              selectedOption ? "text-foreground truncate text-left" : "text-muted"
            }
          >
            {selectedOption?.label ?? placeholder ?? label}
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-muted transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              id={listboxId}
              ref={dropdownRef}
              role="listbox"
              aria-label={label}
              style={dropdownStyle}
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
              className="rounded-2xl border border-border bg-card/95 dark:border-white/10 dark:bg-[#0c1322]/95 p-1.5 shadow-xl dark:shadow-[0_16px_48px_rgba(0,0,0,.6)] backdrop-blur-2xl animate-fadeIn"
            >
              <div className="max-h-[260px] overflow-y-auto scrollbar-dropdown">
                {options.map((opt, index) => {
                  const optVal = `${opt.sortBy}:${opt.order}`;
                  const isSelected =
                    optVal === currentValue ||
                    (currentValue === "" && index === 0);
                  return (
                    <button
                      ref={(element) => {
                        optionRefs.current[index] = element;
                      }}
                      key={optVal}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      tabIndex={index === activeIndex ? 0 : -1}
                      onClick={() => {
                        handleChange(optVal);
                        triggerRef.current?.focus();
                      }}
                      className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors cursor-pointer ${
                        isSelected
                          ? "text-primary-main dark:text-cyan-400 bg-primary-main/10 dark:bg-cyan-400/10 font-medium"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <span className="flex-1 truncate text-left">
                        {opt.label}
                      </span>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 shrink-0 text-primary-main dark:text-cyan-400" />
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
