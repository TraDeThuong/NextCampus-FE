import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("intern.profile.metaTitle") };
}

export default function InternProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
