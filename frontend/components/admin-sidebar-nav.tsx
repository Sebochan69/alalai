"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// ─── SVG Icons ────────────────────────────────────────────────────────────────
function IconDashboard() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function IconReports() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}
function IconMap() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  );
}
function IconAdmins() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconMonthly() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

export const adminNavItems = [
  { href: "/admin/dashboard", icon: <IconDashboard />, label: "Dashboard" },
  { href: "/admin/reports", icon: <IconReports />, label: "Reports" },
  { href: "/admin/map", icon: <IconMap />, label: "Brgy Map" },
  { href: "/admin/manage-admins", icon: <IconAdmins />, label: "Admins" },
  { href: "/admin/monthly-report", icon: <IconMonthly />, label: "Monthly" },
];

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
}

export function AdminSidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <>
      {items.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-2 py-2 rounded-xl text-sm transition-all ${
              active
                ? "bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium"
            }`}
          >
            <span
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                active
                  ? "bg-violet-200 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400"
                  : "bg-black/5 dark:bg-white/8 text-muted-foreground"
              }`}
            >
              {item.icon}
            </span>
            <span className="flex-1">{item.label}</span>
            {active && (
              <span className="w-1.5 h-1.5 rounded-full bg-violet-600 dark:bg-violet-400 shrink-0 mr-1" />
            )}
          </Link>
        );
      })}
    </>
  );
}

export function AdminMobileNavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <>
      {items.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 transition-all ${active ? "text-violet-500 dark:text-violet-400" : "text-muted-foreground hover:text-foreground"}`}
          >
            <span
              className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${
                active ? "bg-violet-500/15" : ""
              }`}
            >
              {item.icon}
            </span>
            <span className="text-[10px] font-semibold leading-none">
              {item.label}
            </span>
          </Link>
        );
      })}
    </>
  );
}
