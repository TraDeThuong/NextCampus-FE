"use client";

import ChangePasswordCard from "@/components/profile/ChangePasswordCard";
import LeaderInfoCard from "@/components/profile/LeaderInfoCard";
import ProfileActions from "@/components/profile/ProfileActions";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileInfoCard from "@/components/profile/ProfileInfoCard";
import FullPageLoading from "@/components/ui/FullPageLoading";
import { useProfile } from "@/hooks/profile/useProfile";
import { useLeader } from "@/hooks/profile/useLeader";
import { useTranslations } from "next-intl";

export default function LeaderProfilePage() {
    const t = useTranslations("leader.profile");
    const { profile, isLoading: profileLoading } = useProfile();
    const { leader, isLoading: leaderLoading } = useLeader();

    if (profileLoading || leaderLoading) {
        return <FullPageLoading />;
    }

    if (!profile) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="rounded-2xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-900">{t("loadError")}</h2>
                    <p className="mt-2 text-sm text-slate-500">{t("loadErrorDesc")}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <h1 className="text-3xl font-bold metal-text">{t("title")}</h1>
            <p className="text-slate-400">{t("description")}</p>
            <ProfileHeader profile={profile} />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="space-y-6 xl:col-span-2">
                    <ProfileInfoCard profile={profile} />
                    {leader && <LeaderInfoCard leader={leader} />}
                    <ChangePasswordCard />
                </div>
                <div className="space-y-6">
                    <ProfileActions />
                </div>
            </div>
        </div>
    );
}
