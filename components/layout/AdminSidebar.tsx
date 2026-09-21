"use client";

import { useMemo } from "react";
import { Link } from "@/i18n/navigation";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Rocket,
  UserRoundPen,
  History,
  Settings,
  ShieldCheck,
} from "lucide-react";

import { LuAlarmClock } from "react-icons/lu";
import { PiBuildingOfficeLight } from "react-icons/pi";
import { MdManageAccounts } from "react-icons/md";
import { usePathname } from "@/i18n/navigation";
import { MdOutlineMailOutline } from "react-icons/md";
import { useTranslations } from "next-intl";
import { useSidebarPrefetch } from "@/hooks/useSidebarPrefetch";
import { useRBAC } from "@/hooks/rbac/useRBAC";

type MenuItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  permissions?: string[];
};

const baseClass =
  "flex items-center justify-center w-14 h-14 rounded-2xl border transition-all duration-300 shadow-shadow-soft cursor-pointer";

const activeClass =
  "bg-primary-main/20 border-primary-light text-gray-300 scale-110 shadow-[0_0_24px_primary-white]";

const inactiveClass =
  "bg-card border-border text-muted hover:bg-card-hover hover:border-border-strong hover:text-foreground hover:scale-110";

const tooltipClass =
  "text-metal pointer-events-none absolute top-full mt-2 translate-y-1 whitespace-nowrap text-xs font-medium opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 z-30";

export default function AdminSidebar() {
  const pathname = usePathname();
  const t = useTranslations();
  const { getPrefetchHandler } = useSidebarPrefetch();
  const { canAny } = useRBAC();

  const menus = useMemo(() => {
    const items: MenuItem[] = [
      { name: t("admin.nav.dashboard"),     href: "/admin/dashboard",     icon: LayoutDashboard, permissions: ["STATS_ADMIN_READ"] },
      { name: t("admin.nav.adminTeam"),     href: "/admin/admin-team",    icon: MdManageAccounts, permissions: ["USER_READ"] },
      { name: t("admin.nav.department"),    href: "/admin/department",    icon: PiBuildingOfficeLight, permissions: ["DEPARTMENT_READ"] },
      { name: t("admin.nav.leaders"),       href: "/admin/leaders",       icon: UserCheck,        permissions: ["LEADER_READ"] },
      { name: t("admin.nav.onboarding"),    href: "/admin/onboarding",    icon: Rocket,           permissions: ["APPLICATION_READ"] },
      { name: t("admin.nav.interns"),       href: "/admin/interns",       icon: Users,            permissions: ["INTERN_READ"] },
      { name: t("admin.nav.meetings"),      href: "/admin/meetings",      icon: LuAlarmClock,     permissions: ["MEETING_READ"] },
      { name: t("admin.nav.roles"),         href: "/admin/roles",         icon: ShieldCheck,      permissions: ["ROLE_READ"] },
      { name: t("admin.nav.mails"),         href: "/admin/emails",        icon: MdOutlineMailOutline,  permissions: ["NOTIFICATION_TEMPLATE_READ"] },
      { name: t("admin.nav.settings"),      href: "/admin/settings",      icon: Settings,         permissions: [
        "SYSTEM_CONFIG_READ",
        "MAINTENANCE_READ",
        "MAINTENANCE_MANAGE",
        "API_KEY_READ",
        "API_KEY_MANAGE",
        "WEBHOOK_READ",
        "WEBHOOK_MANAGE",
        "CRON_JOB_READ",
        "CRON_JOB_MANAGE",
      ] },
      { name: t("admin.nav.activityLogs"), href: "/admin/activity-logs", icon: History,          permissions: ["AUDIT_LOG_READ"] },
      { name: t("admin.nav.profile"),       href: "/admin/profile",       icon: UserRoundPen },
    ];

    return items.filter((item) => {
      if (!item.permissions || item.permissions.length === 0) return true;
      return canAny(item.permissions);
    });
  }, [t, canAny]);

  return (
    <div className="flex flex-col items-center w-full py-2">
      <ul className="flex flex-col items-center gap-6 w-full">
        {menus.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin/dashboard" && pathname.startsWith(`${item.href}/`)) ||
            (item.href === "/admin/regulations" && pathname === "/admin/policies") ||
            (item.href === "/admin/meetings" && (pathname === "/admin/mettings" || pathname.startsWith("/admin/mettings")));

          return (
            <li key={item.href} className="group relative">
              <Link
                href={item.href}
                aria-label={item.name}
                className="relative flex flex-col items-center"
                onMouseEnter={getPrefetchHandler(item.href)}
              >
                <div
                  className={`${baseClass} ${
                    isActive ? activeClass : inactiveClass
                  }`}
                >
                  <Icon size={22} />
                </div>

                <span className={tooltipClass}>
                  {item.name}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
