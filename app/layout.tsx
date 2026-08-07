import { Be_Vietnam_Pro, Black_Ops_One, Saira_Stencil_One, Ubuntu } from "next/font/google";
import "./globals.css";
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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="vi"
      className={`${headingFont.variable} ${headingFontVi.variable} ${bodyFont.variable} ${bodyFontVi.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
