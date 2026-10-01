"use client";

import ChangePasswordCard from "@/components/profile/ChangePasswordCard";
import DiscordProfileCard from "@/components/profile/DiscordProfileCard";
import LeaderInfoCard from "@/components/profile/LeaderInfoCard";
import ProfileActions from "@/components/profile/ProfileActions";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileInfoCard from "@/components/profile/ProfileInfoCard";
import FullPageLoading from "@/components/ui/FullPageLoading";
import { useProfile } from "@/hooks/profile/useProfile";
import { useLeader } from "@/hooks/profile/useLeader";
import { useUpdateProfile } from "@/hooks/profile/useUpdateProfile";
import { useTranslations } from "next-intl";

export default function LeaderProfilePage() {
    const t = useTranslations("leader.profile");
    const { profile, isLoading: profileLoading } = useProfile();
    const { leader, isLoading: leaderLoading } = useLeader();
    const { updateProfileAsync } = useUpdateProfile();

    if (profileLoading || leaderLoading) {
        return <FullPageLoading />;
    }

    if (!profile) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="rounded-2xl border border-border bg-card px-8 py-10 text-center shadow-sm">
                    <h2 className="text-lg font-semibold text-foreground">{t("loadError")}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">{t("loadErrorDesc")}</p>
                </div>
            </div>
        );
    }

    const handleDiscordUpdate = async (data: {
        discordUserId?: string | null;
        discordUsername?: string | null;
    }) => {
        await updateProfileAsync({
            fullName: profile.fullName || "",
            discordUserId: data.discordUserId,
            discordUsername: data.discordUsername,
        });
    };

    return (
        <div className="space-y-2">
            <h1 className="text-3xl font-bold metal-text">{t("title")}</h1>
            <p className="text-muted-foreground">{t("description")}</p>
            <ProfileHeader profile={profile} />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="space-y-6 xl:col-span-2">
                    <ProfileInfoCard profile={profile} />
                    {leader && <LeaderInfoCard leader={leader} />}
                    <DiscordProfileCard
                        discordUserId={profile.discordUserId}
                        discordUsername={profile.discordUsername}
                        roleName={profile.role}
                        onUpdate={handleDiscordUpdate}
                    />
                    <ChangePasswordCard />
                </div>
                <div className="space-y-6">
                    <ProfileActions />
                </div>
            </div>
        </div>
    );
}
