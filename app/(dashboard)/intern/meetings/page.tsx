import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import InternMeetingsClient from "./InternMeetingsClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("intern.meetings.metaTitle") };
}
export default function Page() { return <InternMeetingsClient />; }
