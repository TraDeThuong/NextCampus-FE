"use client";

import { useState } from "react";
import { Bell, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useNotificationTemplates } from "@/hooks/notificationTemplate/useNotificationTemplates";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import TemplateSidebar from "./TemplateSidebar";
import TemplateEditor from "./TemplateEditor";
import SendNotificationTab from "./SendNotificationTab";

export default function TemplatesPage() {
  const t = useTranslations();
  const { data, isPending, isError } = useNotificationTemplates();
  const [selectedType, setSelectedType] = useState<string>("TASK_ASSIGNMENT");
  const [mode, setMode] = useState<"templates" | "send">("templates");

  const templates = data?.data ?? [];

  const selectedTemplate =
    templates.find((t) => t.type === selectedType) ?? null;

  return (
    <div className="space-y-6">
      <MetalCard>
        <div className="rounded-3xl p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
                <Bell className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold metal-text">
                  {t("admin.emails.title")}
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  {mode === "templates"
                    ? t("admin.emails.descTemplates")
                    : t("admin.emails.descSend")}
                </p>
              </div>
            </div>

            <div className="flex rounded-xl bg-slate-950 p-1 border border-white/5 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setMode("templates")}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  mode === "templates"
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {t("admin.emails.templateSettings")}
              </button>
              <button
                type="button"
                onClick={() => setMode("send")}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  mode === "send"
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {t("admin.emails.sendCustom")}
              </button>
            </div>
          </div>
        </div>
      </MetalCard>

      {mode === "send" ? (
        <SendNotificationTab />
      ) : isPending ? (
        <MetalCard className="flex items-center justify-center py-24">
          <Spinner size="lg" />
        </MetalCard>
      ) : isError ? (
        <MetalCard className="flex flex-col items-center justify-center gap-3 py-24">
          <AlertTriangle className="h-8 w-8 text-red-400" />
          <p className="text-sm text-slate-400">
            {t("admin.emails.loadError")}
          </p>
        </MetalCard>
      ) : (
        <div className="flex gap-6 items-stretch">
          <div className="w-72 shrink-0 relative">
            <div className="absolute inset-0">
              <TemplateSidebar
                dbTemplates={templates}
                selectedType={selectedType}
                onSelect={setSelectedType}
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <TemplateEditor
              type={selectedType}
              template={selectedTemplate}
            />
          </div>
        </div>
      )}
    </div>
  );
}
