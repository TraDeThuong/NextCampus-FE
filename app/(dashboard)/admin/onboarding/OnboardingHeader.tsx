import { Plus, Sparkles } from "lucide-react";
import MetalCard from "@/components/ui/MetalCard";

interface OnboardingHeaderProps {
  onOpenInviteModal: () => void;
}

export default function OnboardingHeader({
  onOpenInviteModal,
}: OnboardingHeaderProps) {
  return (
    <MetalCard className="px-8 py-7">
      {/* Decorative glow blobs */}
      <div className="animate-[floatGlow_7s_ease-in-out_infinite] absolute -left-24 top-0 h-56 w-56 rounded-full bg-(--primary-main)/15 blur-3xl" />
      <div className="animate-[floatGlow_7s_ease-in-out_infinite] absolute -right-20 -bottom-15 h-64 w-64 rounded-full bg-(--primary-light)/10 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left */}
        <div className="max-w-2xl">
          <div
            className="
              mb-4 inline-flex items-center gap-2
              rounded-full
              border border-white/10
              bg-white/5
              px-4 py-2
              text-xs font-medium uppercase tracking-[0.3em]
              text-(--primary-light)
            "
          >
            <Sparkles className="h-3.5 w-3.5" />
            Launchpad
          </div>

          <h1 className="chrome-text metal-text text-4xl font-bold md:text-5xl">
            Onboarding Management
          </h1>
        </div>

        {/* Right */}
        <button
          type="button"
          onClick={onOpenInviteModal}
          className="
            group relative overflow-hidden
            rounded-2xl
            bg-gradient-to-r from-(--primary-main) to-(--primary-light)
            px-6 py-4
            text-sm font-semibold text-white
            shadow-[0_0_35px_rgba(21,174,245,0.25)]
            transition-all duration-500
            hover:-translate-y-1 hover:scale-[1.03]
          "
        >
          <span
            className="
              absolute inset-y-0 -left-24 w-16 rotate-12
              bg-white/30 blur-lg
              transition-all duration-700
              group-hover:left-[130%]
            "
          />
          <span className="relative flex items-center gap-2">
            <Plus className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
            Invite Intern
          </span>
        </button>
      </div>
    </MetalCard>
  );
}
