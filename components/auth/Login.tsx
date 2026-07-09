"use client";

import LoginForm from "./LoginForm";

export default function Login() {
    return (
        <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-primary-dark p-8 shadow-glass backdrop-blur-md">
            
            <div className="absolute inset-0 rounded-2xl pointer-events-none p-[1.5px] bg-gradient-to-br from-white/30 via-white/5 to-primary-light/40" style={{ content: "''", maskComposite: "exclude", WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "destination-out" }} />

            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-white/[0.04] pointer-events-none" />

            <div className="absolute inset-0 border border-border-strong rounded-2xl pointer-events-none mix-blend-overlay" />

            <div className="relative z-10">
                <LoginForm />
            </div>
        </div>
    );
}