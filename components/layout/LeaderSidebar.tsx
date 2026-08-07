"use client";

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
} from "lucide-react";
import { LuAlarmClock } from "react-icons/lu";
import { useTranslations } from "next-intl";
import { useLeaderSidebarPrefetch } from "@/hooks/useLeaderSidebarPrefetch";

const baseClass =
  "flex items-center justify-center w-14 h-14 rounded-2xl border transition-all duration-300 shadow-shadow-soft cursor-pointer";

const activeClass =
  "bg-primary-main/20 border-primary-light text-gray-300 scale-110 shadow-[0_0_24px_primary-white]";

const inactiveClass =
  "bg-card border-border text-muted hover:bg-card-hover hover:border-border-strong hover:text-foreground hover:scale-110";

export default function LeaderSidebar() {
  const pathname = usePathname();
  const t = useTranslations();
  const { getPrefetchHandler } = useLeaderSidebarPrefetch();

  const menus = [
    { name: t("leader.nav.dashboard"),        href: "/leader/dashboard",         icon: LayoutDashboard },
    { name: t("leader.nav.interns"),          href: "/leader/interns",           icon: Users },
    { name: t("leader.nav.department"),       href: "/leader/department",        icon: Building2 },
    { name: t("leader.nav.tasks"),            href: "/leader/tasks",             icon: CheckSquare },
    { name: t("leader.nav.dailyReports"),     href: "/leader/daily-reports",     icon: ClipboardCheck },
    { name: t("leader.nav.meetings"),         href: "/leader/meetings",          icon: LuAlarmClock },
    { name: t("leader.nav.weeklyEvaluation"), href: "/leader/weekly-evaluation", icon: FileBarChart },
    { name: t("leader.nav.profile"),          href: "/leader/profile",           icon: UserRoundPen },
  ];

  return (
    <aside className="flex min-h-screen flex-col items-center px-4 py-10">
      <ul className="flex flex-col items-center gap-12">
        {menus.map(({ name, href, icon: Icon }) => {
          const isActive = pathname === href;

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

                <span className="text-metal pointer-events-none absolute top-full mt-2 translate-y-1 whitespace-nowrap text-xs font-medium opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                  {name}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
