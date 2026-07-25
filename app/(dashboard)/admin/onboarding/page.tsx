"use client";
import { useState, Suspense } from "react";
import InviteInternModal from "./InviteInternModal";
import OnboardingFilters from "./OnboardingFilters";
import OnboardingHeader from "./OnboardingHeader";
import OnboardingStats from "./OnboardingStats";
import OnboardingTable from "./OnboardingTable";
import Spinner from "@/components/ui/Spinner";
import MetalCard from "@/components/ui/MetalCard";

export default function OnboardingPage() {
  const [openInviteModal, setOpenInviteModal] = useState(false);

  return (
    <div className="space-y-8">
      <OnboardingHeader
        onOpenInviteModal={() => setOpenInviteModal(true)}
      />

      <InviteInternModal
        open={openInviteModal}
        onClose={() => setOpenInviteModal(false)}
      />

      <OnboardingStats />

      <Suspense
        fallback={
          <MetalCard className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </MetalCard>
        }
      >
        <OnboardingFilters />

        <OnboardingTable />
      </Suspense>
    </div>
  );
}
