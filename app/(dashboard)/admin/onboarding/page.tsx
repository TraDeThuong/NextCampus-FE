"use client"
import { useState } from "react";
import InviteInternModal from "./InviteInternModal";
import OnboardingFilters from "./OnboardingFilters";
import OnboardingHeader from "./OnboardingHeader";
import OnboardingStats from "./OnboardingStats";
import OnboardingTable from "./OnboardingTable";

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

      <OnboardingFilters />

      <OnboardingTable />
    </div>
  );
}
