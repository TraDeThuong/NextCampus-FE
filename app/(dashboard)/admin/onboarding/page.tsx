import { Suspense } from "react";
import OnboardingPageContent from "./OnboardingPageContent";
import Spinner from "@/components/ui/Spinner";

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      }
    >
      <OnboardingPageContent />
    </Suspense>
  );
}
