"use client";

import React, { useState } from "react";
import { ShieldCheck, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import MetalCard from "@/components/ui/MetalCard";
import Button from "@/components/ui/Button";
import CreateRoleModal from "./CreateRoleModal";

export default function RolesHeader() {
  const t = useTranslations();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <>
      <MetalCard>
        <div className="rounded-3xl p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-400">
                  <ShieldCheck className="h-6 w-6 shrink-0" />
                </div>
                <h1 className="text-2xl font-bold metal-text">
                  {t("admin.roles.title")}
                </h1>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("admin.roles.description")}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2.5 text-sm font-medium text-cyan-300 transition hover:border-cyan-400/50 hover:bg-cyan-500/20"
              >
                <Plus className="h-4 w-4 shrink-0" />
                <span>{t("admin.roles.createRoleBtn")}</span>
              </Button>
            </div>
          </div>
        </div>
      </MetalCard>

      <CreateRoleModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </>
  );
}
