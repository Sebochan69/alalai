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
    (r) => r.status === "in-progress" || r.status === "for-review",
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
              AlalAI
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              Admin Portal
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
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
      <div className="flex-1 overflow-hidden flex flex-col py-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 px-5">
          Menu
        </p>
        <nav className="flex flex-col gap-1 px-3">
          <AdminSidebarNav items={adminNavItems} />
        </nav>
      </div>
      {/* Bottom stats + sign out */}
      <div className="shrink-0 px-4 pb-5 space-y-3">
        <div className="relative rounded-2xl bg-linear-to-br from-violet-100 to-violet-50 dark:from-violet-600/20 dark:via-violet-500/10 dark:to-transparent border border-violet-200 dark:border-violet-500/25 p-4 overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-violet-500/10 rounded-full -translate-y-4 translate-x-4 pointer-events-none" />
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center shrink-0 shadow shadow-violet-500/30">
              <svg
                width="13"
                height="13"
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
            <p className="text-xs font-black text-violet-600 dark:text-violet-400">
              Your Coverage
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-amber-50 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 rounded-xl px-3 py-2 text-center">
              <p className="text-[10px] text-muted-foreground mb-0.5">
                Pending
              </p>
              <p
                className={`text-xl font-black ${pending > 0 ? "text-amber-500" : "text-muted-foreground"}`}
              >
                {pending}
              </p>
            </div>
            <div className="bg-violet-50 border border-violet-200 dark:bg-violet-500/10 dark:border-violet-500/20 rounded-xl px-3 py-2 text-center">
              <p className="text-[10px] text-muted-foreground mb-0.5">Active</p>
              <p
                className={`text-xl font-black ${inProgress > 0 ? "text-violet-500" : "text-muted-foreground"}`}
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
