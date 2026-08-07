"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useInternStats } from "@/hooks/stats/useInternStats";
import StatsCard from "./StatsCard";
import Spinner from "../ui/Spinner";
import MetalCard from "../ui/MetalCard";
import RejectedSubmissionsCard from "./RejectedSubmissionsCard";
import Table from "../ui/Table";
import { ClipboardList, CheckCircle2, Calendar, Award, ExternalLink, Clock, FileCheck } from "lucide-react";

export default function InternStatsOverview() {
  const t = useTranslations("intern.dashboard");
  const { data: response, isLoading, isError, refetch } = useInternStats();

  if (isLoading) return <div className="flex h-64 w-full items-center justify-center"><Spinner size="lg" /></div>;

  if (isError || !response?.success) {
    return (
      <div className="rounded-2xl border border-danger/30 bg-danger/10 p-6 text-center text-danger space-y-3">
        <p className="font-semibold">{t("loadError")}</p>
        <button onClick={() => refetch()} className="px-4 py-2 rounded-xl bg-danger text-white text-xs font-bold hover:opacity-90 transition-all cursor-pointer">{t("retry")}</button>
      </div>
    );
  }

  const stats = response.data;
  const todaysTasks = stats.todaysTasks ?? [];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground metal-text">{t("greeting", { name: stats.internName })}</h1>
          <p className="text-sm text-muted">{t("welcome")}</p>
        </div>
        <Link href="/intern/daily-report" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-primary-main to-primary-light text-white font-semibold shadow-soft hover:opacity-90 transition-all text-sm">
          <Calendar className="h-4 w-4" />{t("submitTodayReport")}
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title={t("tasksInProgress")} value={stats.tasksInProgress} subtitle={t("totalTasks", { n: stats.totalTasks })} icon={<ClipboardList className="h-6 w-6 text-cyan-400" />} href="/intern/task"
          trend={{ text: t("completionRate", { n: stats.completionRate }), positive: true }} />
        <StatsCard title={t("tasksCompleted")} value={stats.tasksCompleted} subtitle={t("completedOf", { done: stats.tasksCompleted, total: stats.totalTasks })} icon={<CheckCircle2 className="h-6 w-6 text-emerald-400" />} href="/intern/task?status=DONE"
          trend={{ text: t("updateProgress"), positive: true }} />
        <StatsCard title={t("todaysReport")} value={stats.dailyReportTodaySubmitted ? t("submitted") : t("notSubmitted")}
          subtitle={stats.dailyReportTodaySubmitted ? t("onTime") : t("submitByEvening")} icon={<FileCheck className="h-6 w-6 text-amber-400" />} href="/intern/daily-report"
          trend={{ text: stats.dailyReportTodaySubmitted ? t("completeStatus") : t("submitNowStatus"), positive: stats.dailyReportTodaySubmitted }} />
        <StatsCard title={t("weeklyScore")} value={typeof stats.lastWeekScore === "number" ? `${stats.lastWeekScore.toFixed(1)}/10` : `${stats.avgScore.toFixed(1)}/10`}
          subtitle={t("avgScore", { score: stats.avgScore.toFixed(1) })} icon={<Award className="h-6 w-6 text-indigo-400" />} href="/intern/weekly-evaluation"
          trend={{ text: t("scoreResults"), positive: stats.avgScore >= 7 }} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <RejectedSubmissionsCard />

        <MetalCard className="p-6 lg:col-span-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2"><Clock className="h-5 w-5 text-amber-400" />{t("tasksToDos")}</h3>
            <Link href="/intern/task" className="text-xs font-medium text-primary-light hover:underline flex items-center gap-1">{t("viewAllTasks")} <ExternalLink className="h-3.5 w-3.5" /></Link>
          </div>

          <div className="mt-5 space-y-4">
            <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${stats.dailyReportTodaySubmitted ? "border-emerald-500/30 bg-emerald-500/10" : "border-amber-500/30 bg-amber-500/10"}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${stats.dailyReportTodaySubmitted ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}><Calendar className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm font-bold text-foreground">{t("dailyReport")}</p>
                  <p className="text-xs text-muted">{stats.dailyReportTodaySubmitted ? t("reportSubmittedMsg") : t("reportNotSubmittedMsg")}</p>
                </div>
              </div>
              {!stats.dailyReportTodaySubmitted && <Link href="/intern/daily-report" className="px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-all shrink-0">{t("submitNow")}</Link>}
            </div>

            <div className="pt-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">{t("recentlyAssigned")}</p>
              <Table columns="2.5fr 1fr 1.5fr">
                <Table.Header><span>{t("colTaskName")}</span><span>{t("colPriority")}</span><span>{t("colStatusDeadline")}</span></Table.Header>
                <Table.Body data={todaysTasks.slice(0, 5)} render={(task) => (
                  <Table.Row key={task.id}>
                    <div><p className="font-semibold text-foreground text-sm">{task.taskTitle}</p><p className="text-xs text-muted">{t("leader")} {task.leaderName}</p></div>
                    <div><span className={`inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${task.taskPriority === "HIGH" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : task.taskPriority === "MEDIUM" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>{task.taskPriority}</span></div>
                    <div><span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-lg ${task.status === "DONE" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : task.status === "IN_PROGRESS" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "bg-slate-500/10 text-slate-300 border border-slate-500/20"}`}>{task.status}</span></div>
                  </Table.Row>
                )} />
              </Table>
            </div>
          </div>
        </MetalCard>

        <MetalCard className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4"><h3 className="text-lg font-semibold text-foreground flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-400" />{t("internshipProgress")}</h3></div>
            <div className="mt-6 text-center space-y-4">
              <div className="inline-flex h-32 w-32 items-center justify-center rounded-full border-4 border-primary-light/30 bg-primary-light/5 p-4 shadow-glass"><div><span className="text-3xl font-extrabold text-foreground metal-text">{stats.completionRate}%</span><span className="block text-[10px] text-muted uppercase font-semibold">{t("completed")}</span></div></div>
              <p className="text-xs text-muted" dangerouslySetInnerHTML={{ __html: t("completedTasksMsg", { done: stats.tasksCompleted, total: stats.totalTasks, strong: (chunks) => `<strong>${chunks}</strong>` }) }} />
            </div>
          </div>
          <div className="pt-6 border-t border-white/10 mt-6">
            <Link href="/intern/task" className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground font-semibold text-sm hover:bg-white/10 transition-all">{t("viewTaskDetails")} <ExternalLink className="h-4 w-4" /></Link>
          </div>
        </MetalCard>
      </div>
    </div>
  );
}
