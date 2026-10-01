"use client";

import ChangePasswordCard from "@/components/profile/ChangePasswordCard";
import DiscordProfileCard from "@/components/profile/DiscordProfileCard";
import InternInfoCard from "@/components/profile/InternInfoCard";
import ProfileActions from "@/components/profile/ProfileActions";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileInfoCard from "@/components/profile/ProfileInfoCard";
import FullPageLoading from "@/components/ui/FullPageLoading";
import { useProfile } from "@/hooks/profile/useProfile";
import { useIntern } from "@/hooks/profile/useIntern";
import { useUpdateIntern } from "@/hooks/profile/useUpdateIntern";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";

export default function InternProfilePage() {
    const t = useTranslations("intern.profile");
    const queryClient = useQueryClient();
    const { profile, isLoading: profileLoading } = useProfile();
    const { intern, isLoading: internLoading } = useIntern();
    const updateInternMutation = useUpdateIntern();

    if (profileLoading || internLoading) return <FullPageLoading />;

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
        // mutateAsync thay vì dùng onSuccess/onError trong hook — card tự xử lý toast
        await updateInternMutation.mutateAsync(data, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["my-intern"] });
            },
            // Silence hook's default error toast; DiscordProfileCard handles it
            onError: () => {},
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
                    {intern && <InternInfoCard intern={intern} />}
                    {intern && (
                        <DiscordProfileCard
                            intern={intern}
                            onUpdate={handleDiscordUpdate}
                        />
                    )}
                    <ChangePasswordCard />
                </div>
                <div className="space-y-6"><ProfileActions /></div>
            </div>
        </div>
    );
}
