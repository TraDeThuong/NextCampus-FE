"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  Send,
  Play,
  AlertTriangle,
  FileText,
  Clock,
} from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import Table from "@/components/ui/Table";
import { useTaskAssignments } from "@/hooks/task-assignment/useTaskAssignments";
import { useStartTaskAssignment } from "@/hooks/task-assignment/useStartTaskAssignment";
import type { TaskAssignment, AssignmentStatus } from "@/types/task-assignment";
import type { TaskSubmission } from "@/types/task-submission";
import TaskDetailModal from "./TaskDetailModal";
import TaskSubmissionModal from "./TaskSubmissionModal";

const priorityBadge: Record<string, string> = {
  HIGH: "bg-red-500/10 text-red-400 border-red-500/30",
  MEDIUM: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  LOW: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
};

const statusBadge: Record<string, string> = {
  DONE: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  IN_PROGRESS: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  REVIEW: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  TODO: "border-slate-500/30 bg-slate-500/10 text-muted-foreground",
  BLOCKED: "border-red-500/30 bg-red-500/10 text-red-400",
  PENDING_APPROVAL: "border-amber-500/30 bg-amber-500/10 text-amber-400",
};

function extractArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (!data || typeof data !== "object") return [];
  if ("data" in data) {
    const inner = (data as { data: unknown }).data;
    if (Array.isArray(inner)) return inner as T[];
    if (
      inner &&
      typeof inner === "object" &&
      "data" in inner &&
      Array.isArray((inner as { data: unknown }).data)
    ) {
      return (inner as { data: T[] }).data;
    }
    if (
      inner &&
      typeof inner === "object" &&
      "items" in inner &&
      Array.isArray((inner as { items: unknown }).items)
    ) {
      return (inner as { items: T[] }).items;
    }
  }
  if ("items" in data && Array.isArray((data as { items: unknown }).items)) {
    return (data as { items: T[] }).items;
  }
  return [];
}

const TABLE_COLUMNS =
  "minmax(90px, 110px) minmax(220px, 2.6fr) minmax(130px, 1.2fr) minmax(90px, 0.9fr) minmax(120px, 1fr) 60px";

const PAGE_SIZE = 10;

function checkIsOverdue(deadline: string | undefined, status: string): boolean {
  if (!deadline || status === "DONE") return false;
  const d = new Date(deadline);
  d.setHours(23, 59, 59, 999);
  return d < new Date();
}

export default function InternTaskTable() {
  const t = useTranslations("intern.tasks");
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const search = searchParams.get("search")?.toLowerCase().trim() ?? "";
  const paramStatus = searchParams.get("status") as AssignmentStatus | null;
  const paramPriority = searchParams.get("priority");
  const deadlineFrom = searchParams.get("deadlineFrom");
  const deadlineTo = searchParams.get("deadlineTo");
  const urlPage = Number(searchParams.get("page")) || 1;
  const assignmentIdParam = searchParams.get("assignmentId");

  const [selectedAssignment, setSelectedAssignment] = useState<TaskAssignment | null>(null);
  const [submissionModalState, setSubmissionModalState] = useState<{
    isOpen: boolean;
    assignment: TaskAssignment | null;
    submission?: TaskSubmission;
    readOnly?: boolean;
  }>({
    isOpen: false,
    assignment: null,
  });

  const {
    data: assignmentsData,
    isLoading,
    refetch,
    isFetching,
  } = useTaskAssignments({
    limit: 300,
    status: paramStatus || undefined,
  });

  const rawAssignments = useMemo(
    () => extractArray<TaskAssignment>(assignmentsData),
    [assignmentsData],
  );

  // Client-side filtering
  const filteredAssignments = useMemo(() => {
    let list = [...rawAssignments];

    if (search) {
      list = list.filter((a) => {
        const code = a.task?.code?.toLowerCase() ?? "";
        const title = a.task?.title?.toLowerCase() ?? "";
        return code.includes(search) || title.includes(search);
      });
    }

    if (paramPriority) {
      list = list.filter((a) => a.task?.priority === paramPriority);
    }

    if (deadlineFrom || deadlineTo) {
      list = list.filter((a) => {
        if (!a.task?.deadline) return false;
        const d = new Date(a.task.deadline);
        if (deadlineFrom && d < new Date(deadlineFrom)) return false;
        if (deadlineTo) {
          const to = new Date(deadlineTo);
          to.setHours(23, 59, 59, 999);
          if (d > to) return false;
        }
        return true;
      });
    }

    return list.sort((a, b) => {
      const timeA = a.assignedAt ? new Date(a.assignedAt).getTime() : 0;
      const timeB = b.assignedAt ? new Date(b.assignedAt).getTime() : 0;
      if (timeA !== timeB) return timeB - timeA;
      const deadA = a.task?.deadline ? new Date(a.task.deadline).getTime() : 0;
      const deadB = b.task?.deadline ? new Date(b.task.deadline).getTime() : 0;
      return deadB - deadA;
    });
  }, [rawAssignments, search, paramPriority, deadlineFrom, deadlineTo]);

  const total = filteredAssignments.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, urlPage), totalPages);

  const paginatedAssignments = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAssignments.slice(start, start + PAGE_SIZE);
  }, [filteredAssignments, currentPage]);

  const goToPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(page));
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router],
  );

  // Derive assignment from URL param or state without setState in effect
  const selectedAssignmentFromUrl = useMemo(() => {
    if (!assignmentIdParam || rawAssignments.length === 0) return null;
    return (
      rawAssignments.find(
        (a) => a.id === assignmentIdParam || a.taskId === assignmentIdParam,
      ) ?? null
    );
  }, [assignmentIdParam, rawAssignments]);

  const activeAssignment = selectedAssignment ?? selectedAssignmentFromUrl;

  const handleOpenDetail = (assignment: TaskAssignment) => {
    setSelectedAssignment(assignment);
  };

  const handleCloseDetail = () => {
    setSelectedAssignment(null);
    if (assignmentIdParam) {
      const p = new URLSearchParams(searchParams.toString());
      p.delete("assignmentId");
      router.replace(`${pathname}?${p.toString()}`, { scroll: false });
    }
  };

  const handleOpenSubmission = (assignment: TaskAssignment) => {
    setSubmissionModalState({
      isOpen: true,
      assignment,
      submission: undefined,
      readOnly: false,
    });
  };

  const handleViewSubmission = (assignment: TaskAssignment, sub: TaskSubmission) => {
    setSubmissionModalState({
      isOpen: true,
      assignment,
      submission: sub,
      readOnly: true,
    });
  };

  const handleEditSubmission = (assignment: TaskAssignment, sub: TaskSubmission) => {
    setSubmissionModalState({
      isOpen: true,
      assignment,
      submission: sub,
      readOnly: false,
    });
  };

  return (
    <>
      {/* Mobile Card List View (< md) */}
      <div className="block md:hidden space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={`task-skel-${idx}`}
              className="rounded-2xl border border-border bg-card p-4 shadow-glass animate-pulse space-y-3"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 w-16 bg-white/10 rounded" />
                <div className="h-4 w-20 bg-white/10 rounded" />
              </div>
              <div className="h-5 w-3/4 bg-white/10 rounded" />
              <div className="h-4 w-1/2 bg-white/10 rounded" />
            </div>
          ))
        ) : paginatedAssignments.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center flex flex-col items-center justify-center shadow-glass">
            <FileText className="h-10 w-10 stroke-[1.2] mb-2 text-muted opacity-40" />
            <p className="text-sm font-semibold text-foreground">
              {t("noTasksFound")}
            </p>
            <p className="mt-1 text-xs text-muted max-w-xs">
              {search || paramStatus || paramPriority || deadlineFrom || deadlineTo
                ? t("noTasksFoundDesc")
                : t("noTasksAllocatedDesc")}
            </p>
          </div>
        ) : (
          paginatedAssignments.map((assignment) => {
            const isOverdue = checkIsOverdue(assignment.task.deadline, assignment.status);
            return (
              <div
                key={assignment.id}
                onClick={() => handleOpenDetail(assignment)}
                className="rounded-2xl border border-border bg-card p-4 shadow-glass transition hover:border-border-strong cursor-pointer space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md border border-border bg-card/80 text-primary-light">
                    {assignment.task.code || "UNTITLED"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase font-bold tracking-wider ${
                        priorityBadge[assignment.task.priority] ?? ""
                      }`}
                    >
                      {t.has(`priority${assignment.task.priority}`)
                        ? t(`priority${assignment.task.priority}`)
                        : assignment.task.priority}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase font-bold tracking-wider ${
                        statusBadge[assignment.status] ?? ""
                      }`}
                    >
                      {t.has(`status${assignment.status}`)
                        ? t(`status${assignment.status}`)
                        : assignment.status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-foreground line-clamp-2">
                    {assignment.task.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
                  <div className="flex items-center gap-1 text-muted">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className={isOverdue ? "text-rose-400 font-medium" : ""}>
                      {new Date(assignment.task.deadline).toLocaleDateString("vi-VN")}
                    </span>
                    {isOverdue && (
                      <span className="text-[10px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1 rounded ml-1 font-semibold">
                        {t("overdueBadge")}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDetail(assignment);
                    }}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
                  >
                    {t("viewDetails")} →
                  </button>
                </div>
              </div>
            );
          })
        )}

        {/* Mobile Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-4 border-t border-border/40 pt-4 text-xs text-muted">
            <p className="text-muted">
              {t("pagination", {
                page: currentPage,
                totalPages,
                total,
              })}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => goToPage(currentPage - 1)}
                className="rounded-xl border border-border bg-card px-3 py-1.5 text-muted transition hover:bg-card-hover hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => goToPage(currentPage + 1)}
                className="rounded-xl border border-border bg-card px-3 py-1.5 text-muted transition hover:bg-card-hover hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Table View (hidden md:block) */}
      <div className="hidden md:block">
        <Table columns={TABLE_COLUMNS}>
          <Table.Header>
            <div>{t("colCode")}</div>
            <div>{t("colTitle")}</div>
            <div>{t("colDeadline")}</div>
            <div>{t("colPriority")}</div>
            <div>{t("colStatus")}</div>
            <div className="flex items-center justify-end">
              <Table.ReloadButton onReload={refetch} isReloading={isFetching} />
            </div>
          </Table.Header>

          <Table.Body
            data={paginatedAssignments}
            isLoading={isLoading}
            emptyMessage={t("noTasksFound")}
            emptyDescription={
              search || paramStatus || paramPriority || deadlineFrom || deadlineTo
                ? t("noTasksFoundDesc")
                : t("noTasksAllocatedDesc")
            }
            render={(assignment) => {
              const isOverdue = checkIsOverdue(
                assignment.task.deadline,
                assignment.status,
              );
              return (
                <Table.Row
                  key={assignment.id}
                  onClick={() => handleOpenDetail(assignment)}
                >
                  {/* 1. Code */}
                  <div>
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md border border-border bg-card/80 text-primary-light">
                      {assignment.task.code || "UNTITLED"}
                    </span>
                  </div>

                  {/* 2. Title */}
                  <div className="min-w-0 pr-4 space-y-0.5">
                    <p className="text-sm font-semibold text-foreground truncate hover:text-cyan-400 transition-colors">
                      {assignment.task.title}
                    </p>
                    {assignment.task.recreatedTaskId && (
                      <span className="inline-flex items-center text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded font-mono">
                        Recreated
                      </span>
                    )}
                  </div>

                  {/* 3. Deadline */}
                  <div className="flex items-center gap-1.5 text-xs text-muted">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span className={isOverdue ? "text-rose-400 font-semibold" : "text-foreground/90 font-medium"}>
                      {new Date(assignment.task.deadline).toLocaleDateString("vi-VN")}
                    </span>
                    {isOverdue && (
                      <span className="text-[10px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded font-bold">
                        {t("overdueBadge")}
                      </span>
                    )}
                  </div>

                  {/* 4. Priority */}
                  <div>
                    <span
                      className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-mono uppercase font-bold tracking-wider ${
                        priorityBadge[assignment.task.priority] ?? ""
                      }`}
                    >
                      {t.has(`priority${assignment.task.priority}`)
                        ? t(`priority${assignment.task.priority}`)
                        : assignment.task.priority}
                    </span>
                  </div>

                  {/* 5. Status */}
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-mono uppercase font-bold tracking-wider ${
                        statusBadge[assignment.status] ?? ""
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                      {t.has(`status${assignment.status}`)
                        ? t(`status${assignment.status}`)
                        : assignment.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* 6. Actions Menu */}
                  <div
                    className="flex items-center justify-end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <TaskTableRowActions
                      assignment={assignment}
                      onOpenDetail={() => handleOpenDetail(assignment)}
                      onOpenSubmission={() => handleOpenSubmission(assignment)}
                    />
                  </div>
                </Table.Row>
              );
            }}
          />

          {totalPages > 1 && (
            <Table.Footer>
              <div className="flex w-full items-center justify-between gap-4 text-sm">
                <p className="text-muted text-xs sm:text-sm">
                  {t("pagination", {
                    page: currentPage,
                    totalPages,
                    total,
                  })}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => goToPage(currentPage - 1)}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-muted transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => goToPage(currentPage + 1)}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-muted transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Table.Footer>
          )}
        </Table>
      </div>

      {/* Task Detail Modal */}
      {activeAssignment && (
        <TaskDetailModal
          assignment={activeAssignment}
          onClose={handleCloseDetail}
          onOpenSubmission={() => handleOpenSubmission(activeAssignment)}
          onViewSubmission={(sub) => handleViewSubmission(activeAssignment, sub)}
          onEditSubmission={(sub) => handleEditSubmission(activeAssignment, sub)}
        />
      )}

      {/* Task Submission Modal */}
      {submissionModalState.isOpen && submissionModalState.assignment && (
        <TaskSubmissionModal
          assignmentId={submissionModalState.assignment.id}
          assignment={submissionModalState.assignment}
          submission={submissionModalState.submission}
          readOnly={submissionModalState.readOnly}
          onClose={() =>
            setSubmissionModalState({
              isOpen: false,
              assignment: null,
              submission: undefined,
              readOnly: false,
            })
          }
        />
      )}
    </>
  );
}

const MENU_WIDTH = 190;
const ESTIMATED_HEIGHT = 160;

function TaskTableRowActions({
  assignment,
  onOpenDetail,
  onOpenSubmission,
}: {
  assignment: TaskAssignment;
  onOpenDetail: () => void;
  onOpenSubmission: () => void;
}) {
  const t = useTranslations("intern.tasks");
  const startTaskMutation = useStartTaskAssignment();
  const [menuOpen, setMenuOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const [openUpward, setOpenUpward] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updateMenuPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const spaceBelow = vh - rect.bottom;
    const spaceAbove = rect.top;
    const shouldFlip =
      spaceBelow < ESTIMATED_HEIGHT && spaceAbove > spaceBelow;

    setOpenUpward(shouldFlip);
    const left = Math.max(
      8,
      Math.min(rect.right - MENU_WIDTH, vw - MENU_WIDTH - 8),
    );
    const top = shouldFlip ? rect.top - 6 : rect.bottom + 6;
    setCoords({ top, left });
  }, []);

  const toggleMenu = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!menuOpen) {
        updateMenuPosition();
        setMenuOpen(true);
      } else {
        setMenuOpen(false);
      }
    },
    [menuOpen, updateMenuPosition],
  );

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    };

    const handleScrollOrResize = () => {
      setMenuOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown, {
      passive: true,
    });
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [menuOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleMenu}
        aria-haspopup="true"
        aria-expanded={menuOpen}
        aria-label="Task actions"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-muted transition hover:border-border hover:bg-card-hover hover:text-foreground active:scale-90 cursor-pointer"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {menuOpen &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: openUpward ? undefined : `${coords.top}px`,
              bottom: openUpward
                ? `${window.innerHeight - coords.top}px`
                : undefined,
              left: `${coords.left}px`,
              width: `${MENU_WIDTH}px`,
              zIndex: 9999,
              maxHeight: "calc(100vh - 24px)",
              overflowY: "auto",
            }}
            className="rounded-2xl border border-border bg-card/95 p-1.5 shadow-glass backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* View Details */}
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onOpenDetail();
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-white/5 hover:text-cyan-400 transition cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
              <span>{t("viewDetails")}</span>
            </button>

            {/* Start Task (TODO) */}
            {assignment.status === "TODO" && (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  startTaskMutation.mutate(assignment.id);
                }}
                disabled={startTaskMutation.isPending}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 transition cursor-pointer disabled:opacity-50"
              >
                <Play className="h-3.5 w-3.5 shrink-0" />
                <span>{t("startWorking")}</span>
              </button>
            )}

            {/* Submit Work (IN_PROGRESS) */}
            {assignment.status === "IN_PROGRESS" && (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenSubmission();
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-cyan-400 hover:bg-cyan-500/10 transition cursor-pointer"
              >
                <Send className="h-3.5 w-3.5 shrink-0" />
                <span>{t("submitWork")}</span>
              </button>
            )}

            {/* Report Blocker (IN_PROGRESS) */}
            {assignment.status === "IN_PROGRESS" && (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenDetail();
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-amber-400 hover:bg-amber-500/10 transition cursor-pointer"
              >
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>{t("blockTask")}</span>
              </button>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
