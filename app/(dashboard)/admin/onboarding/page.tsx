import { Suspense } from "react";
import OnboardingHeader from "./OnboardingHeader";
import OnboardingStats from "./OnboardingStats";
import OnboardingFilters from "./OnboardingFilters";
import OnboardingTable from "./OnboardingTable";
import Spinner from "@/components/ui/Spinner";
import MetalCard from "@/components/ui/MetalCard";

export default function OnboardingPage() {
  return (
    <div className="space-y-8">
      <OnboardingHeader />
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
