import LanguageToggle from "@/components/layout/LanguageToggle";
import ThemeToggle from "@/components/theme/ThemeToggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-layout relative min-h-screen flex flex-col items-center justify-center bg-background text-foreground transition-colors duration-200 px-4 py-12">
      {/* Top action bar: Theme Toggle first, then Language Toggle */}
      <div className="absolute right-4 top-4 z-50 flex items-center gap-2 sm:right-6 sm:top-6">
        <ThemeToggle />
        <LanguageToggle />
      </div>

      {children}
    </div>
  );
}