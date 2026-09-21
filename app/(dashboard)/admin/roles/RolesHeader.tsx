"use client";

import React, { useState } from "react";
import { ShieldCheck, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import MetalCard from "@/components/ui/MetalCard";
import CreateRoleModal from "./CreateRoleModal";
import { useRBAC } from "@/hooks/rbac/useRBAC";

export default function RolesHeader() {
  const t = useTranslations();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { can } = useRBAC();

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
              <p className="mt-2 text-sm text-muted">
                {t("admin.roles.description")}
              </p>
            </div>

            {can("ROLE_CREATE") && (
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(true)}
                className="
                  group relative inline-flex items-center justify-center gap-2 overflow-hidden
                  rounded-xl sm:rounded-2xl
                  h-[42px] sm:h-[46px] px-5 sm:px-6
                  bg-gradient-to-r from-(--primary-main) to-(--primary-light)
                  text-sm font-semibold text-white
                  shadow-[0_0_25px_rgba(21,174,245,0.25)]
                  transition-all duration-300
                  hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(21,174,245,0.4)] hover:brightness-110
                  active:scale-[0.98]
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background
                  disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed
                  cursor-pointer select-none
                "
              >
                <span
                  className="
                    pointer-events-none absolute inset-y-0 -left-24 w-16 rotate-12
                    bg-white/30 blur-lg
                    transition-all duration-700
                    group-hover:left-[130%]
                  "
                />
                <span className="relative flex items-center gap-2">
                  <Plus className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:rotate-90" />
                  <span>{t("admin.roles.createRoleBtn")}</span>
                </span>
              </button>
            </div>
            )}
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
