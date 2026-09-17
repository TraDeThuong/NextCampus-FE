import type { Metadata } from "next";
import Login from "@/components/auth/Login";

export const metadata: Metadata = {
    title: "Đăng nhập",
};

export default function LoginPage() {
    return <Login />;
}