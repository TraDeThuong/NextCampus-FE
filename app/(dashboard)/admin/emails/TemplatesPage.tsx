"use client";

import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useNotificationTemplates } from "@/hooks/notificationTemplate/useNotificationTemplates";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import EmailsHeader from "./EmailsHeader";
import EmailsStats from "./EmailsStats";
import TemplateSidebar from "./TemplateSidebar";
import TemplateEditor from "./TemplateEditor";
import SendNotificationTab from "./SendNotificationTab";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function TemplatesPage() {
  const t = useTranslations();
  const { data, isPending, isError } = useNotificationTemplates();
  const [selectedType, setSelectedType] = useState<string>("TASK_ASSIGNMENT");
  const [mode, setMode] = useState<"templates" | "send">("templates");

  const templates = data?.data ?? [];

  const selectedTemplate =
    templates.find((tmpl) => tmpl.type === selectedType) ?? null;

  return (
    <ProtectedRoute
      requiredPermissions={["NOTIFICATION_TEMPLATE_READ", "NOTIFICATION_READ"]}
      permissionMode="ANY"
    >
      <div className="space-y-6">
      {/* Standardized Header */}
      <EmailsHeader mode={mode} setMode={setMode} />

      {/* KPI Stats Cards */}
      <EmailsStats />

      {/* Main Content Area */}
      {mode === "send" ? (
        <SendNotificationTab />
      ) : isPending ? (
        <MetalCard className="flex items-center justify-center py-24">
          <Spinner size="lg" />
        </MetalCard>
      ) : isError ? (
        <MetalCard className="flex flex-col items-center justify-center gap-3 py-24">
          <AlertTriangle className="h-8 w-8 text-rose-400" />
          <p className="text-sm text-rose-300">{t("admin.emails.loadError")}</p>
        </MetalCard>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
          {/* Responsive Sidebar Catalog */}
          <div className="w-full lg:w-80 shrink-0 min-h-[500px] lg:min-h-[640px]">
            <TemplateSidebar
              dbTemplates={templates}
              selectedType={selectedType}
              onSelect={setSelectedType}
            />
          </div>

          {/* Template Configuration Editor */}
          <div className="flex-1 min-w-0">
            <TemplateEditor
              type={selectedType}
              template={selectedTemplate}
            />
          </div>
        </div>
      )}
    </div>
    </ProtectedRoute>
  );
}
