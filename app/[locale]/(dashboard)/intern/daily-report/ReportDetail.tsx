"use client";

import { FileText, Link, Video, ExternalLink, AlertCircle, Download } from "lucide-react";
import { useTranslations } from "next-intl";
import MetalCard from "@/components/ui/MetalCard";
import Button from "@/components/ui/Button";
import { useReportAttachments } from "@/hooks/report-attachment/useReportAttachments";
import type { DailyReport } from "@/types/daily-report";

type Props = {
  report: DailyReport | null;
  isLoading: boolean;
  missingDate?: string | null;
  onEdit?: (report: DailyReport) => void;
};

export default function ReportDetail({ report, isLoading, missingDate, onEdit }: Props) {
  const t = useTranslations("leader.dailyReports");
  const { data: attachmentsData } = useReportAttachments(report?.id);
  const attachments = attachmentsData?.data ?? [];

  if (!report && missingDate) {
    const formatted = new Date(missingDate + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
    return (
      <MetalCard>
        <div className="rounded-3xl p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 mb-4">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-red-300 mb-2">{t("missingReport")}</h3>
          <p className="text-sm text-slate-400 max-w-xs">{formatted}</p>
          <p className="text-sm text-slate-500 mt-1">{t("missingReportDesc")}</p>
        </div>
      </MetalCard>
    );
  }

  if (!report && isLoading) {
    return (
      <MetalCard>
        <div className="rounded-3xl p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-48 rounded-lg bg-white/5" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded-lg bg-white/5" />
              <div className="h-4 w-3/4 rounded-lg bg-white/5" />
              <div className="h-4 w-1/2 rounded-lg bg-white/5" />
            </div>
          </div>
        </div>
      </MetalCard>
    );
  }

  if (!report) {
    return (
      <MetalCard>
        <div className="rounded-3xl p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 mb-4">
            <FileText className="h-8 w-8 text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-400 mb-2">{t("noReportSelected")}</h3>
          <p className="text-sm text-slate-600 max-w-xs">{t("noReportHint")}</p>
        </div>
      </MetalCard>
    );
  }

  const createdDate = new Date(report.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const createdTime = new Date(report.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  return (
    <MetalCard>
      <div className="rounded-3xl p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-cyan-400 shrink-0" />
              <span className="metal-text">{t("reportTitle")}</span>
            </h3>
            <p className="mt-1 text-sm text-slate-500">{createdDate} at {createdTime}</p>
          </div>
          {onEdit && (
            <Button variant="metal-blue" size="sm" onClick={() => onEdit(report)}>{t("edit")}</Button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t("content")}</h4>
            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{report.content}</p>
          </div>

          {report.prLink && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t("prLink")}</h4>
              <a href={report.prLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition">
                <Link className="h-4 w-4" />{report.prLink}<ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {report.videoDemo && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t("videoDemo")}</h4>
              <a href={report.videoDemo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition">
                <Video className="h-4 w-4" />{t("viewVideo")}<ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {attachments.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t("attachments", { count: attachments.length })}</h4>
              <div className="space-y-1.5">
                {attachments.map((att) => (
                  <a key={att.id} href={att.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 hover:bg-white/10 transition group">
                    <span className="text-sm text-slate-300 truncate">{att.fileName}</span>
                    <Download className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 transition shrink-0 ml-2" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </MetalCard>
  );
}
