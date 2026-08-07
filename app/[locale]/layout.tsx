import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import ToastProvider from "@/providers/ToastProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
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

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ReactQueryProvider>
        <AuthProvider>
          {children}
          <ToastProvider />
        </AuthProvider>
      </ReactQueryProvider>
    </NextIntlClientProvider>
  );
}