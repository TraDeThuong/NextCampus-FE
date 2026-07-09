"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

type HeaderProps = {
  role: string;
};

export default function Header({ role }: HeaderProps) {
    const [language, setLanguage] = useState<"vn" | "en">("vn");
    const router = useRouter();

    const toggleLanguage = () => {
        setLanguage((prev) => (prev === "vn" ? "en" : "vn"));
    };

    const handleLogout = () => {
        router.push("/login");
    };

  return (
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
          className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition"
        >
          <span className="text-2xl">
            {language === "vn" ? "🇻🇳" : "🇺🇸"}
          </span>
          <span>
            {language === "vn" ? "VN" : "EN"}
          </span>
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-lg">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-main to-primary-light" />
          <p className="text-lg font-medium metal-text">
            Huynh Thanh Tra
          </p>
        </div>

        {/* Logout */}
        <button
            onClick={handleLogout}
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
            "
            >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}