import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import LeaderInternHeader from "./LeaderInternHeader";
import LeaderInternStats from "./LeaderInternStats";
import LeaderInternFilters from "./LeaderInternFilters";
import LeaderInternTable from "./LeaderInternTable";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("leader.interns.metaTitle") };
}

export default function LeaderInternsPage() {
  return (
    <div className="space-y-6">
      <LeaderInternHeader />
      <LeaderInternStats />
      <LeaderInternFilters />
      <LeaderInternTable />
    </div>
  );
}
