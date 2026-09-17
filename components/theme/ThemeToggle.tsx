"use client";

import { useEffect, useState, useRef, useSyncExternalStore } from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import { useTranslations } from "next-intl";

type ThemeMode = "light" | "dark" | "system";

function applyTheme(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  if (mode === "dark") {
    document.documentElement.classList.add("dark");
  } else if (mode === "light") {
    document.documentElement.classList.remove("dark");
  } else {
    // system
    const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (isSystemDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    media.removeEventListener("change", callback);
  };
}

function getSnapshot(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  try {
    return (localStorage.getItem("nexcampus-theme") as ThemeMode) || "dark";
  } catch {
    return "dark";
  }
}

function getServerSnapshot(): ThemeMode {
  return "dark";
}

export default function ThemeToggle() {
  const t = useTranslations("header.theme");
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Synchronize DOM classes when theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectTheme = (mode: ThemeMode) => {
    try {
      localStorage.setItem("nexcampus-theme", mode);
    } catch {}
    applyTheme(mode);
    window.dispatchEvent(new Event("storage"));
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={t("toggle")}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light"
      >
        {theme === "light" ? (
          <Sun className="h-4 w-4 text-amber-400 transition-transform duration-200 rotate-0 scale-100" />
        ) : theme === "dark" ? (
          <Moon className="h-4 w-4 text-sky-400 transition-transform duration-200 rotate-0 scale-100" />
        ) : (
          <Laptop className="h-4 w-4 text-emerald-400 transition-transform duration-200 rotate-0 scale-100" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-36 rounded-2xl border border-white/10 bg-[#0c1222]/95 p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl z-50 animate-fadeIn">
          <button
            type="button"
            onClick={() => handleSelectTheme("light")}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition cursor-pointer ${
              theme === "light"
                ? "bg-primary-main/20 text-white font-semibold"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Sun className="h-3.5 w-3.5 text-amber-400" />
            <span>{t("light")}</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectTheme("dark")}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition cursor-pointer ${
              theme === "dark"
                ? "bg-primary-main/20 text-white font-semibold"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Moon className="h-3.5 w-3.5 text-sky-400" />
            <span>{t("dark")}</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectTheme("system")}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition cursor-pointer ${
              theme === "system"
                ? "bg-primary-main/20 text-white font-semibold"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Laptop className="h-3.5 w-3.5 text-emerald-400" />
            <span>{t("system")}</span>
          </button>
        </div>
      )}
    </div>
  );
}
