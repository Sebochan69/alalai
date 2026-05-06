import { ThemeToggle } from "@/components/theme-toggle";
import {
  CitizenSidebarNav,
  CitizenMobileNavLinks,
} from "@/components/citizen-sidebar-nav";
import { getMyComplaints, getCurrentUser } from "@/lib/api";
import CitizenChatWidget from "@/components/citizen-chat-widget";
import { SignOutButton } from "@/components/sign-out-button";

export default async function CitizenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [reports, user] = await Promise.all([
    getMyComplaints(),
    getCurrentUser(),
  ]);
  const displayName = user?.username ?? "Citizen";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const total = reports.length;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <CitizenNav displayName={displayName} initials={initials} />
      <div className="flex-1 flex overflow-hidden">
        <CitizenSidebar
          total={total}
          displayName={displayName}
          initials={initials}
        />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">{children}</main>
      </div>
      <CitizenMobileNav />
      <CitizenChatWidget />
    </div>
  );
}

function CitizenNav({
  displayName,
  initials,
}: {
  displayName: string;
  initials: string;
}) {
  return (
    <header className="border-b border-border px-5 md:px-8 h-16 flex items-center justify-between sticky top-0 z-40 bg-card shadow-sm">
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white font-extrabold text-base shrink-0">
          A
        </div>
        <div className="flex flex-col leading-none gap-1">
          <span className="font-extrabold text-base tracking-tight">
            AlalAI
          </span>
          <span className="text-xs text-muted-foreground font-medium leading-none">
            Citizen Portal
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center text-sm font-extrabold shrink-0">
            {initials}
          </div>
          <div className="hidden md:flex flex-col leading-none gap-0.5">
            <span className="text-sm font-bold">{displayName}</span>
            <span className="text-xs text-muted-foreground">Citizen</span>
          </div>
        </div>
        <SignOutButton
          iconOnly
          className="md:hidden w-9 h-9 rounded-xl border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all flex items-center justify-center"
        />
      </div>
    </header>
  );
}

function CitizenSidebar({
  total,
  displayName,
  initials,
}: {
  total: number;
  displayName: string;
  initials: string;
}) {
  return (
    <aside className="w-64 border-r border-border bg-card flex-col hidden md:flex shrink-0 overflow-hidden">
      {/* Nav links */}
      <div className="flex-1 py-4 overflow-hidden">
        <CitizenSidebarNav />
      </div>

      {/* Bottom section */}
      <div className="shrink-0 px-4 pb-5 space-y-2">
        {/* Live stats card */}
        <div className="relative rounded-2xl bg-linear-to-br from-blue-100 to-blue-50 dark:from-accent/15 dark:via-accent/8 dark:to-transparent border border-blue-200 dark:border-accent/25 px-4 py-3 overflow-hidden">
          <div className="absolute top-0 right-0 w-10 h-10 bg-accent/10 rounded-full -translate-y-2 translate-x-2 pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-accent flex items-center justify-center shrink-0 shadow shadow-accent/30">
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <p className="text-xs font-black text-accent">My Reports</p>
            </div>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
          <p className="text-3xl font-black leading-none">{total}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            reports filed
          </p>
        </div>

        {/* Help card */}
        <div className="rounded-2xl bg-accent/8 border border-accent/15 px-3 py-2.5">
          <p className="text-xs font-bold text-accent mb-0.5">Need help?</p>
          <p className="text-[11px] text-muted-foreground">
            Barangay San Isidro Hall
          </p>
          <p className="text-sm font-bold text-foreground mt-0.5">
            (02) 8123-4567
          </p>
        </div>

        {/* User + sign out */}
        <div className="flex items-center gap-3 px-1 pt-1">
          <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-xs font-extrabold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground">Citizen</p>
          </div>
        </div>
        <SignOutButton className="flex items-center justify-center gap-2 w-full h-9 rounded-xl border border-border/80 text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted/40 transition-all" />
      </div>
    </aside>
  );
}

function CitizenMobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="grid grid-cols-4 h-16">
        <CitizenMobileNavLinks />
      </div>
    </nav>
  );
}
