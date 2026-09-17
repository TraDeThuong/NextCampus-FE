import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("leader.profile.metaTitle") };
}

export default function LeaderProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
