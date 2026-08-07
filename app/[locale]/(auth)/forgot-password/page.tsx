import type { Metadata } from "next";
import AuthCard from "@/components/auth/AuthCard";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
    title: "Quên mật khẩu",
};

export default function ForgotPasswordPage() {
    return (
        <AuthCard>
            <ForgotPasswordForm />
        </AuthCard>
    );
}

