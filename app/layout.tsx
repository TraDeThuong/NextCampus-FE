import { Black_Ops_One, Ubuntu } from "next/font/google";
import "./globals.css";

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

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${headingFont.variable} ${bodyFont.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}