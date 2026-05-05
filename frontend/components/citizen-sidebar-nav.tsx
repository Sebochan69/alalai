"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// ─── Icons ────────────────────────────────────────────────────────────────────

const NAV_ICONS = {
  dashboard: (
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
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  fileConcern: (
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
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  reports: (
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
    </svg>
  ),
  map: (
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
  ),
};

export const citizenNavItems = [
  { href: "/citizen/dashboard", icon: NAV_ICONS.dashboard, label: "Dashboard" },
  {
    href: "/citizen/file-concern",
    icon: NAV_ICONS.fileConcern,
    label: "File a Concern",
  },
  { href: "/citizen/reports", icon: NAV_ICONS.reports, label: "My Reports" },
  { href: "/citizen/map", icon: NAV_ICONS.map, label: "Brgy Map" },
];

// ─── Sidebar nav (desktop) ────────────────────────────────────────────────────

export function CitizenSidebarNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1 px-3 pr-4">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-4 mb-2">
        Menu
      </p>
      {citizenNavItems.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
              active
                ? "bg-accent text-white shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <span className="w-4.5 h-4.5 shrink-0">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {active && (
              <span className="w-2 h-2 rounded-full bg-white shrink-0" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

// ─── Bottom nav (mobile) ─────────────────────────────────────────────────────

export function CitizenMobileNavLinks() {
  const pathname = usePathname();
  return (
    <>
      {citizenNavItems.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1.5 transition-all ${
              active ? "text-accent" : "text-muted-foreground"
            }`}
          >
            <span
              className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${
                active ? "bg-accent/15" : ""
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
