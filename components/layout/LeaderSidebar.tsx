"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  ClipboardCheck,
  FileBarChart,
  User,
} from "lucide-react";
import { LuAlarmClock } from "react-icons/lu";

const menus = [
  { name: "Dashboard", href: "/leader/dashboard", icon: LayoutDashboard },
  { name: "Interns", href: "/leader/interns", icon: Users },
  { name: "Tasks", href: "/leader/tasks", icon: CheckSquare },
  { name: "Daily Reports", href: "/leader/daily-reports", icon: ClipboardCheck },
  { name: "Meetings", href: "/leader/meetings", icon: LuAlarmClock },
  {
    name: "Weekly Evaluation",
    href: "/leader/weekly-evaluation",
    icon: FileBarChart,
  },
  { name: "Profile", href: "/leader/profile", icon: User },
];

const baseClass =
  "flex items-center justify-center w-14 h-14 rounded-2xl border transition-all duration-300 shadow-shadow-soft cursor-pointer";

const activeClass =
  "bg-primary-main/20 border-primary-light text-gray-300 scale-110 shadow-[0_0_24px_primary-white]";

const inactiveClass =
  "bg-card border-border text-muted hover:bg-card-hover hover:border-border-strong hover:text-foreground hover:scale-110";

export default function LeaderSidebar() {
  const pathname = usePathname();

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
