"use client";

import { useTranslations } from "next-intl";
import { AssignmentDetail } from "@/types/stats";
import Table from "../ui/Table";
import Spinner from "../ui/Spinner";
import { HiXMark } from "react-icons/hi2";
import { createPortal } from "react-dom";
import useOutsideClick from "@/hooks/useOutsideClick";

interface TaskAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  assignments: AssignmentDetail[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  page?: number;
  totalPages?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
}

export default function TaskAssignmentModal({
  isOpen,
  onClose,
  title,
  assignments,
  isLoading = false,
  isError = false,
  onRetry,
  page = 1,
  totalPages = 1,
  totalItems = assignments.length,
  onPageChange,
}: TaskAssignmentModalProps) {
  const t = useTranslations();
  const ref = useOutsideClick<HTMLDivElement>(onClose);
  const statusLabels: Record<string, string> = {
    PENDING_APPROVAL: t("admin.taskModal.statusPendingApproval"),
    TODO: t("admin.taskModal.statusTodo"),
    IN_PROGRESS: t("admin.taskModal.statusInProgress"),
    REVIEW: t("admin.taskModal.statusReview"),
    DONE: t("admin.taskModal.statusDone"),
    BLOCKED: t("admin.taskModal.statusBlocked"),
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-fadeIn">
      <div
        ref={ref}
        className="relative w-full max-w-5xl max-h-[85vh] overflow-y-auto rounded-[28px] border border-white/10 bg-card p-6 sm:p-8 shadow-glass backdrop-blur-2xl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted hover:text-foreground hover:bg-white/10 transition-all cursor-pointer"
        >
          <HiXMark className="h-6 w-6" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground metal-text">
            {title}
          </h2>
          <p className="text-xs text-muted mt-1">
            {t("admin.taskModal.showingItems", { n: totalItems })}
          </p>
        </div>

        {isLoading ? (
          <div className="flex min-h-48 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02]">
            <div className="flex flex-col items-center gap-3">
              <Spinner />
              <p className="text-sm text-muted">{t("admin.taskModal.loading")}</p>
            </div>
          </div>
        ) : isError ? (
          <div className="space-y-3 rounded-2xl border border-danger/20 bg-danger/5 py-12 text-center">
            <p className="text-sm text-danger">{t("admin.taskModal.loadError")}</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="rounded-xl bg-danger px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90 cursor-pointer"
              >
                {t("common.retry")}
              </button>
            )}
          </div>
        ) : assignments.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border border-white/5 bg-white/[0.02]">
            <p className="text-sm text-muted">{t("admin.taskModal.noTasks")}</p>
          </div>
        ) : (
          <Table columns="2fr 1.5fr 1.5fr 1fr 1fr">
            <Table.Header>
              <span>{t("admin.taskModal.colTask")}</span>
              <span>{t("admin.taskModal.colIntern")}</span>
              <span>{t("admin.taskModal.colLeader")}</span>
              <span>{t("admin.taskModal.colDeadline")}</span>
              <span>{t("admin.taskModal.colStatus")}</span>
            </Table.Header>

            <Table.Body
              data={assignments}
              render={(item) => (
                <Table.Row key={item.id}>
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      {item.taskTitle}
                    </p>
                    <span
                      className={`inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full mt-1 ${
                        item.taskPriority === "HIGH"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : item.taskPriority === "MEDIUM"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      {t("common.priority", { priority: item.taskPriority })}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {item.internName}
                    </p>
                    <p className="text-xs text-muted/80">{item.internEmail}</p>
                  </div>

                  <div>
                    <p className="text-sm text-foreground">{item.leaderName}</p>
                  </div>

                  <div>
                    {item.taskDeadline ? (
                      <span
                        className={`text-xs font-medium ${
                          item.isOverdue ? "text-rose-400 font-bold" : "text-muted"
                        }`}
                      >
                        {new Date(item.taskDeadline).toLocaleDateString("vi-VN")}
                        {item.isOverdue && (
                          <span className="block text-[10px] text-rose-400">
                            {t("common.overdue")}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-xs text-muted">{t("common.noLimit")}</span>
                    )}
                  </div>

                  <div>
                    <span
                      className={`inline-block max-w-full whitespace-normal break-words text-center text-xs font-semibold leading-tight px-2.5 py-1 rounded-lg ${
                        item.status === "PENDING_APPROVAL"
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          : item.status === "IN_PROGRESS"
                          ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                          : item.status === "REVIEW"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : item.status === "DONE"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : item.status === "BLOCKED"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : "bg-slate-500/10 text-slate-300 border border-slate-500/20"
                      }`}
                    >
                      {statusLabels[item.status] ?? item.status}
                    </span>
                  </div>
                </Table.Row>
              )}
            />
          </Table>
        )}

        {!isLoading && !isError && totalPages > 1 && onPageChange && (
          <div className="mt-5 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-4 sm:flex-row">
            <p className="text-xs text-muted">
              {t("admin.taskModal.pagination", {
                page,
                totalPages,
                total: totalItems,
              })}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              >
                {t("admin.taskModal.previous")}
              </button>
              <button
                type="button"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              >
                {t("admin.taskModal.next")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
