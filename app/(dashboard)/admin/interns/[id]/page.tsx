"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import {
    ArrowLeft,
    Mail,
    Phone,
    Building2,
    Briefcase,
    Calendar,
    Clock,
    Circle,
    User,
    Hash,
    CheckCircle2,
    XCircle,
    Trash2,
} from "lucide-react";

import { useInternDetail } from "@/hooks/intern/useInternDetail";
import { useUpdateIntern } from "@/hooks/intern/useUpdateIntern";
import { useDepartments } from "@/hooks/department/useDepartments";
import { usePositions } from "@/hooks/department/usePositions";
import { useLeaders } from "@/hooks/user/useLeaders";
import type { Intern } from "@/types/intern";
import MetalCard from "@/components/ui/MetalCard";
import Modal from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";

export default function InternDetailPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { data, isLoading, isError } = useInternDetail(params.id);
    const intern = data?.data;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Spinner size="lg" />
            </div>
        );
    }

    if (isError || !intern) {
        notFound();
    }

    return (
        <div className="space-y-6">
            {/* Back + header */}
            <button
                onClick={() => router.push("/admin/interns")}
                className="flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Interns
            </button>

            <InternHeader intern={intern} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <PersonalInfo intern={intern} />
                <InternshipInfo intern={intern} />
            </div>

            <DiscordCard intern={intern} />
        </div>
    );
}

function InternHeader({ intern }: { intern: Intern }) {
    const { mutate: updateIntern } = useUpdateIntern();
    const [status, setStatus] = useState(intern.status);

    useEffect(() => {
        setStatus(intern.status);
    }, [intern.status]);

    const statusBadge: Record<string, string> = {
        ACTIVE: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
        COMPLETED: "border-blue-400/20 bg-blue-500/10 text-blue-300",
        DROPPED: "border-red-400/20 bg-red-500/10 text-red-300",
    };

    const joined = new Date(intern.createdAt).toLocaleDateString("en-GB", {
        month: "short",
        year: "numeric",
    });

    return (
        <Modal>
        <MetalCard>
            <div className="rounded-3xl p-6">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 text-2xl font-bold text-slate-200">
                            {intern.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                {intern.fullName}
                            </h1>
                            <div className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                                <Mail className="h-4 w-4" />
                                {intern.user.email}
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                                Joined: {joined}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <select
                            value={status}
                            onChange={(e) => {
                                const v = e.target
                                    .value as Intern["status"];
                                setStatus(v);
                                updateIntern({
                                    id: intern.id,
                                    payload: { status: v },
                                });
                            }}
                            className={`rounded-lg border px-2.5 py-1 text-xs font-medium outline-none cursor-pointer ${statusBadge[status]}`}
                        >
                            <option value="ACTIVE" className="bg-[#0b1020] text-emerald-400 font-medium">
                                Active
                            </option>
                            <option value="COMPLETED" className="bg-[#0b1020] text-blue-400 font-medium">
                                Completed
                            </option>
                            <option value="DROPPED" className="bg-[#0b1020] text-red-400 font-medium">
                                Dropped
                            </option>
                        </select>

                        {status === "ACTIVE" && (
                            <Modal.Open opens="drop-intern">
                                <button className="flex items-center gap-1.5 rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-500/20">
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Drop
                                </button>
                            </Modal.Open>
                        )}
                    </div>
                </div>
            </div>
        </MetalCard>

        <Modal.Window name="drop-intern" size="sm">
            <DropConfirm
                name={intern.fullName}
                onConfirm={(close) => {
                    setStatus("DROPPED");
                    updateIntern({
                        id: intern.id,
                        payload: { status: "DROPPED" },
                    });
                    close?.();
                }}
            />
        </Modal.Window>
        </Modal>
    );
}

function PersonalInfo({ intern }: { intern: Intern }) {
    const { mutate: updateIntern } = useUpdateIntern();
    const [editingPhone, setEditingPhone] = useState(false);
    const [phone, setPhone] = useState(intern.phone);

    const created = new Date(intern.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

    return (
        <MetalCard>
            <div className="rounded-3xl p-6">
                <h2 className="text-lg font-semibold metal-text">
                    Personal Information
                </h2>
                <div className="mt-5 space-y-4">
                    <InfoRow icon={Mail} label="Email" value={intern.user.email} />
                    <InfoRow icon={Hash} label="User ID" value={intern.userId} />

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                            <Phone className="h-4 w-4" />
                            <span>Phone</span>
                        </div>
                        {editingPhone ? (
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                onBlur={() => {
                                    if (phone !== intern.phone) {
                                        updateIntern({
                                            id: intern.id,
                                            payload: { phone },
                                        });
                                    }
                                    setEditingPhone(false);
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
                                onClick={() => setEditingPhone(true)}
                                className="text-sm text-white transition hover:text-cyan-400"
                            >
                                {phone}
                            </button>
                        )}
                    </div>

                    <InfoRow
                        icon={intern.user.isActive ? CheckCircle2 : XCircle}
                        label="Account"
                        value={intern.user.isActive ? "Active" : "Inactive"}
                    />
                    <InfoRow icon={Calendar} label="Created" value={created} />
                </div>
            </div>
        </MetalCard>
    );
}

function InternshipInfo({ intern }: { intern: Intern }) {
    const { mutate: updateIntern } = useUpdateIntern();
    const { data: deptData } = useDepartments();
    const { data: leadersData } = useLeaders();
    const departments = deptData?.data ?? [];
    const leaders = leadersData?.data ?? [];
    const { data: posData } = usePositions(intern.department?.id ?? undefined);
    const positions = posData?.data ?? [];

    const startDate = new Date(intern.startDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
    const endDate = new Date(intern.startDate);
    endDate.setMonth(endDate.getMonth() + intern.duration);
    const endDateStr = endDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

    return (
        <MetalCard>
            <div className="rounded-3xl p-6">
                <h2 className="text-lg font-semibold metal-text">
                    Internship Information
                </h2>
                <div className="mt-5 space-y-4">
                    <InlineSelectRow
                        icon={Building2}
                        label="Department"
                        value={intern.department?.name ?? "Not set"}
                        options={departments.map((d) => ({
                            value: d.id,
                            label: d.name,
                        }))}
                        currentId={intern.department?.id ?? ""}
                        onChange={(id) =>
                            updateIntern({
                                id: intern.id,
                                payload: { departmentId: id || undefined },
                            })
                        }
                    />

                    <InlineSelectRow
                        icon={Briefcase}
                        label="Position"
                        value={intern.position?.name ?? "Not set"}
                        options={positions.map((p) => ({
                            value: p.id,
                            label: p.name,
                        }))}
                        currentId={intern.position?.id ?? ""}
                        onChange={(id) =>
                            updateIntern({
                                id: intern.id,
                                payload: { positionId: id || undefined },
                            })
                        }
                    />

                    <InlineSelectRow
                        icon={User}
                        label="Leader"
                        value={intern.leader?.fullName ?? "Not set"}
                        options={leaders.map((l) => ({
                            value: l.id,
                            label: l.fullName ?? l.email,
                        }))}
                        currentId={intern.leaderId ?? ""}
                        onChange={(id) =>
                            updateIntern({
                                id: intern.id,
                                payload: { leaderId: id || null },
                            })
                        }
                    />

                    <InfoRow
                        icon={Calendar}
                        label="Period"
                        value={`${startDate} → ${endDateStr}`}
                    />
                    <InfoRow
                        icon={Clock}
                        label="Duration"
                        value={`${intern.duration} month${intern.duration > 1 ? "s" : ""}`}
                    />
                </div>
            </div>
        </MetalCard>
    );
}

function DiscordCard({ intern }: { intern: Intern }) {
    return (
        <MetalCard>
            <div className="rounded-3xl p-6">
                <h2 className="text-lg font-semibold metal-text">Discord</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <InfoRow
                        icon={User}
                        label="Username"
                        value={intern.discordUsername ?? "Not connected"}
                    />
                    <InfoRow
                        icon={Circle}
                        label="Role Granted"
                        value={intern.discordRoleGranted ? "Yes" : "No"}
                    />
                </div>
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

function DropConfirm({
    name,
    onConfirm,
    onCloseModal,
}: {
    name: string;
    onConfirm: (close?: () => void) => void;
    onCloseModal?: () => void;
}) {
    return (
        <div className="px-2 py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-white">
                Drop Intern
            </h3>
            <p className="mt-2 text-sm text-slate-400">
                This will deactivate{" "}
                <span className="font-medium text-white">{name}</span>
                &apos;s account and mark them as dropped.
            </p>
            <div className="mt-6 flex justify-center gap-3">
                <button
                    onClick={onCloseModal}
                    className="rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-sm text-slate-300 hover:text-white"
                >
                    Cancel
                </button>
                <button
                    onClick={() => onConfirm(onCloseModal)}
                    className="rounded-xl bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-500"
                >
                    Drop
                </button>
            </div>
        </div>
    );
}
