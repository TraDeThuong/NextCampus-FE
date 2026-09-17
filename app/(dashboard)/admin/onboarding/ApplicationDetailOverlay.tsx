"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { HiXMark } from "react-icons/hi2";

import ApplicationDetail from "./ApplicationDetailModal";

export default function ApplicationDetailOverlay({ id }: { id: string }) {
  const router = useRouter();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") router.back();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [router]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Application details"
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
      onClick={() => router.back()}
    >
      <div
        className="relative flex max-h-[calc(100vh-3rem)] w-full max-w-[min(94vw,72rem)] flex-col rounded-[2rem] border border-border bg-card p-6 shadow-glass backdrop-blur-2xl sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="pointer-events-none absolute inset-0 rounded-[2rem] border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-light/40 to-transparent" />

        <button
          type="button"
          aria-label="Close application details"
          onClick={() => router.back()}
          className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-card text-muted backdrop-blur-xl transition-all duration-200 hover:border-primary-light/40 hover:bg-card-hover hover:text-foreground hover:shadow-[0_0_20px_rgba(21,174,245,0.15)] focus:outline-none"
        >
          <HiXMark className="h-7 w-7" />
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pt-14 custom-scrollbar">
          <ApplicationDetail id={id} />
        </div>
      </div>
    </div>,
    document.body,
  );
}
