"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  ShieldAlert,
  Power,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  Save,
  Loader2,
  Lock,
} from "lucide-react";
import MetalCard from "@/components/ui/MetalCard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";
import { useRBAC } from "@/hooks/rbac/useRBAC";
import { useMaintenanceConfig } from "@/hooks/maintenance/useMaintenanceConfig";
import { useEnableMaintenance } from "@/hooks/maintenance/useEnableMaintenance";
import { useDisableMaintenance } from "@/hooks/maintenance/useDisableMaintenance";
import { useUpdateMaintenanceConfig } from "@/hooks/maintenance/useUpdateMaintenanceConfig";
import type { MaintenanceConfig, MaintenanceStatus } from "@/types/maintenance";

export default function MaintenanceTab() {
  const { data: res, isLoading, isError, refetch } = useMaintenanceConfig();

  if (isLoading) {
    return (
      <div className="flex h-72 w-full flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-xs font-medium text-muted animate-pulse">
          Đang tải trạng thái bảo trì...
        </p>
      </div>
    );
  }

  if (isError || !res?.data) {
    return (
      <MetalCard className="p-8 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-400">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold text-foreground">
          Không thể lấy thông tin bảo trì hệ thống.
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Thử lại
        </Button>
      </MetalCard>
    );
  }

  return (
    <MaintenanceFormView
      key={res.data.updatedAt || res.data.id}
      config={res.data}
    />
  );
}

interface MaintenanceFormViewProps {
  config: MaintenanceConfig;
}

function MaintenanceFormView({ config }: MaintenanceFormViewProps) {
  const t = useTranslations("admin.settings.maintenance");
  const { can } = useRBAC();
  const canManage = can("MAINTENANCE_MANAGE");

  const enableMutation = useEnableMaintenance();
  const disableMutation = useDisableMaintenance();
  const updateMutation = useUpdateMaintenanceConfig();

  const [status, setStatus] = useState<MaintenanceStatus>(
    config.status || "ONLINE"
  );
  const [title, setTitle] = useState(config.title || "");
  const [message, setMessage] = useState(config.message || "");
  const [startAt, setStartAt] = useState(
    config.startAt ? config.startAt.slice(0, 16) : ""
  );
  const [estimatedEndAt, setEstimatedEndAt] = useState(
    config.estimatedEndAt ? config.estimatedEndAt.slice(0, 16) : ""
  );
  const [bypassRoles, setBypassRoles] = useState(
    Array.isArray(config.bypassRoles) ? config.bypassRoles.join(", ") : ""
  );
  const [bypassIps, setBypassIps] = useState(
    Array.isArray(config.bypassIps) ? config.bypassIps.join(", ") : ""
  );

  const isMaintenanceActive = config.enabled || config.status !== "ONLINE";

  const handleToggleMaintenance = () => {
    if (!canManage) return;
    if (isMaintenanceActive) {
      if (window.confirm(t("confirmDisableDesc"))) {
        disableMutation.mutate();
      }
    } else {
      if (window.confirm(t("confirmEnableDesc"))) {
        enableMutation.mutate({
          title: title || "Hệ thống đang bảo trì",
          message:
            message || "Chúng tôi đang nâng cấp hệ thống để nâng cao trải nghiệm.",
          status: status === "READ_ONLY" ? "READ_ONLY" : "MAINTENANCE",
          startAt: startAt ? new Date(startAt).toISOString() : null,
          estimatedEndAt: estimatedEndAt
            ? new Date(estimatedEndAt).toISOString()
            : null,
          bypassRoles: bypassRoles
            .split(",")
            .map((r) => r.trim())
            .filter(Boolean),
          bypassIps: bypassIps
            .split(",")
            .map((ip) => ip.trim())
            .filter(Boolean),
        });
      }
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) return;

    updateMutation.mutate({
      title,
      message,
      status,
      startAt: startAt ? new Date(startAt).toISOString() : null,
      estimatedEndAt: estimatedEndAt
        ? new Date(estimatedEndAt).toISOString()
        : null,
      bypassRoles: bypassRoles
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean),
      bypassIps: bypassIps
        .split(",")
        .map((ip) => ip.trim())
        .filter(Boolean),
    });
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <MetalCard className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border transition-all ${
                isMaintenanceActive
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)] animate-pulse"
                  : "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              }`}
            >
              {isMaintenanceActive ? (
                <ShieldAlert className="h-7 w-7" />
              ) : (
                <CheckCircle2 className="h-7 w-7" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-foreground">
                  {t("currentStatus")}:
                </h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    config.status === "ONLINE"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : config.status === "READ_ONLY"
                      ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}
                >
                  {config.status === "ONLINE"
                    ? t("statusOnline")
                    : config.status === "READ_ONLY"
                    ? t("statusReadOnly")
                    : t("statusMaintenance")}
                </span>
              </div>
              <p className="text-xs text-muted mt-1">{t("subtitle")}</p>
            </div>
          </div>

          {/* Action toggle button guarded by MAINTENANCE_MANAGE */}
          {canManage && (
            <Button
              variant={isMaintenanceActive ? "primary" : "outline"}
              className={
                isMaintenanceActive
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500"
                  : "bg-amber-600/20 text-amber-300 border-amber-500/40 hover:bg-amber-600/30"
              }
              onClick={handleToggleMaintenance}
              disabled={enableMutation.isPending || disableMutation.isPending}
            >
              {enableMutation.isPending || disableMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Power className="h-4 w-4 mr-2" />
              )}
              {isMaintenanceActive ? t("disableMode") : t("enableMode")}
            </Button>
          )}
        </div>

        {!canManage && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-border/40 bg-card/40 p-3 text-xs text-muted">
            <Lock className="h-4 w-4 shrink-0 text-amber-400" />
            <span>
              Bạn chỉ có quyền xem cấu hình bảo trì. Để thay đổi hoặc bật/tắt chế độ bảo trì, bạn cần quyền{" "}
              <code className="text-foreground font-mono">MAINTENANCE_MANAGE</code>.
            </span>
          </div>
        )}
      </MetalCard>

      {/* Configuration Form */}
      <MetalCard className="p-6">
        <form onSubmit={handleSaveConfig} className="space-y-6">
          <div className="border-b border-border/40 pb-3">
            <h4 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary-light" />
              {t("saveConfig")}
            </h4>
          </div>

          {/* Status Mode Select (Buttons) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted uppercase tracking-wider">
              {t("modeSelect")}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(["ONLINE", "MAINTENANCE", "READ_ONLY"] as MaintenanceStatus[]).map(
                (mode) => {
                  const isSelected = status === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      disabled={!canManage}
                      onClick={() => setStatus(mode)}
                      className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-primary-light bg-primary-light/10 text-foreground shadow-sm"
                          : "border-border/40 bg-card/30 text-muted hover:border-border-strong hover:text-foreground"
                      } ${!canManage ? "cursor-not-allowed opacity-75" : ""}`}
                    >
                      <span className="text-xs font-bold">
                        {mode === "ONLINE"
                          ? t("statusOnline")
                          : mode === "READ_ONLY"
                          ? t("statusReadOnly")
                          : t("statusMaintenance")}
                      </span>
                      <span className="text-[11px] text-muted mt-1">
                        {mode === "ONLINE"
                          ? "Người dùng truy cập bình thường"
                          : mode === "READ_ONLY"
                          ? "Chỉ xem, chặn tạo mới & sửa"
                          : "Chặn toàn bộ người dùng ngoài whitelist"}
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Title and Message */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted">
                {t("msgTitle")}
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Thông báo bảo trì nâng cấp định kỳ"
                disabled={!canManage}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted">
                {t("msgBody")}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Chi tiết thông điệp hiển thị cho người dùng khi truy cập..."
                disabled={!canManage}
                className="w-full rounded-xl border border-border/60 bg-card/60 px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted/60 focus:border-primary-light focus:outline-none focus:ring-1 focus:ring-primary-light disabled:opacity-60 transition-colors"
              />
            </div>
          </div>

          {/* Schedule Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {t("startAt")}
              </label>
              <Input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                disabled={!canManage}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {t("estimatedEndAt")}
              </label>
              <Input
                type="datetime-local"
                value={estimatedEndAt}
                onChange={(e) => setEstimatedEndAt(e.target.value)}
                disabled={!canManage}
              />
            </div>
          </div>

          {/* Whitelist / Bypass configurations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted">
                {t("bypassRoles")}
              </label>
              <Input
                value={bypassRoles}
                onChange={(e) => setBypassRoles(e.target.value)}
                placeholder="ADMIN, LEADER"
                disabled={!canManage}
              />
              <p className="text-[11px] text-muted">{t("bypassRolesHint")}</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted">
                {t("bypassIps")}
              </label>
              <Input
                value={bypassIps}
                onChange={(e) => setBypassIps(e.target.value)}
                placeholder="127.0.0.1, 192.168.1.1"
                disabled={!canManage}
              />
              <p className="text-[11px] text-muted">{t("bypassIpsHint")}</p>
            </div>
          </div>

          {/* Save Button */}
          {canManage && (
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {t("saveConfig")}
              </Button>
            </div>
          )}
        </form>
      </MetalCard>
    </div>
  );
}
