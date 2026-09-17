import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import TemplatesPage from "./TemplatesPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("admin.emails.metaTitle") };
}

export default function EmailsPage() {
  return <TemplatesPage />;
}


