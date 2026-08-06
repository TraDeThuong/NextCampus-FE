"use client";

import { useForm } from "react-hook-form";
import { UserPlus, Mail, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useTranslations } from "next-intl";

import { createUserService } from "@/services/user.service";
import { leaderService } from "@/services/leader.service";
import MetalCard from "@/components/ui/MetalCard";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

type FormValues = {
    email: string;
};

export default function LeaderHeader() {
    const t = useTranslations();
    const queryClient = useQueryClient();

    const { mutate: createLeader, isPending } = useMutation({
        mutationFn: async (email: string) => {
            const userRes = await createUserService({
                email,
                roleName: "LEADER",
            });
            await leaderService.createLeader({ userId: userRes.data.id });
        },
        onSuccess: () => {
            toast.success(t("admin.leaders.createSuccess"));
            queryClient.invalidateQueries({ queryKey: ["users"] });
            queryClient.invalidateQueries({ queryKey: ["leaders"] });
        },
        onError: () => {
            toast.error(t("admin.leaders.createError"));
        },
    });

    return (
        <Modal>
            <MetalCard>
                <div className="rounded-3xl p-6">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-2xl font-bold metal-text">
                                {t("admin.leaders.title")}
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                {t("admin.leaders.description")}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Modal.Open opens="add-leader">
                                <button className="flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2.5 text-sm font-medium text-cyan-300 transition hover:border-cyan-400/50 hover:bg-cyan-500/20">
                                    <UserPlus className="h-4 w-4" />
                                    {t("admin.leaders.addLeader")}
                                </button>
                            </Modal.Open>
                        </div>
                    </div>
                </div>
            </MetalCard>

            <Modal.Window name="add-leader" size="sm">
                <AddLeaderForm
                    isPending={isPending}
                    onSubmit={(email, onSuccess) => createLeader(email, { onSuccess })}
                />
            </Modal.Window>
        </Modal>
    );
}

interface AddLeaderFormProps {
    isPending: boolean;
    onSubmit: (email: string, onSuccess: () => void) => void;
    onCloseModal?: () => void;
}

function AddLeaderForm({
    isPending,
    onSubmit,
    onCloseModal,
}: AddLeaderFormProps) {
    const t = useTranslations();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>();

    return (
        <div className="px-2 py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400">
                <UserPlus className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-white">
                {t("admin.leaders.addLeaderTitle")}
            </h3>
            <p className="mt-2 text-sm text-slate-400">
                {t("admin.leaders.addLeaderDescription")}
            </p>

            <form
                onSubmit={handleSubmit((data) => onSubmit(data.email, () => onCloseModal?.()))}
                className="mt-6 space-y-4"
            >
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="email"
                        placeholder={t("admin.leaders.emailPlaceholder")}
                        {...register("email", {
                            required: t("admin.leaders.emailRequired"),
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: t("admin.leaders.invalidEmail"),
                            },
                        })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-cyan-400/50 placeholder:text-slate-600"
                    />
                </div>
                {errors.email && (
                    <p className="text-sm text-red-400">
                        {errors.email.message}
                    </p>
                )}

                <div className="flex justify-center gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onCloseModal}
                        disabled={isPending}
                        className="rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-sm text-slate-300 transition hover:text-white disabled:opacity-50"
                    >
                        {t("admin.leaders.cancel")}
                    </button>
                    <Button
                        type="submit"
                        disabled={isPending}
                        variant="glass"
                    >
                        {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            t("admin.leaders.createLeader")
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
