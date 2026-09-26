import { Be_Vietnam_Pro, Black_Ops_One, Saira_Stencil_One, Ubuntu } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import { loadLocaleMessages } from "@/i18n/load-messages";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import ToastProvider from "@/providers/ToastProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import LocaleProvider from "@/providers/LocaleProvider";
import { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "NexCampus - Hệ thống Quản lý Thực tập sinh",
    template: "%s | NexCampus",
  },
  description: "Hệ thống quản lý thực tập sinh và theo dõi tiến độ công việc NexCampus.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

const headingFont = Black_Ops_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-heading",
});

const headingFontVi = Saira_Stencil_One({
  subsets: ["latin", "vietnamese"],
  weight: "400",
  variable: "--font-heading-vi",
});

const bodyFont = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-body",
});

const bodyFontVi = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-body-vi",
});

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const rawLocale = cookieStore.get("NEXT_LOCALE")?.value || cookieStore.get("locale")?.value || "vi";
  const initialLocale = rawLocale === "en" ? "en" : "vi";

  const [viMessages, enMessages] = await Promise.all([
    loadLocaleMessages("vi"),
    loadLocaleMessages("en"),
  ]);

  const rawTheme = cookieStore.get("nexcampus-theme")?.value || cookieStore.get("theme")?.value;
  const isLight = rawTheme === "light";
  const initialThemeClass = isLight ? "" : "dark";

  return (
    <html
      lang={initialLocale}
      className={`${initialThemeClass} ${headingFont.variable} ${headingFontVi.variable} ${bodyFont.variable} ${bodyFontVi.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('nexcampus-theme') || localStorage.getItem('theme');
                  if (!theme) {
                    var match = document.cookie.match(/(?:^|; )nexcampus-theme=([^;]*)/);
                    if (match) theme = decodeURIComponent(match[1]);
                  }
                  if (!theme) theme = 'system';
                  var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <LocaleProvider
          initialLocale={initialLocale}
          allMessages={{ vi: viMessages, en: enMessages }}
        >
          <ReactQueryProvider>
            <AuthProvider>
              {children}
              <ToastProvider />
            </AuthProvider>
          </ReactQueryProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
