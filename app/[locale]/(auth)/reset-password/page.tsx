import type { Metadata } from "next";
import { Suspense } from "react";
import AuthCard from "@/components/auth/AuthCard";
import Spinner from "@/components/ui/Spinner";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
    title: "Đặt lại mật khẩu",
};

export default function ResetPasswordPage() {
    return (
        <AuthCard>
            <Suspense fallback={
                <div className="flex items-center justify-center py-8">
                    <Spinner />
                </div>
            }>
                <ResetPasswordForm />
            </Suspense>
        </AuthCard>
    );
}

