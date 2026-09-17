import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import LeaderMeetingsClient from "./LeaderMeetingsClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("leader.meetings.metaTitle") };
}

export default function Page() {
  return <LeaderMeetingsClient />;
}
