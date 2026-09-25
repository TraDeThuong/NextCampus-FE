"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            gutter={12}
            toastOptions={{
                duration: 3500,

                className: `
                    relative
                    overflow-hidden

                    !min-w-[280px]
                    sm:!min-w-[360px]
                    !max-w-[calc(100vw-2rem)]
                    !min-h-[58px]

                    !rounded-2xl

                    !border
                    !border-slate-200/90
                    dark:!border-white/15

                    !bg-white/95
                    dark:!bg-primary-dark/95
                    backdrop-blur-xl

                    !text-slate-900
                    dark:!text-white

                    font-medium
                    text-sm

                    !shadow-[0_10px_30px_rgba(15,23,42,0.08),0_2px_8px_rgba(15,23,42,0.04)]
                    dark:!shadow-glass

                    before:absolute
                    before:left-0
                    before:right-0
                    before:top-0
                    before:h-px
                    before:bg-gradient-to-r
                    before:from-transparent
                    before:via-primary-light/50
                    dark:before:via-white/70
                    before:to-transparent

                    after:absolute
                    after:inset-0
                    after:pointer-events-none
                    after:bg-[radial-gradient(circle_at_top,rgba(0,79,158,0.04),transparent_70%)]
                    dark:after:bg-[radial-gradient(circle_at_top,rgba(255,255,255,.12),transparent_70%)]

                    transition-all
                    duration-300

                    hover:scale-[1.02]
                    hover:!border-slate-300
                    dark:hover:!border-white/25
                    hover:!shadow-[0_14px_36px_rgba(15,23,42,0.12),0_4px_12px_rgba(15,23,42,0.06)]
                    dark:hover:!shadow-[0_0_30px_rgba(21,174,245,.25)]
                `,

                success: {
                    iconTheme: {
                        primary: "#10B981",
                        secondary: "#fff",
                    },
                },

                error: {
                    iconTheme: {
                        primary: "#EF4444",
                        secondary: "#fff",
                    },
                },

                loading: {
                    iconTheme: {
                        primary: "#15aef5",
                        secondary: "rgba(21, 174, 245, 0.2)",
                    },
                },
            }}
        />
    );
}