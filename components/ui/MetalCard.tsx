import { ReactNode } from "react";

interface MetalCardProps {
  children: ReactNode;
  className?: string;
}

export default function MetalCard({
  children,
  className = "",
}: MetalCardProps) {
  return (
    <div
      className={`
        group relative overflow-hidden rounded-3xl border border-white/15
        bg-gradient-to-br
        from-white/10 via-slate-300/10 to-slate-900/80
        backdrop-blur-xl
        transition-all duration-500
        hover:-translate-y-2
        hover:shadow-[0_18px_40px_rgba(0,79,158,0.25)]
        ${className}
      `}
    >
      {/* reflective layer */}
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.18)_0%,transparent_25%,transparent_65%,rgba(255,255,255,0.06)_100%)]" />

      {/* shimmer only on hover */}
      <div
        className="
          absolute top-0 left-[-30%] h-full w-[30%]
          bg-white/20 blur-xl skew-x-[-20deg]
          opacity-0
          group-hover:opacity-100
          group-hover:animate-shimmer
        "
      />

      {/* border shine */}
      <div className="absolute inset-[1px] rounded-3xl border border-white/10" />

      <div className="relative z-10 transition-transform duration-500 group-hover:scale-[1.02]">
        {children}
      </div>
    </div>
  );
}