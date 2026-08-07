"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
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

  const setLocale = useCallback(
    (newLocale: string) => {
      if (newLocale === locale) return;

      setLocaleState(newLocale);

      // Update URL without full navigation
      const pathname = window.location.pathname;
      const url = new URL(window.location.href);

      // Remove existing locale prefix if present
      const segments = pathname.split("/").filter(Boolean);
      const knownLocales = ["vi", "en"];
      if (knownLocales.includes(segments[0])) {
        segments.shift();
      }

      // Build new path with the new locale prefix
      let newPath = `/${newLocale}`;
      if (segments.length > 0) {
        newPath += `/${segments.join("/")}`;
      }

      window.history.replaceState(null, "", newPath + url.search + url.hash);
    },
    [locale],
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
