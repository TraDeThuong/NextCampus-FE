"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

export default function LoginHeader() {
    const t = useTranslations("auth");

    return (
        <div className="text-center">
            <Image
                src="/logo.png"
                alt="Logo"
                width={598}
                height={500}
                className="mx-auto"
                style={{ height: "72px", width: "auto" }}
                priority
            />

            <h1 className="mt-6 text-3xl font-bold metal-text">
                {t("welcomeBack")}
            </h1>

            <p className="mt-2 text-sm text-muted">
                {t("welcomeSub")}
            </p>
        </div>
    );
}