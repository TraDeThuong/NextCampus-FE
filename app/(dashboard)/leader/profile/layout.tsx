import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hồ sơ cá nhân",
};

export default function LeaderProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
