"use client";

import { useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  FileClock,
  ClipboardCheck,
  UserRoundPen,
} from "lucide-react";
import { LuAlarmClock } from "react-icons/lu";
import { useTranslations } from "next-intl";
import { useInternSidebarPrefetch } from "@/hooks/useInternSidebarPrefetch";
import { useRBAC } from "@/hooks/rbac/useRBAC";
import { useActionCounts } from "@/hooks/notification/useActionCounts";
import { SidebarBadge } from "@/components/ui/SidebarBadge";

const baseClass =
  "flex items-center justify-center w-14 h-14 rounded-2xl border transition-all duration-300 shadow-sm dark:shadow-shadow-soft cursor-pointer";

const activeClass =
  "bg-primary-main/10 border-primary-main text-primary-main dark:bg-primary-main/20 dark:border-primary-light dark:text-cyan-300 scale-110 shadow-sm dark:shadow-[0_0_24px_primary-white]";

const inactiveClass =
  "bg-white/80 border-slate-200 text-slate-500 hover:bg-slate-100 hover:border-slate-300 hover:text-slate-900 dark:bg-card dark:border-border dark:text-muted dark:hover:bg-card-hover dark:hover:border-border-strong dark:hover:text-foreground hover:scale-110";

const tooltipClass =
  "pointer-events-none absolute top-full mt-2 translate-y-1 whitespace-nowrap text-xs font-semibold px-2 py-1 rounded-md bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100 shadow-lg opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 z-30";

export default function InternSidebar() {
  const pathname = usePathname();
  const t = useTranslations();
  const { getPrefetchHandler } = useInternSidebarPrefetch();
  const { canAny } = useRBAC();
  const counts = useActionCounts();

  const menus = useMemo(
    () => {
      const items = [
        { name: t("intern.nav.dashboard"),        href: "/intern/dashboard",         icon: LayoutDashboard, permissions: ["STATS_INTERN_READ", "STATS_LEADER_READ", "STATS_ADMIN_READ"], badge: undefined },
        { name: t("intern.nav.task"),             href: "/intern/task",              icon: CheckSquare,    permissions: ["TASK_READ", "TASK_ASSIGNMENT_READ"],                            badge: counts.pendingTasks },
        { name: t("intern.nav.meetings"),         href: "/intern/meetings",          icon: LuAlarmClock,   permissions: ["MEETING_READ"],                                                 badge: counts.pendingMeetingRsvp },
        { name: t("intern.nav.dailyReport"),      href: "/intern/daily-report",      icon: FileClock,      permissions: ["DAILY_REPORT_READ"],                                            badge: counts.missedReports },
        { name: t("intern.nav.weeklyEvaluation"), href: "/intern/weekly-evaluation", icon: ClipboardCheck,  permissions: ["WEEKLY_EVALUATION_READ"],                                      badge: counts.unviewedEvaluations },
        { name: t("intern.nav.profile"),          href: "/intern/profile",           icon: UserRoundPen,   permissions: undefined,                                                        badge: undefined },
      ];

      return items.filter((item) => {
        if (!item.permissions || item.permissions.length === 0) return true;
        return canAny(item.permissions);
      });
    },
    [t, canAny, counts],
  );

  return (
    <div className="flex flex-col items-center w-full py-2">
      <ul className="flex flex-col items-center gap-6 w-full">
        {menus.map(({ name, href, icon: Icon, badge }) => {
          const isActive =
            pathname === href ||
            (href !== "/intern/dashboard" && pathname.startsWith(`${href}/`));

          return (
            <li key={href} className="group relative">
              <Link
                href={href}
                aria-label={name}
                className="relative flex flex-col items-center"
                onMouseEnter={getPrefetchHandler(href)}
              >
                <div className="relative">
                  <div
                    className={`${baseClass} ${
                      isActive ? activeClass : inactiveClass
                    }`}
                  >
                    <Icon size={22} />
                  </div>
                  <SidebarBadge count={badge} />
                </div>

                <span className={tooltipClass}>
                  {name}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}