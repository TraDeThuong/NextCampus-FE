"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import type { AbstractIntlMessages } from "next-intl";

type AllMessages = Record<string, AbstractIntlMessages>;

interface LocaleContextValue {
  locale: string;
  setLocale: (locale: string) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function useLocaleSwitcher() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocaleSwitcher must be used within LocaleProvider");
  }
  return ctx;
}

export default function LocaleProvider({
  children,
  initialLocale,
  allMessages,
}: {
  children: ReactNode;
  initialLocale: string;
  allMessages: AllMessages;
}) {
  const [locale, setLocaleState] = useState(initialLocale);
  const router = useRouter();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback(
    (newLocale: string) => {
      if (newLocale === locale) return;

      document.documentElement.lang = newLocale;
      setLocaleState(newLocale);

      // Save to cookies for SSR / server components persistence
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
      document.cookie = `locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

      router.refresh();
    },
    [locale, router],
  );

  const messages = allMessages[locale] ?? {};

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}
