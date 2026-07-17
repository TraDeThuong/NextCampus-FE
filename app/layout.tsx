import { Black_Ops_One, Ubuntu } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import { ReactNode } from "react";
import ToastProvider from "@/providers/ToastProvider";
import { AuthProvider } from "@/contexts/AuthContext";

const headingFont = Black_Ops_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-heading",
});

const bodyFont = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-body",
});

export default function RootLayout({ children } : {children: ReactNode}) {
  return (
    <html
      lang="en"
      className={`${headingFont.variable} ${bodyFont.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ReactQueryProvider>
          <AuthProvider>
            {children}
            <ToastProvider />
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
