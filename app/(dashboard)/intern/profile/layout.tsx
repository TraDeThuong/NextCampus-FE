import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hồ sơ cá nhân",
};

export default function InternProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
