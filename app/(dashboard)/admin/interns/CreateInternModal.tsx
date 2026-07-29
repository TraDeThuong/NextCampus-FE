"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { isAxiosError } from "axios";
import { X, UserCheck, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useDirectCreateIntern } from "@/hooks/intern/useDirectCreateIntern";
import { useDepartments } from "@/hooks/department/useDepartments";
import { usePositions } from "@/hooks/department/usePositions";
import { useLeaders } from "@/hooks/leader/useLeaders";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CreateInternModal({ open, onClose }: Props) {
  const directCreateIntern = useDirectCreateIntern();

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [positionId, setPositionId] = useState("");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [duration, setDuration] = useState(3);
  const [leaderId, setLeaderId] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: departmentsData } = useDepartments();
  const departments = departmentsData?.data ?? [];

  const { data: positionsData } = usePositions(departmentId || undefined);
  const positions = positionsData?.data ?? [];

  const { data: leadersData } = useLeaders();
  const leaders = leadersData?.data ?? [];

  const isPending = directCreateIntern.isPending;

  function resetForm() {
    setEmail("");
    setFullName("");
    setPhone("");
    setDepartmentId("");
    setPositionId("");
    setStartDate(new Date().toISOString().split("T")[0]);
    setDuration(3);
    setLeaderId("");
    setErrors({});
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "Invalid email";
    if (!fullName.trim()) e.fullName = "Full name is required";
    if (!phone.trim()) e.phone = "Phone is required";
    else if (!/^(0|\+84|84)(3|5|7|8|9)[0-9]{8}$/.test(phone.trim())) e.phone = "Invalid VN phone number";
    if (!departmentId) e.departmentId = "Department is required";
    if (!positionId) e.positionId = "Position is required";
    if (!startDate) e.startDate = "Start date is required";
    if (!duration || duration < 1) e.duration = "Duration must be at least 1 month";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    try {
      await directCreateIntern.mutateAsync({
        email: email.trim(),
        fullName: fullName.trim(),
        phone: phone.trim(),
        departmentId,
        positionId,
        startDate: new Date(startDate).toISOString(),
        duration: Number(duration),
        ...(leaderId ? { leaderId } : {}),
      });

      toast.success(`Intern "${fullName}" created successfully.`);
      handleClose();
    } catch (error: unknown) {
      const msg =
        (isAxiosError<{ message?: string }>(error)
          ? error.response?.data?.message
          : undefined) ??
        (error instanceof Error ? error.message : undefined) ??
        "Failed to create intern.";
      toast.error(msg);
    }
  }

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md" onClick={handleClose}>
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[28px] border border-white/10 bg-card shadow-glass">
        <button
          onClick={handleClose}
          className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted hover:text-foreground hover:bg-white/10 transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <UserCheck className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold metal-text">Direct Add Intern</h2>
              <p className="text-xs text-muted">Create intern without email invitation.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email & Full Name */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Email" required error={errors.email}>
                <input
                  type="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: "" })); }}
                  placeholder="intern@example.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:border-emerald-400/40"
                  disabled={isPending}
                />
              </Field>
              <Field label="Full Name" required error={errors.fullName}>
                <input
                  type="text" value={fullName}
                  onChange={(e) => { setFullName(e.target.value); if (errors.fullName) setErrors((p) => ({ ...p, fullName: "" })); }}
                  placeholder="Nguyen Van A"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:border-emerald-400/40"
                  disabled={isPending}
                />
              </Field>
            </div>

            {/* Phone */}
            <Field label="Phone" required error={errors.phone}>
              <input
                type="text" value={phone}
                onChange={(e) => { setPhone(e.target.value); if (errors.phone) setErrors((p) => ({ ...p, phone: "" })); }}
                placeholder="0987654321"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:border-emerald-400/40"
                disabled={isPending}
              />
            </Field>

            {/* Department & Position */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Department" required error={errors.departmentId}>
                <select
                  value={departmentId}
                  onChange={(e) => { setDepartmentId(e.target.value); setPositionId(""); if (errors.departmentId) setErrors((p) => ({ ...p, departmentId: "" })); }}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground outline-none focus:border-emerald-400/40 disabled:opacity-50"
                  disabled={isPending}
                >
                  <option value="">Select...</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Position" required error={errors.positionId}>
                <select
                  value={positionId}
                  onChange={(e) => { setPositionId(e.target.value); if (errors.positionId) setErrors((p) => ({ ...p, positionId: "" })); }}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground outline-none focus:border-emerald-400/40 disabled:opacity-50"
                  disabled={isPending || !departmentId}
                >
                  <option value="">Select...</option>
                  {positions.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Start Date & Duration */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Start Date" required error={errors.startDate}>
                <input
                  type="date" value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); if (errors.startDate) setErrors((p) => ({ ...p, startDate: "" })); }}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground outline-none focus:border-emerald-400/40"
                  disabled={isPending}
                />
              </Field>
              <Field label="Duration (months)" required error={errors.duration}>
                <input
                  type="number" min={1} max={12} value={duration}
                  onChange={(e) => { setDuration(Number(e.target.value)); if (errors.duration) setErrors((p) => ({ ...p, duration: "" })); }}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground outline-none focus:border-emerald-400/40"
                  disabled={isPending}
                />
              </Field>
            </div>

            {/* Leader */}
            <Field label="Leader">
              <select
                value={leaderId}
                onChange={(e) => setLeaderId(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground outline-none focus:border-emerald-400/40 disabled:opacity-50"
                disabled={isPending}
              >
                <option value="">No leader (assign later)</option>
                {leaders.map((leader) => (
                  <option key={leader.id} value={leader.userId}>
                    {leader.user.fullName ?? leader.user.email}
                  </option>
                ))}
              </select>
            </Field>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button" onClick={handleClose}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-400 transition hover:text-white hover:bg-white/10"
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
                {isPending ? "Creating..." : "Create Intern"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-slate-400">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
