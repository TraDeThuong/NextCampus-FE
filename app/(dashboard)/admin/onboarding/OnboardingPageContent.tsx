"use client";

import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

import OnboardingHeader from "./OnboardingHeader";
import OnboardingStats from "./OnboardingStats";
import OnboardingFilters from "./OnboardingFilters";
import OnboardingTable from "./OnboardingTable";
import ApplicationDetail from "./ApplicationDetailModal";
import MetalCard from "@/components/ui/MetalCard";

const ApplicationDetailOverlay = dynamic(
  () => import("./ApplicationDetailOverlay"),
  { ssr: false },
);

export default function OnboardingPageContent() {
  const searchParams = useSearchParams();

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

        <ApplicationDetailOverlay id={id} />
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
