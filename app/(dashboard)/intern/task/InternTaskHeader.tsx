"use client";

import { CheckSquare, User, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import MetalCard from "@/components/ui/MetalCard";

export default function InternTaskHeader() {
  const t = useTranslations("intern.tasks");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentView = searchParams.get("view") === "team" ? "team" : "my";

  const handleSwitchView = (newView: "my" | "team") => {
    const params = new URLSearchParams(searchParams.toString());
    if (newView === "team") {
      params.set("view", "team");
    } else {
      params.delete("view");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <MetalCard>
      <div className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CheckSquare className="h-6 w-6 shrink-0 text-cyan-400" />
              <h2 className="text-2xl font-bold metal-text">
                {currentView === "team" ? t("tabTeamTasks") : t("title")}
              </h2>
            </div>
            <p className="mt-1 text-sm text-muted">
              {currentView === "team" ? t("squadOverview") : t("description")}
            </p>
          </div>

          <div className="flex items-center rounded-2xl border border-border/80 bg-slate-100/90 p-1.5 backdrop-blur-md shadow-sm dark:border-white/10 dark:bg-slate-900/60 dark:shadow-none">
            <button
              type="button"
              onClick={() => handleSwitchView("my")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer ${
                currentView === "my"
                  ? "border border-cyan-300 bg-cyan-100/90 text-cyan-800 shadow-sm dark:border-cyan-500/40 dark:bg-cyan-500/20 dark:text-cyan-300 dark:shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                  : "text-muted hover:bg-slate-200/60 hover:text-foreground dark:hover:bg-white/5 dark:hover:text-foreground"
              }`}
            >
              <User className="h-4 w-4 shrink-0" />
              <span>{t("tabMyTasks")}</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchView("team")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer ${
                currentView === "team"
                  ? "border border-indigo-300 bg-indigo-100/90 text-indigo-800 shadow-sm dark:border-indigo-500/40 dark:bg-indigo-500/20 dark:text-indigo-300 dark:shadow-[0_0_15px_rgba(99,102,241,0.25)]"
                  : "text-muted hover:bg-slate-200/60 hover:text-foreground dark:hover:bg-white/5 dark:hover:text-foreground"
              }`}
            >
              <Users className="h-4 w-4 shrink-0" />
              <span>{t("tabTeamTasks")}</span>
            </button>
          </div>
        </div>
      </div>
    </MetalCard>
  );
}
