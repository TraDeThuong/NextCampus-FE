import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { loadLocaleMessages } from "@/i18n/load-messages";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import ToastProvider from "@/providers/ToastProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import LocaleProvider from "@/providers/LocaleProvider";
import { ReactNode } from "react";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const [viMessages, enMessages] = await Promise.all([
    loadLocaleMessages("vi"),
    loadLocaleMessages("en"),
  ]);

  return (
    <LocaleProvider
      initialLocale={locale}
      allMessages={{ vi: viMessages, en: enMessages }}
    >
      <ReactQueryProvider>
        <AuthProvider>
          {children}
          <ToastProvider />
        </AuthProvider>
      </ReactQueryProvider>
    </LocaleProvider>
  );
}