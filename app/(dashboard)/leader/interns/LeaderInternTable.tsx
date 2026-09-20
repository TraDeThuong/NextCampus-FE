"use client";

import { useContext, useMemo } from "react";
import { useTranslations } from "next-intl";
import { AuthContext } from "@/contexts/AuthContext";
import { ChevronLeft, ChevronRight, AlertCircle, Users } from "lucide-react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

import { useInterns } from "@/hooks/intern/useInterns";
import { useTaskAssignments } from "@/hooks/task-assignment/useTaskAssignments";
import type { InternQueryParams } from "@/types/intern";
import type { TaskAssignment } from "@/types/task-assignment";
import type { InternTeamProgress } from "@/types/stats";

import Table from "@/components/ui/Table";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import LeaderInternRow from "./LeaderInternRow";

const COLUMNS = "minmax(140px,1.2fr) minmax(110px,0.9fr) minmax(100px,0.8fr) 140px 90px 90px 140px 48px";

function extractArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && "data" in data && Array.isArray((data as { data: unknown }).data)) {
    return (data as { data: T[] }).data;
  }
  return [];
}

export default function LeaderInternTable() {
  const t = useTranslations("leader.interns");
  const auth = useContext(AuthContext);
  const currentUserId = auth?.state.user?.id;

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const params: InternQueryParams = useMemo(() => {
    const p: InternQueryParams = {};
    const fullName = searchParams.get("fullName");
    const department = searchParams.get("department");
    const position = searchParams.get("position");
    const status = searchParams.get("status");
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    if (fullName) p.fullName = fullName;
    if (department) p.department = department;
    if (position) p.position = position;
    if (status) p.status = status as InternQueryParams["status"];
    if (page) p.page = Number(page);
    if (limit) p.limit = Number(limit);
    if (currentUserId) p.leaderId = currentUserId;
    return p;
  }, [searchParams, currentUserId]);

  const { data, isPending, isError, refetch, isFetching } = useInterns(params);
  const { data: assignmentsData } = useTaskAssignments(
    currentUserId ? { leaderId: currentUserId, limit: 500 } : undefined,
  );

  const interns = data?.data ?? [];
  const meta = data?.meta;

  const rawAssignments = assignmentsData?.data;
  const assignments = useMemo(() => extractArray<TaskAssignment>(rawAssignments), [rawAssignments]);

  const progressMap = useMemo(() => {
    const now = new Date();
    const byIntern = new Map<string, { total: number; done: number; overdue: number }>();
    for (const a of assignments) {
      const entry = byIntern.get(a.internId) ?? { total: 0, done: 0, overdue: 0 };
      entry.total++;
      if (a.status === "DONE") entry.done++;
      if (a.task?.deadline && new Date(a.task.deadline) < now && a.status !== "DONE") entry.overdue++;
      byIntern.set(a.internId, entry);
    }
    const map = new Map<string, InternTeamProgress>();
    for (const [internId, counts] of byIntern) {
      const healthStatus = counts.overdue >= 2 ? "DANGER" : counts.overdue === 1 ? "WARNING" : "HEALTHY";
      map.set(internId, {
        internId,
        internName: "",
        internEmail: "",
        completedTasks: counts.done,
        totalTasks: counts.total,
        avgScore: 0,
        overdueCount: counts.overdue,
        healthStatus,
      });
    }
    return map;
  }, [assignments]);

  function goToPage(page: number) {
    const p = new URLSearchParams(searchParams.toString());
    p.set("page", String(page));
    router.push(`${pathname}?${p.toString()}`);
  }

  if (isPending) {
    return (
      <MetalCard className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </MetalCard>
    );
  }

  if (isError) {
    return (
      <MetalCard className="flex flex-col items-center justify-center gap-4 py-20 text-center px-4">
        <div className="rounded-2xl bg-rose-500/10 p-4 border border-rose-500/20 shadow-inner">
          <AlertCircle className="h-8 w-8 text-rose-400" />
        </div>
        <p className="text-sm font-medium text-rose-300">{t("loadError")}</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20 active:scale-95"
        >
          {t("statsError")}
        </button>
      </MetalCard>
    );
  }

  if (interns.length === 0) {
    return (
      <MetalCard className="flex flex-col items-center justify-center gap-4 py-20 text-center px-4">
        <div className="rounded-2xl bg-cyan-500/10 p-4 border border-cyan-500/20 shadow-inner">
          <Users className="h-8 w-8 text-cyan-400" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground">
            {t("noInterns")}
          </h3>
          <p className="text-xs text-muted max-w-sm">
            {t("description")}
          </p>
        </div>
      </MetalCard>
    );
  }

  return (
    <Table columns={COLUMNS}>
      <Table.Header>
        <div>{t("colIntern")}</div>
        <div>{t("colDepartment")}</div>
        <div>{t("colPosition")}</div>
        <div>{t("colDuration")}</div>
        <div>{t("colTasks")}</div>
        <div>{t("colOverdue")}</div>
        <div>{t("colStatus")}</div>
        <Table.ReloadButton onReload={refetch} isReloading={isFetching} />
      </Table.Header>

      <Table.Body
        data={interns}
        render={(intern) => (
          <LeaderInternRow
            key={intern.id}
            intern={intern}
            taskProgress={progressMap.get(intern.id)}
          />
        )}
      />

      {meta && meta.totalPages > 1 && (
        <Table.Footer>
          <div className="flex w-full items-center justify-between gap-4 text-sm">
            <p className="text-muted">
              {t("pagination", {
                page: meta.page,
                totalPages: meta.totalPages,
                total: meta.total,
              })}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={meta.page <= 1}
                onClick={() => goToPage(meta.page - 1)}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-muted transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-foreground disabled:opacity-30 active:scale-95"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={meta.page >= meta.totalPages}
                onClick={() => goToPage(meta.page + 1)}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-muted transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-foreground disabled:opacity-30 active:scale-95"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Table.Footer>
      )}
    </Table>
  );
}
