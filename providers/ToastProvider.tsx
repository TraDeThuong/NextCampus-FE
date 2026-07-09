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

                    !min-w-[360px]
                    !min-h-[60px]

                    !rounded-2xl

                    !border
                    !border-white/15

                    !bg-primary-dark

                    !text-white

                    !shadow-glass

                    before:absolute
                    before:left-0
                    before:right-0
                    before:top-0
                    before:h-px
                    before:bg-gradient-to-r
                    before:from-transparent
                    before:via-white/70
                    before:to-transparent

                    after:absolute
                    after:inset-0
                    after:pointer-events-none
                    after:bg-[radial-gradient(circle_at_top,rgba(255,255,255,.12),transparent_70%)]

                    transition-all
                    duration-300

                    hover:scale-[1.02]
                    hover:border-white/25
                    hover:shadow-[0_0_30px_rgba(21,174,245,.25)]
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
            }}
        />
    );
}