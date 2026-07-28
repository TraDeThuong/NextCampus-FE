"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/auth/useAuth";
import { useLogout } from "@/hooks/auth/useLogout";
import Spinner from "../ui/Spinner";
import NotificationBell from "../notification/NotificationBell";

type HeaderProps = {
  role: string;
};

export default function Header({ role }: HeaderProps) {
    const [language, setLanguage] = useState<"vn" | "en">("vn");
    const { state } = useAuth();
    const { logoutMutate, isLoading } = useLogout();
    const toggleLanguage = () => {
        setLanguage((prev) => (prev === "vn" ? "en" : "vn"));
    };

    const handleLogout = () => {
        logoutMutate();
    };

  return (
    <>
      {/* FULL PAGE SPINNER: Shown while logging out */}
      {typeof document !== "undefined" && isLoading && createPortal(
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md">
          <Spinner size="lg" />
          <p className="mt-4 text-white/80 text-sm font-medium tracking-wide animate-pulse">
            Logging out, please wait...
          </p>
        </div>,
        document.body
      )}

      <header className="sticky top-0 z-20 h-20 border-b border-white/10 bg-white/5 backdrop-blur-xl px-8 flex items-center justify-between">
        {/* Title */}
        <div>
          <h2 className="text-xl metal-text font-semibold tracking-wide">
            {role} DASHBOARD
          </h2>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-6">
          {/* Language Switch */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition cursor-pointer"
          >
            <span className="text-2xl">
              {language === "vn" ? "🇻🇳" : "🇺🇸"}
            </span>
            <span>
              {language === "vn" ? "VN" : "EN"}
            </span>
          </button>

          {/* Notification Bell */}
          <NotificationBell />

          {/* Profile */}
          <Link
            href={`/${role.toLowerCase()}/profile`}
            className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-lg transition hover:bg-white/10 cursor-pointer"
          >
            {state.user?.avatarUrl ? (
              <Image
                src={state.user.avatarUrl}
                alt={state.user.fullName ?? "User"}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-primary-main to-primary-light">
                <User className="h-5 w-5 text-white" />
              </div>
            )}
            <p className="text-lg font-medium metal-text">
              {state.user?.fullName ?? "User"}
            </p>
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="
                flex items-center justify-center
                w-11 h-11 rounded-xl
                border border-white/10
                bg-white/10
                backdrop-blur-lg
                text-white/70
                transition-all duration-300
                hover:bg-red-500/20
                hover:text-red-400
                cursor-pointer
            "
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>
    </>
  );
}
