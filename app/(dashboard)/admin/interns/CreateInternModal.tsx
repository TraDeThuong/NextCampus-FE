"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { isAxiosError } from "axios";
import { X, UserCheck, Loader2, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { useTranslations } from "next-intl";

import { useDirectCreateIntern } from "@/hooks/intern/useDirectCreateIntern";
import { usePositions } from "@/hooks/department/usePositions";
import { useLeaders } from "@/hooks/leader/useLeaders";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CreateInternModal({ open, onClose }: Props) {
  const t = useTranslations();
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

  const { data: leadersData } = useLeaders();
  const leaders = leadersData?.data ?? [];

  const selectedLeader = leaderId ? leaders.find((l) => l.userId === leaderId) : null;
  const allowedDepartments = selectedLeader ? selectedLeader.departments : [];

  const { data: positionsData } = usePositions(departmentId || undefined);
  const positions = positionsData?.data ?? [];

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

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, isPending, handleClose]);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = t("admin.interns.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = t("admin.interns.invalidEmail");
    if (!fullName.trim()) e.fullName = t("admin.interns.fullNameRequired");
    if (!phone.trim()) e.phone = t("admin.interns.phoneRequired");
    else if (!/^(0|\+84|84)(3|5|7|8|9)[0-9]{8}$/.test(phone.trim())) e.phone = t("admin.interns.invalidPhone");
    if (!leaderId) e.leaderId = t("admin.interns.leaderRequired");
    if (!departmentId) e.departmentId = t("admin.interns.departmentRequired");
    if (!positionId) e.positionId = t("admin.interns.positionRequired");
    if (!startDate) e.startDate = t("admin.interns.startDateRequired");
    if (!duration || duration < 1) e.duration = t("admin.interns.durationMin");
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

      toast.success(t("admin.interns.createSuccess", { name: fullName }));
      handleClose();
    } catch (error: unknown) {
      const msg =
        (isAxiosError<{ message?: string }>(error)
          ? error.response?.data?.message
          : undefined) ??
        (error instanceof Error ? error.message : undefined) ??
        t("admin.interns.createError");
      toast.error(msg);
    }
  }

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[28px] border border-white/10 bg-[#0c1322]/95 shadow-[0_24px_64px_rgba(0,0,0,0.7)] backdrop-blur-2xl"
      >
        <button
          onClick={handleClose}
          type="button"
          aria-label="Đóng"
          disabled={isPending}
          className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted hover:text-foreground hover:bg-white/10 active:scale-95 transition-all disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 shadow-inner">
              <UserCheck className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold metal-text">{t("admin.interns.directAddTitle")}</h2>
              <p className="text-xs text-muted mt-0.5">{t("admin.interns.directAddDescription")}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email & Full Name */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label={t("admin.interns.email")}
                required
                type="email"
                value={email}
                error={errors.email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((p) => ({ ...p, email: "" }));
                }}
                placeholder={t("admin.interns.emailPlaceholder")}
                disabled={isPending}
              />

              <Input
                label={t("admin.interns.fullName")}
                required
                type="text"
                value={fullName}
                error={errors.fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors((p) => ({ ...p, fullName: "" }));
                }}
                placeholder={t("admin.interns.fullNamePlaceholder")}
                disabled={isPending}
              />
            </div>

            {/* Phone */}
            <Input
              label={t("admin.interns.phone")}
              required
              type="text"
              value={phone}
              error={errors.phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) setErrors((p) => ({ ...p, phone: "" }));
              }}
              placeholder={t("admin.interns.phonePlaceholder")}
              disabled={isPending}
            />

            {/* Leader (Standardized Select) */}
            <Select
              label={t("admin.interns.leader")}
              required
              error={errors.leaderId}
              value={leaderId}
              onChange={(val) => {
                setLeaderId(val);
                setDepartmentId("");
                setPositionId("");
                if (errors.leaderId) setErrors((p) => ({ ...p, leaderId: "" }));
              }}
              disabled={isPending}
              searchable
              placeholder={t("admin.interns.selectOption")}
              options={leaders.map((leader) => ({
                value: leader.userId,
                label: leader.user.fullName
                  ? `${leader.user.fullName} (${leader.user.email})`
                  : leader.user.email,
              }))}
            />

            {/* Department & Position (Standardized Selects) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label={t("admin.interns.department")}
                required
                error={errors.departmentId}
                value={departmentId}
                onChange={(val) => {
                  setDepartmentId(val);
                  setPositionId("");
                  if (errors.departmentId) setErrors((p) => ({ ...p, departmentId: "" }));
                }}
                disabled={isPending || !leaderId}
                searchable
                placeholder={
                  !leaderId
                    ? t("admin.interns.selectLeaderFirst")
                    : t("admin.interns.selectOption")
                }
                options={allowedDepartments.map((d) => ({
                  value: d.id,
                  label: d.name,
                }))}
              />

              <Select
                label={t("admin.interns.position")}
                required
                error={errors.positionId}
                value={positionId}
                onChange={(val) => {
                  setPositionId(val);
                  if (errors.positionId) setErrors((p) => ({ ...p, positionId: "" }));
                }}
                disabled={isPending || !departmentId}
                searchable
                placeholder={t("admin.interns.selectOption")}
                options={positions.map((p) => ({
                  value: p.id,
                  label: p.name,
                }))}
              />
            </div>

            {/* Start Date & Duration */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs sm:text-sm font-medium text-foreground/90 select-none flex items-center gap-1">
                  {t("admin.interns.startDate")}
                  <span className="text-danger font-bold">*</span>
                </label>
                <DatePicker
                  value={startDate}
                  onChange={(val) => {
                    setStartDate(val);
                    if (errors.startDate) setErrors((p) => ({ ...p, startDate: "" }));
                  }}
                  disabled={isPending}
                />
                {errors.startDate && (
                  <p className="text-xs text-danger flex items-center gap-1.5 mt-0.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.startDate}</span>
                  </p>
                )}
              </div>

              <Input
                label={t("admin.interns.duration")}
                required
                type="number"
                min={1}
                max={12}
                value={duration}
                error={errors.duration}
                onChange={(e) => {
                  setDuration(Number(e.target.value));
                  if (errors.duration) setErrors((p) => ({ ...p, duration: "" }));
                }}
                disabled={isPending}
              />
            </div>

            {/* Submit & Cancel */}
            <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="rounded-xl border border-border dark:border-white/10 bg-card/40 px-5 py-2.5 text-sm text-muted hover:text-foreground hover:bg-card active:scale-[0.98] transition disabled:opacity-50"
              >
                {t("admin.interns.cancel")}
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 active:scale-[0.98] transition disabled:opacity-50 shadow-md shadow-emerald-950/30"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserCheck className="h-4 w-4" />
                )}
                {isPending ? t("admin.interns.creating") : t("admin.interns.createIntern")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}
