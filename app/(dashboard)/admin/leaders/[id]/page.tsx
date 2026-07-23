"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
    ArrowLeft,
    Mail,
    Phone,
    Building2,
    User,
    Circle,
} from "lucide-react";

import { useLeaderDetail } from "@/hooks/leader/useLeaderDetail";
import { useUpdateLeader } from "@/hooks/leader/useUpdateLeader";
import { useDepartments } from "@/hooks/department/useDepartments";
import { useInterns } from "@/hooks/intern/useInterns";
import { useUpdateIntern } from "@/hooks/intern/useUpdateIntern";
import { useLeaders } from "@/hooks/leader/useLeaders";
import { updateUserService } from "@/services/user.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import type { Leader } from "@/types/leader";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";

export default function LeaderDetailPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { data, isLoading, isError } = useLeaderDetail(params.id);
    const leader = data?.data;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Spinner size="lg" />
            </div>
        );
    }

    if (isError || !leader) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-32">
                <p className="text-slate-400">Leader not found.</p>
                <button
                    onClick={() => router.back()}
                    className="text-sm text-cyan-400 hover:text-cyan-300"
                >
                    ← Go back
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <button
                onClick={() => router.push("/admin/leaders")}
                className="flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Leaders
            </button>

            <LeaderHeader leader={leader} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <LeaderInfo leader={leader} />
                <DepartmentCard leader={leader} />
            </div>

            <InternsCard leader={leader} />
        </div>
    );
}

function LeaderHeader({ leader }: { leader: Leader }) {
    const queryClient = useQueryClient();
    const { mutate: toggleActive } = useMutation({
        mutationFn: (isActive: boolean) =>
            updateUserService(leader.userId, { isActive }),
        onSuccess: () => {
            toast.success("Leader status updated.");
            queryClient.invalidateQueries({ queryKey: ["leader"] });
            queryClient.invalidateQueries({ queryKey: ["leaders"] });
        },
        onError: () => toast.error("Failed to update status."),
    });

    return (
        <MetalCard>
            <div className="rounded-3xl p-6">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-4">
                        {leader.user.avatarUrl ? (
                            <Image
                                src={leader.user.avatarUrl}
                                alt={leader.user.fullName ?? ""}
                                width={64}
                                height={64}
                                className="h-16 w-16 rounded-2xl object-cover"
                            />
                        ) : (
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-800 text-2xl font-bold text-slate-200">
                                {(leader.user.fullName ?? leader.user.email)
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                {leader.user.fullName ?? leader.user.email}
                            </h1>
                            <div className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                                <Mail className="h-4 w-4" />
                                {leader.user.email}
                            </div>
                        </div>
                    </div>

                    <div>
                        <select
                            value={leader.user.isActive ? "true" : "false"}
                            onChange={(e) =>
                                toggleActive(e.target.value === "true")
                            }
                            className={`rounded-lg border px-2.5 py-1 text-xs font-medium outline-none cursor-pointer ${
                                leader.user.isActive
                                    ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                                    : "border-red-400/20 bg-red-500/10 text-red-300"
                            }`}
                        >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </div>
                </div>
            </div>
        </MetalCard>
    );
}

function LeaderInfo({ leader }: { leader: Leader }) {
    const { mutate: updateLeader } = useUpdateLeader();
    const [editingPos, setEditingPos] = useState(false);
    const [posValue, setPosValue] = useState(leader.position ?? "");

    return (
        <MetalCard>
            <div className="rounded-3xl p-6">
                <h2 className="text-lg font-semibold metal-text">
                    Contact Information
                </h2>
                <div className="mt-5 space-y-4">
                    <InfoRow icon={Mail} label="Email" value={leader.user.email} />

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                            <Phone className="h-4 w-4" />
                            <span>Phone</span>
                        </div>
                        <span className="text-sm text-white">
                            {leader.phone ?? "—"}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                            <User className="h-4 w-4" />
                            <span>Position</span>
                        </div>
                        {editingPos ? (
                            <input
                                type="text"
                                value={posValue}
                                onChange={(e) => setPosValue(e.target.value)}
                                onBlur={() => {
                                    if (posValue !== (leader.position ?? "")) {
                                        updateLeader({
                                            id: leader.id,
                                            payload: {
                                                position: posValue || null,
                                            },
                                        });
                                    }
                                    setEditingPos(false);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                        (e.target as HTMLInputElement).blur();
                                }}
                                autoFocus
                                className="rounded-lg border border-cyan-400/30 bg-[#0f172a] px-2 py-1 text-sm text-white outline-none"
                            />
                        ) : (
                            <button
                                onClick={() => {
                                    setPosValue(leader.position ?? "");
                                    setEditingPos(true);
                                }}
                                className="text-sm text-white transition hover:text-cyan-400"
                            >
                                {leader.position ?? "—"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </MetalCard>
    );
}

function DepartmentCard({ leader }: { leader: Leader }) {
    const { mutate: updateLeader } = useUpdateLeader();
    const { data: deptData } = useDepartments();
    const departments = deptData?.data ?? [];

    return (
        <MetalCard>
            <div className="rounded-3xl p-6">
                <h2 className="text-lg font-semibold metal-text">Department</h2>
                <div className="mt-5 space-y-4">
                    <InlineSelectRow
                        icon={Building2}
                        label="Department"
                        value={leader.department?.name ?? "Not set"}
                        options={departments.map((d) => ({
                            value: d.id,
                            label: d.name,
                        }))}
                        currentId={leader.departmentId ?? ""}
                        onChange={(id) =>
                            updateLeader({
                                id: leader.id,
                                payload: { departmentId: id || null },
                            })
                        }
                    />
                    <InfoRow
                        icon={Circle}
                        label="Interns Managed"
                        value={String(leader.internCount ?? 0)}
                    />
                </div>
            </div>
        </MetalCard>
    );
}

function InternsCard({ leader }: { leader: Leader }) {
    const queryClient = useQueryClient();
    const { data, isLoading } = useInterns({ leaderId: leader.userId });
    const { data: leadersData } = useLeaders();
    const allLeaders = leadersData?.data ?? [];
    const interns = data?.data ?? [];

    const { mutate: updateIntern } = useUpdateIntern();

    return (
        <MetalCard>
            <div className="rounded-3xl p-6">
                <h2 className="text-lg font-semibold metal-text">
                    Managed Interns ({interns.length})
                </h2>

                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Spinner size="sm" />
                    </div>
                ) : interns.length === 0 ? (
                    <p className="mt-4 text-sm text-slate-500">
                        No interns assigned to this leader.
                    </p>
                ) : (
                    <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-white/10 text-xs uppercase text-slate-400">
                                    <th className="py-3 pr-4 font-medium">Name</th>
                                    <th className="py-3 pr-4 font-medium">Email</th>
                                    <th className="py-3 pr-4 font-medium">Dept</th>
                                    <th className="py-3 pr-4 font-medium">Position</th>
                                    <th className="py-3 pr-4 font-medium">Leader</th>
                                    <th className="py-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {interns.map((intern) => (
                                    <tr key={intern.id}>
                                        <td className="py-3 pr-4 text-white">
                                            {intern.fullName}
                                        </td>
                                        <td className="py-3 pr-4 text-slate-400">
                                            {intern.user.email}
                                        </td>
                                        <td className="py-3 pr-4 text-slate-400">
                                            {intern.department?.name ?? "—"}
                                        </td>
                                        <td className="py-3 pr-4 text-slate-400">
                                            {intern.position?.name ?? "—"}
                                        </td>
                                        <td className="py-3 pr-4">
                                            <select
                                                value={intern.leaderId ?? ""}
                                                onChange={(e) => {
                                                    updateIntern({
                                                        id: intern.id,
                                                        payload: {
                                                            leaderId: e.target
                                                                .value || null,
                                                        },
                                                    });
                                                    setTimeout(
                                                        () =>
                                                            queryClient.invalidateQueries(
                                                                {
                                                                    queryKey: [
                                                                        "interns",
                                                                    ],
                                                                },
                                                            ),
                                                        500,
                                                    );
                                                }}
                                                className="rounded-lg border border-cyan-400/30 bg-[#0f172a] px-2 py-1 text-xs text-white outline-none"
                                            >
                                                <option value="">
                                                    Unassigned
                                                </option>
                                                {allLeaders.map((l) => (
                                                    <option
                                                        key={l.id}
                                                        value={l.userId}
                                                    >
                                                        {l.user.fullName ??
                                                            l.user.email}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="py-3">
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${
                                                    intern.status ===
                                                    "ACTIVE"
                                                        ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                                                        : intern.status ===
                                                            "COMPLETED"
                                                          ? "border-blue-400/20 bg-blue-500/10 text-blue-300"
                                                          : "border-red-400/20 bg-red-500/10 text-red-300"
                                                }`}
                                            >
                                                {intern.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </MetalCard>
    );
}

function InfoRow({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-slate-400">
                <Icon className="h-4 w-4" />
                <span>{label}</span>
            </div>
            <span className="text-sm text-white">{value}</span>
        </div>
    );
}

function InlineSelectRow({
    icon: Icon,
    label,
    value,
    options,
    currentId,
    onChange,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    options: { value: string; label: string }[];
    currentId: string;
    onChange: (id: string) => void;
}) {
    const [editing, setEditing] = useState(false);

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-slate-400">
                <Icon className="h-4 w-4" />
                <span>{label}</span>
            </div>
            {editing ? (
                <select
                    value={currentId}
                    onChange={(e) => {
                        onChange(e.target.value);
                        setEditing(false);
                    }}
                    onBlur={() => setEditing(false)}
                    autoFocus
                    className="rounded-lg border border-cyan-400/30 bg-[#0f172a] px-2 py-1 text-sm text-white outline-none"
                >
                    <option value="">Not set</option>
                    {options.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
            ) : (
                <button
                    onClick={() => setEditing(true)}
                    className="text-sm text-white transition hover:text-cyan-400"
                >
                    {value}
                </button>
            )}
        </div>
    );
}
