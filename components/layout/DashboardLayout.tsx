"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";
import Header from "./Header";

type Props = {
  children: React.ReactNode;
  sidebar: React.ReactNode;
};

export default function DashboardLayout({ children, sidebar }: Props) {
  const pathname = usePathname();
  const role = pathname.split("/")[1]?.toUpperCase() || "ROLE";
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Auto-close sidebar on route change
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMobileOpen(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className="relative h-screen overflow-hidden bg-background text-foreground">
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div className="flex h-screen">
        {/* Sidebar Fixed on Desktop / Sliding Drawer on Mobile */}
        <aside
          className={`
            fixed left-0 top-0 z-40 flex h-screen w-30 shrink-0 flex-col overflow-y-auto no-scrollbar
            border-r border-white/10 px-6 py-8 backdrop-blur-2xl shadow-2xl transition-transform duration-300
            bg-background/95 md:bg-white/5
            ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}
        >
          {/* Logo */}
          <div className="mb-10 flex flex-col items-center gap-3">
            <Image
              src="/logo.png"
              alt="NextAura Logo"
              width={598}
              height={500}
              style={{ height: "40px", width: "auto" }}
              priority
            />
            <h1 className="metal-text text-sm font-bold tracking-wide">
              NEXTAURA
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1">{sidebar}</nav>
        </aside>

        {/* Main Wrapper */}
        <div className="ml-0 md:ml-30 flex flex-1 flex-col min-w-0">
          {/* Header Fixed */}
          <div className="fixed left-0 md:left-30 right-0 top-0 z-20">
            <Header role={role} onMenuClick={() => setIsMobileOpen((prev) => !prev)} />
          </div>

          {/* Scrollable Content */}
          <main className="mt-20 min-w-0 flex-1 overflow-y-auto p-4 md:p-8">
            <div className="min-h-full min-w-0 rounded-2xl md:rounded-3xl border border-white/10 bg-white/5 p-4 md:p-6 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
