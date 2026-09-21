"use client";

import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import OnboardingHeader from "./OnboardingHeader";
import OnboardingStats from "./OnboardingStats";
import OnboardingFilters from "./OnboardingFilters";
import OnboardingTable from "./OnboardingTable";
import ApplicationDetail from "./ApplicationDetailModal";

const ApplicationDetailOverlay = dynamic(
  () => import("./ApplicationDetailOverlay"),
  { ssr: false },
);

export default function OnboardingPageContent() {
  const t = useTranslations();
  const searchParams = useSearchParams();

  const id = searchParams.get("Id");
  const view = searchParams.get("view");

  const content = (() => {
    // Direct access (no modal flag): full-page detail
    if (id && view !== "modal") {
      return (
        <div className="space-y-6">
          <Link
            href="/admin/onboarding"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground transition-all py-2 px-3.5 rounded-xl border border-border/60 dark:border-white/10 bg-card/60 hover:bg-card active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan-500/50"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            {t("admin.onboarding.backToOnboarding")}
          </Link>

          <ApplicationDetail id={id} />
        </div>
      );
    }

    // Modal overlay (navigated from list)
    if (id && view === "modal") {
      return (
        <>
          <div className="space-y-6">
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
      <div className="space-y-6">
        <OnboardingHeader />
        <OnboardingStats />
        <OnboardingFilters />
        <OnboardingTable />
      </div>
    );
  })();

  return (
    <ProtectedRoute
      requiredPermissions={["APPLICATION_READ", "APPLICATION_INVITE_READ"]}
      permissionMode="ANY"
    >
      {content}
    </ProtectedRoute>
  );
}
