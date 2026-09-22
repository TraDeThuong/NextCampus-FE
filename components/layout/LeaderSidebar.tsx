"use client";

import { useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  ClipboardCheck,
  FileBarChart,
  UserRoundPen,
  Building2,
  Layers,
} from "lucide-react";
import { LuAlarmClock } from "react-icons/lu";
import { useTranslations } from "next-intl";
import { useLeaderSidebarPrefetch } from "@/hooks/useLeaderSidebarPrefetch";
import { useRBAC } from "@/hooks/rbac/useRBAC";
import { useActionCounts } from "@/hooks/notification/useActionCounts";
import { SidebarBadge } from "@/components/ui/SidebarBadge";

const baseClass =
  "flex items-center justify-center w-14 h-14 rounded-2xl border transition-all duration-300 shadow-shadow-soft cursor-pointer";

const activeClass =
  "bg-primary-main/20 border-primary-light text-gray-300 scale-110 shadow-[0_0_24px_primary-white]";

const inactiveClass =
  "bg-card border-border text-muted hover:bg-card-hover hover:border-border-strong hover:text-foreground hover:scale-110";

const tooltipClass =
  "text-metal pointer-events-none absolute top-full mt-2 translate-y-1 whitespace-nowrap text-xs font-medium opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 z-30";

export default function LeaderSidebar() {
  const pathname = usePathname();
  const t = useTranslations();
  const { getPrefetchHandler } = useLeaderSidebarPrefetch();
  const { canAny } = useRBAC();
  const counts = useActionCounts();

  const menus = useMemo(
    () => {
      const items = [
        { name: t("leader.nav.dashboard"),        href: "/leader/dashboard",         icon: LayoutDashboard, permissions: ["STATS_LEADER_READ", "STATS_ADMIN_READ"],    badge: undefined },
        { name: t("leader.nav.interns"),          href: "/leader/interns",           icon: Users,            permissions: ["INTERN_READ"],                             badge: undefined },
        { name: t("leader.nav.department"),       href: "/leader/department",        icon: Building2,        permissions: ["DEPARTMENT_READ"],                         badge: undefined },
        { name: t("leader.nav.taskGroups"),       href: "/leader/task-groups",       icon: Layers,           permissions: ["TASK_GROUP_READ"],                         badge: undefined },
        { name: t("leader.nav.tasks"),            href: "/leader/tasks",             icon: CheckSquare,      permissions: ["TASK_READ"],                               badge: counts.pendingSubmissions },
        { name: t("leader.nav.meetings"),         href: "/leader/meetings",          icon: LuAlarmClock,     permissions: ["MEETING_READ"],                            badge: counts.pendingMeetingRsvp },
        { name: t("leader.nav.dailyReports"),     href: "/leader/daily-reports",     icon: ClipboardCheck,   permissions: ["DAILY_REPORT_READ"],                       badge: counts.unreviewedReports },
        { name: t("leader.nav.weeklyEvaluation"), href: "/leader/weekly-evaluation", icon: FileBarChart,     permissions: ["WEEKLY_EVALUATION_READ"],                  badge: counts.pendingEvaluations },
        { name: t("leader.nav.profile"),          href: "/leader/profile",           icon: UserRoundPen,     permissions: undefined,                                   badge: undefined },
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
            (href !== "/leader/dashboard" && pathname.startsWith(`${href}/`));

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
