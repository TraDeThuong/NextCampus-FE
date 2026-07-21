import type { Metadata } from "next";
import { Suspense } from "react";
import AuthCard from "@/components/auth/AuthCard";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
    title: "Đặt lại mật khẩu",
};

export default function ResetPasswordPage() {
    return (
        <AuthCard>
            <Suspense fallback={
                <div className="flex items-center justify-center py-8">
                    <svg className="animate-spin h-6 w-6 text-primary-light" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                </div>
            }>
                <ResetPasswordForm />
            </Suspense>
        </AuthCard>
    );
}

