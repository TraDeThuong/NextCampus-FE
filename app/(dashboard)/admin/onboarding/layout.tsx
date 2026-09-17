import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("admin.onboarding.metaTitle") };
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
