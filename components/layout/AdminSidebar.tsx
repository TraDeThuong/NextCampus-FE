"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Rocket,
  MessageCircle,
  FileText,
  UserRoundPen,
  History
} from "lucide-react";

import { LuAlarmClock } from "react-icons/lu";
import { PiBuildingOfficeLight } from "react-icons/pi";
import { MdManageAccounts } from "react-icons/md";
import { usePathname } from "next/navigation";
import { MdOutlineMailOutline } from "react-icons/md";

const menus = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Admin Team", href: "/admin/admin-team", icon: MdManageAccounts },
  { name: "Leaders", href: "/admin/leaders", icon: UserCheck },
  { name: "Interns", href: "/admin/interns", icon: Users },
  { name: "Department", href: "/admin/department", icon: PiBuildingOfficeLight },
  { name: "Onboarding", href: "/admin/onboarding", icon: Rocket },
  { name: "Mails", href: "/admin/emails", icon: MdOutlineMailOutline },
  { name: "Mettings", href:"/admin/mettings", icon:LuAlarmClock},
  { name: "Discord", href: "/admin/discord", icon: MessageCircle },
  { name: "Policies", href: "/admin/policies", icon: FileText },
  { name: "Activity Logs", href: "/admin/activity-logs", icon: History },
  { name: "Profile", href: "/admin/profile", icon: UserRoundPen },
];

export default function AdminSidebar() {
  const pathname = usePathname()
  return (
    <aside
      className="flex flex-col items-center min-h-screen py-2 px-4 ">

      <ul className="flex flex-col items-center gap-6">
        {menus.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <li key={item.href} className="relative group">
              <Link href={item.href} className="relative flex flex-col items-center">
                <div className={`
                    flex items-center justify-center
                    w-14 h-14 rounded-2xl
                    border transition-all duration-300
                    shadow-shadow-soft cursor-pointer

                    ${
                      isActive
                        ? `bg-primary-main/20 border-primary-light text-gray-300 scale-110 shadow-[0_0_24px_primary-white]`
                        : `bg-card border-border text-muted hover:bg-card-hover hover:border-border-strong hover:text-foreground hover:scale-110 `}`} >         
                  <Icon size={22} />
                </div>

                <span
                  className=" text-metal absolute top-full mt-2 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 text-xs font-medium whitespace-nowrap pointer-events-none">
                  {item.name}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}