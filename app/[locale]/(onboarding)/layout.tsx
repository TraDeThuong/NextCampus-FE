export default function OnboardingLayout({ children }: { children: React.ReactNode }) { 
    return (
        <div className="onboarding-layout min-h-screen flex flex-col items-center justify-center bg-primary-dark">
            {children}
        </div> )
    }