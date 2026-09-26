"use client";

import { useState } from "react";
import { Users, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import { useMyTaskGroup } from "@/hooks/task-group/useMyTaskGroup";
import { useTaskGroupTasks } from "@/hooks/task-group/useTaskGroupTasks";
import SquadOverviewBanner from "./SquadOverviewBanner";
import SquadViewModeToggle from "./SquadViewModeToggle";
import SquadKanbanBoard from "./SquadKanbanBoard";
import SquadDependencyGraph from "./SquadDependencyGraph";
import TaskDetailModal from "../TaskDetailModal";
import TaskSubmissionModal from "../TaskSubmissionModal";
import TaskExtensionRequestModal from "../TaskExtensionRequestModal";
import { useAuth } from "@/hooks/auth/useAuth";
import type { TaskGroupTask } from "@/types/task-group";
import type { TaskAssignment, AssignmentStatus } from "@/types/task-assignment";
import type { TaskSubmission } from "@/types/task-submission";

function mapGroupTaskToAssignment(task: TaskGroupTask): TaskAssignment {
  return {
    id: task.assignment?.id || task.id,
    taskId: task.id,
    internId: task.assignment?.internId || "",
    supportId: task.assignment?.supportId || null,
    assignedBy: task.createdBy,
    status: (task.assignment?.status || "TODO") as AssignmentStatus,
    blockedReason: null,
    assignedAt: task.createdAt,
    updatedAt: task.createdAt,
    task: {
      id: task.id,
      code: task.code,
      title: task.title,
      description: task.description,
      deadline: task.deadline,
      estDays: task.estDays,
      priority: task.priority,
      createdBy: task.createdBy,
      createdAt: task.createdAt,
      updatedAt: task.createdAt,
      recreatedTaskId: null,
      recreatedTask: null,
      dependsOn: task.dependsOn,
      dependencies: task.dependencies,
    },
    intern: {
      id: task.assignment?.intern?.id || "",
      userId: "",
      leaderId: null,
      fullName: task.assignment?.intern?.fullName || "Chưa phân công",
      phone: "",
      department: null,
      position: null,
      startDate: "",
      duration: 0,
      discordUsername: null,
      discordRoleGranted: false,
      status: "ACTIVE",
      createdAt: task.createdAt,
      updatedAt: task.createdAt,
      user: {
        id: "",
        email: task.assignment?.intern?.user?.email || "",
        fullName: task.assignment?.intern?.fullName || "",
      },
    },
    support: task.assignment?.support
      ? {
          id: task.assignment.support.id,
          fullName: task.assignment.support.fullName,
          user: {
            id: "",
            email: task.assignment.support.user?.email || "",
            fullName: task.assignment.support.fullName,
            avatarUrl: task.assignment.support.user?.avatarUrl || null,
          },
        }
      : null,
    assigner: {
      id: task.createdBy,
      email: "",
      fullName: "Leader",
    },
  };
}

export default function SquadViewContainer() {
  const t = useTranslations("intern.tasks");
  const [viewMode, setViewMode] = useState<"kanban" | "graph">("kanban");

  const [selectedTask, setSelectedTask] = useState<TaskGroupTask | null>(null);
  const [submissionModalState, setSubmissionModalState] = useState<{
    isOpen: boolean;
    assignment: TaskAssignment | null;
    submission?: TaskSubmission;
    readOnly?: boolean;
  }>({
    isOpen: false,
    assignment: null,
  });
  const [extensionModalState, setExtensionModalState] = useState<{
    isOpen: boolean;
    assignment: TaskAssignment | null;
  }>({
    isOpen: false,
    assignment: null,
  });

  const { state: authState } = useAuth();
  const currentUserId = authState.user?.id;
  const currentUserEmail = authState.user?.email;

  const isOwnTask = (task: TaskGroupTask) => {
    if (!task.assignment) return false;
    const internUserEmail = task.assignment.intern?.user?.email;
    const internId = task.assignment.internId;
    const internUserId = (task.assignment.intern as unknown as { userId?: string })?.userId;
    const supportEmail = task.assignment.support?.user?.email;
    const supportId = task.assignment.supportId;
    const supportUserId = (task.assignment.support as unknown as { userId?: string })?.userId;

    const matchesEmail = Boolean(
      currentUserEmail &&
      (internUserEmail === currentUserEmail || supportEmail === currentUserEmail)
    );
    const matchesId = Boolean(
      currentUserId &&
      (internId === currentUserId ||
       internUserId === currentUserId ||
       supportId === currentUserId ||
       supportUserId === currentUserId)
    );

    return matchesEmail || matchesId;
  };

  const { activeGroup, groupId, isLoading: isLoadingGroup, refetch: refetchGroup } = useMyTaskGroup();
  const {
    data: tasksData,
    isLoading: isLoadingTasks,
    refetch: refetchTasks,
    isFetching: isFetchingTasks,
  } = useTaskGroupTasks(groupId || "", Boolean(groupId));

  const tasks: TaskGroupTask[] = Array.isArray(tasksData)
    ? tasksData
    : (tasksData as { data?: TaskGroupTask[] })?.data || [];

  if (isLoadingGroup) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!activeGroup || !groupId) {
    return (
      <MetalCard className="p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400 mb-4">
          <Users className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-1">{t("noGroupJoined")}</h3>
        <p className="text-sm text-muted max-w-md mx-auto">{t("noGroupJoinedDesc")}</p>
      </MetalCard>
    );
  }

  const handleRefresh = () => {
    refetchTasks();
    refetchGroup();
  };

  const selectedAssignment = selectedTask ? mapGroupTaskToAssignment(selectedTask) : null;

  return (
    <div className="space-y-6">
      {/* 1. Squad Banner */}
      <SquadOverviewBanner group={activeGroup} tasks={tasks} />

      {/* 2. Sub-header Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            {viewMode === "kanban" ? t("viewKanban") : t("viewGraph")}
          </span>
          <span className="text-xs font-mono text-muted bg-surface-elevated px-2 py-0.5 rounded border border-border/80">
            {tasks.length} tasks
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isFetchingTasks}
            className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-surface-elevated px-3 py-2 text-xs font-medium text-muted hover:text-foreground hover:bg-slate-100 shadow-sm dark:shadow-none dark:border-white/10 dark:bg-slate-900/60 dark:hover:bg-white/5 transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetchingTasks ? "animate-spin text-cyan-500 dark:text-cyan-400" : ""}`} />
            <span className="hidden sm:inline">{t("refresh")}</span>
          </button>

          <SquadViewModeToggle mode={viewMode} onChange={setViewMode} />
        </div>
      </div>

      {/* 3. Main Squad Board / Graph */}
      {isLoadingTasks ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner />
        </div>
      ) : viewMode === "kanban" ? (
        <SquadKanbanBoard
          tasks={tasks}
          onSelectTask={(task) => setSelectedTask(task)}
          onRefresh={handleRefresh}
        />
      ) : (
        <SquadDependencyGraph
          tasks={tasks}
          onSelectTask={(task) => setSelectedTask(task)}
        />
      )}

      {/* 4. Task Detail Modal */}
      {selectedAssignment && (
        <TaskDetailModal
          assignment={selectedAssignment}
          onClose={() => setSelectedTask(null)}
          onOpenSubmission={() => {
            setSubmissionModalState({
              isOpen: true,
              assignment: selectedAssignment,
            });
          }}
          onViewSubmission={(submission) => {
            setSubmissionModalState({
              isOpen: true,
              assignment: selectedAssignment,
              submission,
              readOnly: true,
            });
          }}
          onEditSubmission={(submission) => {
            setSubmissionModalState({
              isOpen: true,
              assignment: selectedAssignment,
              submission,
              readOnly: false,
            });
          }}
          onOpenExtensionRequest={() => {
            setExtensionModalState({
              isOpen: true,
              assignment: selectedAssignment,
            });
          }}
        />
      )}

      {/* 5. Modals for Submission & Extension */}
      {submissionModalState.isOpen && submissionModalState.assignment && (
        <TaskSubmissionModal
          assignmentId={submissionModalState.assignment.id}
          assignment={submissionModalState.assignment}
          submission={submissionModalState.submission}
          readOnly={submissionModalState.readOnly}
          onClose={() => {
            setSubmissionModalState({ isOpen: false, assignment: null });
            handleRefresh();
          }}
        />
      )}

      {extensionModalState.isOpen && extensionModalState.assignment && (
        <TaskExtensionRequestModal
          isOpen={extensionModalState.isOpen}
          assignment={extensionModalState.assignment}
          onClose={() => {
            setExtensionModalState({ isOpen: false, assignment: null });
            handleRefresh();
          }}
        />
      )}
    </div>
  );
}
