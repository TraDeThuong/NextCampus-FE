"use client";

import { useContext, useMemo } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

import { useInterns } from "@/hooks/intern/useInterns";
import { useTaskAssignments } from "@/hooks/task-assignment/useTaskAssignments";
import type { InternQueryParams } from "@/types/intern";
import type { InternTeamProgress } from "@/types/stats";

import Table from "@/components/ui/Table";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import LeaderInternRow from "./LeaderInternRow";

const COLUMNS =
  "minmax(200px,2fr) minmax(100px,1fr) minmax(110px,1fr) 80px 70px 75px 85px 40px";

export default function LeaderInternTable() {
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

    if (currentUserId) {
      p.leaderId = currentUserId;
    }

    return p;
  }, [searchParams, currentUserId]);

  const { data, isPending, isError } = useInterns(params);
  const { data: assignmentsData } = useTaskAssignments(
    currentUserId ? { leaderId: currentUserId, limit: 500 } : undefined,
  );

  const interns = data?.data ?? [];
  const meta = data?.meta;
  const assignments = assignmentsData?.data ?? [];

  const progressMap = useMemo(() => {
    const now = new Date();
    const byIntern = new Map<string, { total: number; done: number; overdue: number }>();

    for (const a of assignments) {
      const entry = byIntern.get(a.internId) ?? { total: 0, done: 0, overdue: 0 };
      entry.total++;
      if (a.status === "DONE") entry.done++;
      if (a.task.deadline && new Date(a.task.deadline) < now && a.status !== "DONE") {
        entry.overdue++;
      }
      byIntern.set(a.internId, entry);
    }

    const map = new Map<string, InternTeamProgress>();
    for (const [internId, counts] of byIntern) {
      const healthStatus =
        counts.overdue >= 2
          ? "DANGER"
          : counts.overdue === 1
            ? "WARNING"
            : "HEALTHY";

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
      <MetalCard className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </MetalCard>
    );
  }

  if (isError) {
    return (
      <MetalCard className="flex flex-col items-center justify-center gap-3 py-20">
        <AlertTriangle className="h-8 w-8 text-red-400" />
        <p className="text-sm text-slate-400">
          Failed to load interns.
        </p>
      </MetalCard>
    );
  }

  if (interns.length === 0) {
    return (
      <MetalCard className="flex flex-col items-center justify-center gap-3 py-20">
        <p className="text-sm text-slate-500">No interns found.</p>
      </MetalCard>
    );
  }

  return (
    <Table
      columns={COLUMNS}
      className="
        bg-[linear-gradient(145deg,#101827_0%,#1a2235_20%,#0f172a_55%,#050816_100%)]
        shadow-[0_12px_40px_rgba(0,0,0,.45)]
        hover:shadow-[0_20px_50px_rgba(21,174,245,.15)]
        transition-shadow duration-500
      "
    >
      <Table.Header>
        <div>Intern</div>
        <div>Department</div>
        <div>Position</div>
        <div>Duration</div>
        <div>Tasks</div>
        <div>Overdue</div>
        <div>Status</div>
        <div />
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
              Page {meta.page} of {meta.totalPages} &middot;{" "}
              {meta.total} total
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={meta.page <= 1}
                onClick={() => goToPage(meta.page - 1)}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-muted transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-foreground disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                disabled={meta.page >= meta.totalPages}
                onClick={() => goToPage(meta.page + 1)}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-muted transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-foreground disabled:opacity-30"
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
