"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import React from "react";
import Header from "./Header";

type Props = {
  children: React.ReactNode;
  sidebar: React.ReactNode;
};

export default function DashboardLayout({ children, sidebar }: Props) {
  const pathname = usePathname();
  const role = pathname.split("/")[1]?.toUpperCase() || "ROLE";

  return (
    <div className="relative h-screen overflow-hidden bg-background text-foreground">
      <div className="flex h-screen">
        {/* Sidebar Fixed */}
        <aside className="fixed left-0 top-0 z-30 flex h-screen w-30 shrink-0 flex-col overflow-y-auto no-scrollbar border-r border-white/10 bg-white/5 px-6 py-8 backdrop-blur-2xl shadow-2xl">
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
        <div className="ml-30 flex flex-1 flex-col">
          {/* Header Fixed */}
          <div className="fixed left-30 right-0 top-0 z-20">
            <Header role={role} />
          </div>

          {/* Scrollable Content */}
          <main className="mt-20 flex-1 overflow-y-auto p-8">
            <div className="min-h-full rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}