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

const baseClass =
  "flex items-center justify-center w-14 h-14 rounded-2xl border transition-all duration-300 shadow-shadow-soft cursor-pointer";

const activeClass =
  "bg-primary-main/20 border-primary-light text-gray-300 scale-110 shadow-[0_0_24px_primary-white]";

const inactiveClass =
  "bg-card border-border text-muted hover:bg-card-hover hover:border-border-strong hover:text-foreground hover:scale-110";

const tooltipClass =
  "text-metal pointer-events-none absolute top-full mt-2 translate-y-1 whitespace-nowrap text-xs font-medium opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 z-30";

export default function InternSidebar() {
  const pathname = usePathname();
  const t = useTranslations();
  const { getPrefetchHandler } = useInternSidebarPrefetch();
  const { canAny } = useRBAC();

  const menus = useMemo(
    () => {
      const items = [
        { name: t("intern.nav.dashboard"),        href: "/intern/dashboard",         icon: LayoutDashboard, permissions: ["STATS_INTERN_READ", "STATS_LEADER_READ", "STATS_ADMIN_READ"] },
        { name: t("intern.nav.task"),             href: "/intern/task",              icon: CheckSquare,    permissions: ["TASK_READ", "TASK_ASSIGNMENT_READ"] },
        { name: t("intern.nav.meetings"),         href: "/intern/meetings",          icon: LuAlarmClock,   permissions: ["MEETING_READ"] },
        { name: t("intern.nav.dailyReport"),      href: "/intern/daily-report",      icon: FileClock,      permissions: ["DAILY_REPORT_READ"] },
        { name: t("intern.nav.weeklyEvaluation"), href: "/intern/weekly-evaluation", icon: ClipboardCheck,  permissions: ["WEEKLY_EVALUATION_READ"] },
        { name: t("intern.nav.profile"),          href: "/intern/profile",           icon: UserRoundPen },
      ];

      return items.filter((item) => {
        if (!item.permissions || item.permissions.length === 0) return true;
        return canAny(item.permissions);
      });
    },
    [t, canAny],
  );

  return (
    <div className="flex flex-col items-center w-full py-2">
      <ul className="flex flex-col items-center gap-6 w-full">
        {menus.map(({ name, href, icon: Icon }) => {
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
                <div
                  className={`${baseClass} ${
                    isActive ? activeClass : inactiveClass
                  }`}
                >
                  <Icon size={22} />
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