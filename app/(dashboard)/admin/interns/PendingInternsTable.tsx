"use client";

import { Check, X, AlertTriangle } from "lucide-react";

import { useApplications } from "@/hooks/application/useApplications";
import { useReviewApplication } from "@/hooks/application/useReviewApplication";
import type { Application } from "@/types/application";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import Modal from "@/components/ui/Modal";

export default function PendingInternsTable() {
    const { data, isLoading, isError } = useApplications({ status: "PENDING" });
    const { mutate: review, isPending: reviewing } = useReviewApplication();

    const applications = data?.data ?? [];

    function handleReview(appId: string, status: "APPROVED" | "REJECTED") {
        review({ id: appId, payload: { status } });
    }

    if (isLoading) {
        return (
            <MetalCard>
                <div className="flex items-center justify-center py-16">
                    <Spinner />
                </div>
            </MetalCard>
        );
    }

    if (isError) {
        return (
            <MetalCard>
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <AlertTriangle className="h-8 w-8 text-red-400" />
                    <p className="mt-2">Failed to load pending applications.</p>
                </div>
            </MetalCard>
        );
    }

    if (applications.length === 0) {
        return (
            <MetalCard>
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <Check className="h-8 w-8 text-emerald-400" />
                    <p className="mt-2 text-sm">No pending applications.</p>
                </div>
            </MetalCard>
        );
    }

    return (
        <Modal>
            <MetalCard>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-white/10 text-xs uppercase text-slate-400">
                                <th className="px-6 py-4 font-medium">Candidate</th>
                                <th className="px-6 py-4 font-medium">Email</th>
                                <th className="px-6 py-4 font-medium">Department</th>
                                <th className="px-6 py-4 font-medium">Position</th>
                                <th className="px-6 py-4 font-medium">Submitted</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {applications.map((app: Application) => (
                                <tr
                                    key={app.id}
                                    className="transition hover:bg-white/[0.02]"
                                >
                                    <td className="px-6 py-4 font-medium text-white">
                                        {app.fullName}
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">
                                        {app.email}
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">
                                        {app.department?.name ?? "—"}
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">
                                        {app.position?.name ?? "—"}
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">
                                        {new Date(app.createdAt).toLocaleDateString(
                                            "en-GB",
                                            {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            },
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Modal.Open
                                                opens={`approve-${app.id}`}
                                            >
                                                <button
                                                    type="button"
                                                    disabled={reviewing}
                                                    className="flex items-center gap-1.5 rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 transition hover:border-emerald-400/40 hover:bg-emerald-500/20 disabled:opacity-50"
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                    Approve
                                                </button>
                                            </Modal.Open>
                                            <Modal.Open opens={`reject-${app.id}`}>
                                                <button
                                                    type="button"
                                                    disabled={reviewing}
                                                    className="flex items-center gap-1.5 rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:border-red-400/40 hover:bg-red-500/20 disabled:opacity-50"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                    Reject
                                                </button>
                                            </Modal.Open>

                                            <Modal.Window
                                                name={`approve-${app.id}`}
                                                size="sm"
                                            >
                                                <ConfirmDialog
                                                    title="Approve Application"
                                                    message={`Create intern account for ${app.fullName}?`}
                                                    action="APPROVED"
                                                    appId={app.id}
                                                    onAction={handleReview}
                                                />
                                            </Modal.Window>
                                            <Modal.Window
                                                name={`reject-${app.id}`}
                                                size="sm"
                                            >
                                                <ConfirmDialog
                                                    title="Reject Application"
                                                    message={`Reject application from ${app.fullName}?`}
                                                    action="REJECTED"
                                                    appId={app.id}
                                                    onAction={handleReview}
                                                />
                                            </Modal.Window>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </MetalCard>
        </Modal>
    );
}

function ConfirmDialog({
    title,
    message,
    action,
    appId,
    onAction,
    onCloseModal,
}: {
    title: string;
    message: string;
    action: "APPROVED" | "REJECTED";
    appId: string;
    onAction: (appId: string, action: "APPROVED" | "REJECTED") => void;
    onCloseModal?: () => void;
}) {
    return (
        <div className="px-2 py-8 text-center">
            <div
                className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${
                    action === "APPROVED"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400"
                }`}
            >
                <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{message}</p>
            <div className="mt-6 flex justify-center gap-3">
                <button
                    type="button"
                    onClick={onCloseModal}
                    className="rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-sm text-slate-300 transition hover:border-white/20 hover:text-white"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={() => {
                        onCloseModal?.();
                        onAction(appId, action);
                    }}
                    className={`rounded-xl px-5 py-2 text-sm font-medium text-white transition ${
                        action === "APPROVED"
                            ? "bg-emerald-600 hover:bg-emerald-500"
                            : "bg-red-600 hover:bg-red-500"
                    }`}
                >
                    {action === "APPROVED" ? "Approve" : "Reject"}
                </button>
            </div>
        </div>
    );
}
