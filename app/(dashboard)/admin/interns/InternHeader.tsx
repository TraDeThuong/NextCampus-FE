"use client";

import { useState } from "react";
import { UserPlus, Clock, UserCheck } from "lucide-react";
import { useTranslations } from "next-intl";

import { useApplications } from "@/hooks/application/useApplications";
import InviteInternForm from "../onboarding/InviteInternForm";
import CreateInternModal from "./CreateInternModal";
import PendingInternsTable from "./PendingInternsTable";
import MetalCard from "@/components/ui/MetalCard";
import Modal from "@/components/ui/Modal";
import { useCreateInvite } from "@/hooks/application/useCreateInvite";

export default function InternHeader() {
    const t = useTranslations();
    const [showDirectModal, setShowDirectModal] = useState(false);
    const [showPending, setShowPending] = useState(false);

    const { data: pendingData } = useApplications({ status: "PENDING" });
    const pendingCount = pendingData?.meta?.total ?? 0;

    const { mutate: createInvite, isPending } = useCreateInvite();

    return (
        <Modal>
            <MetalCard>
                <div className="rounded-3xl p-6">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-2xl font-bold metal-text">
                                {t("admin.interns.title")}
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                {t("admin.interns.description")}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setShowDirectModal(true)}
                                className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-300 transition hover:border-emerald-400/50 hover:bg-emerald-500/20"
                            >
                                <UserCheck className="h-4 w-4" />
                                {t("admin.interns.directAdd")}
                            </button>

                            <Modal.Open opens="invite-intern">
                                <button
                                    type="button"
                                    className="flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2.5 text-sm font-medium text-cyan-300 transition hover:border-cyan-400/50 hover:bg-cyan-500/20"
                                >
                                    <UserPlus className="h-4 w-4" />
                                    {t("admin.interns.addIntern")}
                                </button>
                            </Modal.Open>

                            <button
                                type="button"
                                onClick={() => setShowPending((prev) => !prev)}
                                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                            >
                                <Clock className="h-4 w-4" />
                                {t("admin.interns.pendingInterns")}
                                {pendingCount > 0 && (
                                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500/20 px-1.5 text-xs font-semibold text-amber-400">
                                        {pendingCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </MetalCard>

            {showPending && (
                <div className="mt-6">
                    <PendingInternsTable />
                </div>
            )}

            <CreateInternModal
                open={showDirectModal}
                onClose={() => setShowDirectModal(false)}
            />

            <Modal.Window name="invite-intern" size="sm">
                <InviteInternForm
                    isPending={isPending}
                    onSubmit={(email, onSuccess) => createInvite({ email }, { onSuccess })}
                />
            </Modal.Window>
        </Modal>
    );
}
