"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { HiXMark } from "react-icons/hi2";

import OnboardingHeader from "./OnboardingHeader";
import OnboardingStats from "./OnboardingStats";
import OnboardingFilters from "./OnboardingFilters";
import OnboardingTable from "./OnboardingTable";
import ApplicationDetail from "./ApplicationDetailModal";
import MetalCard from "@/components/ui/MetalCard";

export default function OnboardingPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = searchParams.get("Id");
  const view = searchParams.get("view");

  // Direct access (no modal flag): full-page detail
  if (id && view !== "modal") {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/onboarding"
          className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Onboarding
        </Link>

        <MetalCard className="p-8">
          <ApplicationDetail id={id} />
        </MetalCard>
      </div>
    );
  }

  // Modal overlay (navigated from list)
  if (id && view === "modal") {
    return (
      <>
        <div className="space-y-8">
          <OnboardingHeader />
          <OnboardingStats />
          <OnboardingFilters />
          <OnboardingTable />
        </div>

        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
          onClick={() => router.back()}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[calc(100vh-4rem)] w-full max-w-[min(96vw,72rem)] overflow-y-auto rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,#101827_0%,#1a2235_20%,#0f172a_55%,#050816_100%)] p-8 shadow-[0_25px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />

            <button
              onClick={() => router.back()}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/10 hover:text-foreground"
            >
              <HiXMark className="h-5 w-5" />
            </button>

            <ApplicationDetail id={id} />
          </div>
        </div>
      </>
    );
  }

  // Default: list only
  return (
    <div className="space-y-8">
      <OnboardingHeader />
      <OnboardingStats />
      <OnboardingFilters />
      <OnboardingTable />
    </div>
  );
}
