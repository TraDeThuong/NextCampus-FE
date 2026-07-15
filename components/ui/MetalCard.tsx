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
                group relative overflow-hidden

                rounded-[28px]

                border border-white/10

                bg-[linear-gradient(145deg,#101827_0%,#1a2235_20%,#0f172a_55%,#050816_100%)]

                shadow-[0_12px_40px_rgba(0,0,0,.45)]

                transition-all duration-500

                hover:-translate-y-1
                hover:border-cyan-400/20
                hover:shadow-[0_16px_36px_rgba(21,174,245,.12)]

                ${className}
            `}
        >
            {/* Metallic base */}

            <div
                className="
                    absolute inset-0

                    bg-[linear-gradient(
                        135deg,
                        rgba(255,255,255,.10) 0%,
                        rgba(255,255,255,.03) 18%,
                        transparent 40%,
                        rgba(255,255,255,.02) 70%,
                        rgba(0,0,0,.25) 100%
                    )]
                "
            />

            {/* Chrome line top */}

            <div
                className="
                    absolute left-6 right-6 top-0 h-px

                    bg-gradient-to-r
                    from-transparent
                    via-white/90
                    to-transparent
                "
            />

            {/* Blue edge glow */}

            <div
                className="
                    absolute inset-0

                    opacity-0

                    transition-opacity
                    duration-500

                    group-hover:opacity-100

                    bg-[radial-gradient(circle_at_top,rgba(21,174,245,.08),transparent_40%)]
                "
            />

            {/* Metallic reflection */}

            <div
                className="
                    absolute
                    -left-[40%]
                    top-0

                    h-full
                    w-[30%]

                    -skew-x-[20deg]

                    bg-white/10

                    blur-2xl

                    opacity-0

                    transition-all
                    duration-1000

                    group-hover:left-[130%]
                    group-hover:opacity-100
                "
            />

            {/* Inner border */}

            <div
                className="
                    absolute inset-[1px]

                    rounded-[27px]

                    border border-white/5
                "
            />

            {/* Content */}

            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}