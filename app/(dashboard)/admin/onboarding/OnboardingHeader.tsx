"use client";

import { Plus, UserCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-hot-toast";

import MetalCard from "@/components/ui/MetalCard";
import DateRangeFilter from "./DateRangeFilter";
import InviteInternForm from "./InviteInternForm";
import Modal from "@/components/ui/Modal";
import { useCreateInvite } from "@/hooks/application/useCreateInvite";

export default function OnboardingHeader() {
    const t = useTranslations();
    const { mutate: createInvite, isPending } = useCreateInvite();

    return (
        <Modal>
            <MetalCard className="px-6 py-6 sm:px-8 sm:py-7">
                {/* Decorative glow blobs */}
                <div className="animate-[floatGlow_7s_ease-in-out_infinite] absolute -left-24 top-0 h-56 w-56 rounded-full bg-(--primary-main)/15 blur-3xl" />
                <div className="animate-[floatGlow_7s_ease-in-out_infinite] absolute -right-20 -bottom-15 h-64 w-64 rounded-full bg-(--primary-light)/10 blur-3xl" />

                <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    {/* Left: Title with standardized Icon + Heading wrapper */}
                    <div className="flex items-center gap-3.5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-400/20 shadow-[0_0_20px_rgba(21,174,245,0.15)]">
                            <UserCheck className="h-5 w-5 shrink-0" />
                        </div>
                        <div>
                            <h1 className="chrome-text metal-text text-xl font-bold md:text-2xl">
                                {t("admin.onboarding.title")}
                            </h1>
                            <p className="text-xs md:text-sm text-muted font-medium tracking-wide mt-1">
                                {t("admin.onboarding.description")}
                            </p>
                        </div>
                    </div>

                    {/* Right: Date range + Invite button */}
                    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:self-end lg:self-auto">
                        <DateRangeFilter />

                        <Modal.Open opens="invite-intern">
                            <button
                                type="button"
                                className="
                                    group relative shrink-0 overflow-hidden
                                    rounded-2xl
                                    bg-gradient-to-r from-(--primary-main) to-(--primary-light)
                                    px-6 py-3
                                    text-sm font-semibold text-white
                                    shadow-[0_0_35px_rgba(21,174,245,0.25)]
                                    transition-all duration-300
                                    hover:-translate-y-0.5 hover:scale-[1.02]
                                    active:scale-[0.98]
                                "
                            >
                                <span
                                    className="
                                        absolute inset-y-0 -left-24 w-16 rotate-12
                                        bg-white/30 blur-lg
                                        transition-all duration-700
                                        group-hover:left-[130%]
                                    "
                                />
                                <span className="relative flex items-center gap-2 hover:cursor-pointer">
                                    <Plus className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:rotate-90" />
                                    {t("admin.onboarding.inviteIntern")}
                                </span>
                            </button>
                        </Modal.Open>
                    </div>
                </div>
            </MetalCard>

            <Modal.Window name="invite-intern" size="sm">
                <InviteInternForm
                    isPending={isPending}
                    onSubmit={(email, onSuccess) =>
                        createInvite(
                            { email },
                            {
                                onSuccess: () => {
                                    toast.success(t("admin.onboarding.createSuccess"));
                                    onSuccess();
                                },
                                onError: () => {
                                    toast.error(t("admin.onboarding.createError"));
                                },
                            },
                        )
                    }
                />
            </Modal.Window>
        </Modal>
    );
}