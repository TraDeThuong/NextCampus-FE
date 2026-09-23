"use client";

import { useState, useCallback, useRef, useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  MoreVertical,
  Eye,
  ListTodo,
  AlertTriangle,
  Circle,
} from "lucide-react";

import type { Intern } from "@/types/intern";
import type { InternTeamProgress } from "@/types/stats";
import { useUpdateIntern } from "@/hooks/intern/useUpdateIntern";
import { useDepartments } from "@/hooks/department/useDepartments";
import { usePositions } from "@/hooks/department/usePositions";
import InlineSelect from "@/components/ui/InlineSelect";
import Table from "@/components/ui/Table";
import InternTasksModal from "./InternTasksModal";
import InternOverdueModal from "./InternOverdueModal";
import { useRBAC } from "@/hooks/rbac/useRBAC";

type LeaderInternRowProps = {
  intern: Intern;
  taskProgress?: InternTeamProgress;
};

export default function LeaderInternRow({
  intern,
  taskProgress,
}: LeaderInternRowProps) {
  const t = useTranslations("leader.interns");
  const locale = useLocale();
  const router = useRouter();
  const { can } = useRBAC();
  const canUpdate = can("INTERN_UPDATE");

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    openUpward: boolean;
    maxHeight: number;
  }>({ left: 0, openUpward: false, maxHeight: 200 });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const [tasksModalOpen, setTasksModalOpen] = useState(false);
  const [overdueModalOpen, setOverdueModalOpen] = useState(false);

  const { mutate: updateIntern } = useUpdateIntern();
  const [updatingField, setUpdatingField] = useState<"department" | "position" | null>(null);

  const { data: deptsData } = useDepartments();
  const departments = deptsData?.data ?? [];

  const { data: posData } = usePositions(intern.department?.id ?? undefined);
  const positions = posData?.data ?? [];

  const handleDepartmentChange = useCallback(
    (newDepartmentId: string | null) => {
      setUpdatingField("department");
      updateIntern(
        { id: intern.id, payload: { departmentId: newDepartmentId, positionId: null } },
        { onSettled: () => setUpdatingField(null) },
      );
    },
    [intern.id, updateIntern],
  );

  const handlePositionChange = useCallback(
    (newPositionId: string | null) => {
      setUpdatingField("position");
      updateIntern(
        { id: intern.id, payload: { positionId: newPositionId || undefined } },
        { onSettled: () => setUpdatingField(null) },
      );
    },
    [intern.id, updateIntern],
  );

  const endDate = new Date(intern.startDate);
  endDate.setMonth(endDate.getMonth() + intern.duration);

  const fmtDate = (d: Date) =>
    d.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-GB", {
      month: "short",
      year: "numeric",
    });

  const statusLabels: Record<string, string> = {
    ACTIVE: t("statusActive"),
    COMPLETED: t("statusCompleted"),
    DROPPED: t("statusDropped"),
  };

  const statusBadge: Record<string, string> = {
    ACTIVE: "border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    COMPLETED: "border-cyan-500/30 bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400",
    DROPPED: "border-rose-500/30 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
  };

  const completed = taskProgress?.completedTasks ?? 0;
  const total = taskProgress?.totalTasks ?? 0;
  const overdue = taskProgress?.overdueCount ?? 0;

  // Smart flip & positioning for 3-dots action menu
  const updateMenuPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const MENU_WIDTH = 190;
    const ESTIMATED_HEIGHT = 150;

    const spaceBelow = vh - rect.bottom;
    const spaceAbove = rect.top;
    const openUpward = spaceBelow < ESTIMATED_HEIGHT && spaceAbove > spaceBelow;

    const left = Math.max(8, Math.min(rect.right - MENU_WIDTH, vw - MENU_WIDTH - 8));
    const maxHeight = openUpward ? Math.min(spaceAbove - 12, 280) : Math.min(spaceBelow - 12, 280);

    setMenuPos({
      top: openUpward ? undefined : rect.bottom + 4,
      bottom: openUpward ? vh - rect.top + 4 : undefined,
      left,
      openUpward,
      maxHeight,
    });
  }, []);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!menuOpen) {
      updateMenuPosition();
      setMenuOpen(true);
    } else {
      setMenuOpen(false);
    }
  };

  useEffect(() => {
    if (!menuOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    }

    function handleOutsideClick(e: MouseEvent | TouchEvent) {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setMenuOpen(false);
      }
    }

    function handleScrollOrResize() {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        setMenuOpen(false);
      } else {
        updateMenuPosition();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [menuOpen, updateMenuPosition]);

  return (
    <>
      <Table.Row>
        {/* Intern Details */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-slate-100 text-sm font-bold text-slate-700 shadow-sm dark:border-white/10 dark:bg-gradient-to-br dark:from-slate-600 dark:to-slate-800 dark:text-white">
            {intern.fullName?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0">
            <p
              className="truncate text-sm font-medium text-foreground cursor-pointer hover:text-cyan-600 dark:hover:text-cyan-400 transition"
              onClick={() => router.push(`/leader/interns/${intern.id}`)}
            >
              {intern.fullName}
            </p>
            <p className="truncate text-xs text-muted">
              {intern.user.email}
            </p>
          </div>
        </div>

        {/* Department */}
        <div className="text-sm text-muted">
          {canUpdate ? (
            <InlineSelect
              ariaLabel="Department"
              value={intern.department?.id ?? null}
              placeholder={t("notSet")}
              loading={updatingField === "department"}
              onChange={handleDepartmentChange}
              options={[
                { value: null, label: t("notSet") },
                ...departments.map((d) => ({ value: d.id, label: d.name })),
              ]}
            />
          ) : (
            intern.department?.name ?? "—"
          )}
        </div>

        {/* Position */}
        <div className="text-sm text-muted">
          {canUpdate ? (
            <InlineSelect
              ariaLabel="Position"
              value={intern.position?.id ?? null}
              placeholder={t("notSet")}
              loading={updatingField === "position"}
              onChange={handlePositionChange}
              options={[
                { value: null, label: t("notSet") },
                ...positions.map((p) => ({ value: p.id, label: p.name })),
              ]}
            />
          ) : (
            intern.position?.name ?? "—"
          )}
        </div>

        {/* Duration */}
        <div className="text-sm text-muted">
          <p className="text-foreground font-medium">{fmtDate(new Date(intern.startDate))}</p>
          <p className="text-xs text-muted/70">→ {fmtDate(endDate)}</p>
        </div>

        {/* Tasks Progress */}
        <div className="text-center">
          {total > 0 ? (
            <button
              onClick={() => setTasksModalOpen(true)}
              className={`text-sm font-medium transition hover:text-cyan-400 active:scale-95 ${
                completed === total ? "text-emerald-400" : "text-foreground"
              }`}
              title={t("viewTasks")}
            >
              {completed}/{total}
            </button>
          ) : (
            <span className="text-sm text-muted">0/0</span>
          )}
        </div>

        {/* Overdue Tasks */}
        <div className="text-sm text-center">
          {overdue > 0 ? (
            <button
              onClick={() => setOverdueModalOpen(true)}
              className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-xs font-semibold text-rose-400 border border-rose-500/20 transition hover:bg-rose-500/20 active:scale-95"
              title={t("viewOverdue")}
            >
              {overdue}
            </button>
          ) : (
            <span className="text-muted">—</span>
          )}
        </div>

        {/* Status */}
        <div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
              statusBadge[intern.status] ?? ""
            }`}
          >
            <Circle className="h-2 w-2 fill-current" />
            {statusLabels[intern.status] ?? intern.status}
          </span>
        </div>

        {/* Standardized 3-Dots Action Column via Portal */}
        <div className="flex items-center justify-end">
          <button
            ref={triggerRef}
            type="button"
            id={`leader-intern-action-trigger-${menuId}`}
            aria-label={t("actions")}
            aria-expanded={menuOpen}
            aria-haspopup="true"
            onClick={toggleMenu}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-200 active:scale-90 ${
              menuOpen
                ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shadow-sm"
                : "border-transparent text-muted hover:border-border hover:bg-slate-100 dark:hover:bg-white/5 hover:text-foreground"
            }`}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </Table.Row>

      {/* Standardized Table Action Menu Portal */}
      {menuOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-labelledby={`leader-intern-action-trigger-${menuId}`}
            style={{
              position: "fixed",
              top: menuPos.top,
              bottom: menuPos.bottom,
              left: menuPos.left,
              width: 190,
              maxHeight: menuPos.maxHeight,
              zIndex: 9999,
            }}
            className="overflow-y-auto rounded-xl border border-border/80 bg-card/95 p-1 shadow-[0_16px_48px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-all"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                router.push(`/leader/interns/${intern.id}`);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-foreground/90 transition hover:bg-slate-100 dark:hover:bg-white/10 hover:text-cyan-600 dark:hover:text-cyan-400 active:scale-95"
            >
              <Eye className="h-3.5 w-3.5 shrink-0 text-cyan-600 dark:text-cyan-400" />
              <span>{t("viewDetails")}</span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                setTasksModalOpen(true);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-foreground/90 transition hover:bg-slate-100 dark:hover:bg-white/10 hover:text-sky-600 dark:hover:text-sky-400 active:scale-95"
            >
              <ListTodo className="h-3.5 w-3.5 shrink-0 text-sky-600 dark:text-sky-400" />
              <span>{t("viewTasks")}</span>
            </button>

            {overdue > 0 && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  setOverdueModalOpen(true);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 transition hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-700 dark:hover:text-rose-300 active:scale-95"
              >
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{t("viewOverdue")}</span>
              </button>
            )}
          </div>,
          document.body,
        )}

      {/* Task & Overdue Modals */}
      {tasksModalOpen && (
        <InternTasksModal
          intern={intern}
          onClose={() => setTasksModalOpen(false)}
        />
      )}
      {overdueModalOpen && (
        <InternOverdueModal
          intern={intern}
          onClose={() => setOverdueModalOpen(false)}
        />
      )}
    </>
  );
}
