import OnboardingHeader from "./OnboardingHeader";
import OnboardingStats from "./OnboardingStats";
import OnboardingFilters from "./OnboardingFilters";
import OnboardingTable from "./OnboardingTable";

export default function OnboardingPage() {
    return (
        <div className="space-y-8">
            <OnboardingHeader />
            <OnboardingStats />
            <OnboardingFilters />
            <OnboardingTable />
        </div>
    );
}