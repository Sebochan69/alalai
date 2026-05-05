import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  AdminSidebarNav,
  AdminMobileNavLinks,
  adminNavItems,
} from "@/components/admin-sidebar-nav";
import { getAdminComplaints } from "@/lib/api";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const reports = await getAdminComplaints();
  const pending = reports.filter((r) => r.status === "pending").length;
  const inProgress = reports.filter(
    (r) => r.status === "in-progress" || r.status === "under-review",
  ).length;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <AdminNav />
      <div className="flex-1 flex overflow-hidden">
        <AdminSidebar pending={pending} inProgress={inProgress} />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">{children}</main>
      </div>
      <AdminMobileNav />
    </div>
  );
}

function AdminNav() {
  return (
    <header className="border-b border-border bg-card sticky top-0 z-40 shadow-sm shrink-0">
      <div className="px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shrink-0">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight block leading-none">
              alalAI
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              Admin Portal
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            <span className="text-xs text-violet-500 dark:text-violet-400 font-semibold">
              Zones A, B, C
            </span>
          </div>
          <ThemeToggle />
          <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-border">
            <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-black shrink-0">
              A1
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold leading-none">Admin 1</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Zone Admin
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function AdminSidebar({
  pending,
  inProgress,
}: {
  pending: number;
  inProgress: number;
}) {
  return (
    <aside className="w-64 border-r border-border bg-card flex-col hidden md:flex shrink-0 overflow-hidden">
      <div className="flex-1 overflow-hidden flex flex-col py-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 px-5">
          Menu
        </p>
        <nav className="flex flex-col gap-0.5 px-3">
          <AdminSidebarNav items={adminNavItems} />
        </nav>
      </div>
      {/* Bottom stats + sign out */}
      <div className="shrink-0 px-4 pb-5 space-y-3">
        <div className="rounded-2xl bg-linear-to-br from-violet-600/15 to-violet-500/5 border border-violet-500/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <p className="text-xs font-black text-violet-500 dark:text-violet-400">
              Your Coverage
            </p>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Zones: <span className="text-foreground font-bold">A, B, C</span>
          </p>
          <div className="flex items-center gap-3 mt-2.5">
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground">Pending</p>
              <p
                className={`text-sm font-black ${pending > 0 ? "text-amber-400" : "text-muted-foreground"}`}
              >
                {pending}
              </p>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground">Active</p>
              <p
                className={`text-sm font-black ${inProgress > 0 ? "text-violet-400" : "text-muted-foreground"}`}
              >
                {inProgress}
              </p>
            </div>
          </div>
        </div>
        <Link
          href="/login"
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all group"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 group-hover:text-red-400 transition-colors"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span className="font-semibold group-hover:text-red-400 transition-colors">
            Sign out
          </span>
        </Link>
      </div>
    </aside>
  );
}

function AdminMobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-t border-border">
      <div className="grid grid-cols-5 h-16">
        <AdminMobileNavLinks items={adminNavItems} />
      </div>
    </nav>
  );
}
