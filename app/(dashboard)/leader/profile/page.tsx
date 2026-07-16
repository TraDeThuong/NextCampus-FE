"use client";

import ChangePasswordCard from "@/components/profile/ChangePasswordCard";
import ProfileActions from "@/components/profile/ProfileActions";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileInfoCard from "@/components/profile/ProfileInfoCard";
import FullPageLoading from "@/components/ui/FullPageLoading";
import { useProfile } from "@/hooks/profile/useProfile";


export default function AdminProfilePage() {
    const { profile, isLoading } = useProfile();

    if (isLoading) {
        return <FullPageLoading/>;
    }

    if (!profile) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="rounded-2xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Unable to load profile
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        Please refresh the page and try again.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <h1 className="text-3xl font-bold metal-text">
                My Profile
            </h1>

            <p className="text-slate-400">
                Manage your personal information and account settings.
            </p>
            {/* Header */}
            <ProfileHeader profile={profile} />

            {/* Main content */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                {/* Left column */}
                <div className="space-y-6 xl:col-span-2">
                    <ProfileInfoCard profile={profile} />

                    <ChangePasswordCard />
                </div>

                {/* Right column */}
                <div className="space-y-6">
                    {/* <AvatarUploader profile={profile} /> */}
                    <ProfileActions />
                </div>
            </div>
        </div>
    );
}