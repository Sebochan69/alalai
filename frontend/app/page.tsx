import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const PREVIEW_ITEMS = [
  {
    tag: "Road Damage",
    tagCls: "bg-red-500/10 text-red-400 border border-red-500/20",
    loc: "Purok 3, Sta. Cruz",
    status: "In Progress",
    dot: "bg-blue-500",
    statusCls: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  },
  {
    tag: "Flooding",
    tagCls: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
    loc: "Purok 1, Bagong Silang",
    status: "Pending",
    dot: "bg-amber-500",
    statusCls: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  },
  {
    tag: "Street Light",
    tagCls: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
    loc: "Purok 5, Maligaya",
    status: "Resolved",
    dot: "bg-emerald-500",
    statusCls:
      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  },
];

const stats = [
  { label: "Reports Filed", value: "1,248", color: "text-accent" },
  { label: "Resolved", value: "984", color: "text-emerald-500" },
  { label: "Avg. Resolution", value: "2.4d", color: "text-amber-500" },
  { label: "Active Admins", value: "3", color: "text-violet-500" },
];

const features = [
  {
    bg: "bg-blue-500",
    glow: "group-hover:shadow-blue-500/25",
    border: "hover:border-blue-500/30",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    title: "File a Concern",
    description:
      "Describe the issue, drop your location, upload a photo — done in under a minute.",
  },
  {
    bg: "bg-emerald-500",
    glow: "group-hover:shadow-emerald-500/25",
    border: "hover:border-emerald-500/30",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="10" r="3" />
        <path d="M12 2a8 8 0 0 0-8 8c0 5.4 7.05 11.5 7.35 11.76a1 1 0 0 0 1.3 0C13 21.5 20 15.4 20 10a8 8 0 0 0-8-8z" />
      </svg>
    ),
    title: "Live Brgy. Map",
    description:
      "See all active reports pinned on an interactive map — know what's happening around you.",
  },
  {
    bg: "bg-violet-600",
    glow: "group-hover:shadow-violet-500/25",
    border: "hover:border-violet-500/30",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    title: "AI Auto-Routing",
    description:
      "Reports are auto-categorized, prioritized, and assigned to the right barangay staff instantly.",
  },
  {
    bg: "bg-amber-500",
    glow: "group-hover:shadow-amber-500/25",
    border: "hover:border-amber-500/30",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    title: "Stay Updated",
    description:
      "Get email alerts every time your report moves — from Filed all the way to Resolved.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-14 sm:h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-accent flex items-center justify-center text-white font-extrabold text-sm shrink-0 shadow-md shadow-accent/30">
              A
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight block leading-none">
                AlalAI
              </span>
              <span className="text-[10px] text-muted-foreground font-medium hidden sm:block">
                Brgy. Report System
              </span>
            </div>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <ThemeToggle />
            <Link href="/login">
              <button className="h-8 sm:h-9 px-3 sm:px-4 rounded-xl border border-border text-xs sm:text-sm font-semibold hover:bg-muted/50 transition-colors whitespace-nowrap">
                Sign In
              </button>
            </Link>
            <Link href="/register">
              <button className="h-8 sm:h-9 px-3 sm:px-5 rounded-xl bg-accent text-white text-xs sm:text-sm font-bold hover:bg-accent/90 transition-all shadow-sm hover:shadow-md hover:shadow-accent/25 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <section className="relative px-6 lg:px-10 pt-10 pb-12 lg:pt-12 lg:pb-16">
          {/* Background glows — own overflow-hidden wrapper so chips aren't clipped */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-24 right-1/4 w-150 h-150 bg-accent/6 rounded-full blur-3xl" />
            <div className="absolute top-32 -left-32 w-100 h-100 bg-violet-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-75 h-75 bg-amber-500/4 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 xl:gap-20 items-center">
              {/* ── Left: copy + CTAs ── */}
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/8 border border-accent/20 text-accent text-xs font-bold mb-4 lg:mb-5">
                  🏛️ Barangay Complaint &amp; Report Management
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-black tracking-tight mb-3 leading-[1.06]">
                  Your voice
                  <br />
                  matters in
                  <br />
                  <span className="text-accent">your barangay.</span>
                </h1>

                <p className="text-sm lg:text-base text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-2 leading-relaxed">
                  File concerns, track resolutions, and stay informed — AlalAI
                  connects citizens directly with barangay officials,
                  transparently and efficiently.
                </p>
                <p className="text-xs font-bold tracking-widest text-muted-foreground/60 uppercase mb-5 lg:mb-6">
                  Mag-ulat. Subaybayan. Resolbahin.
                </p>

                {/* CTA cards */}
                <div className="grid grid-cols-2 sm:flex sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                  <Link href="/register">
                    <div className="group w-full sm:w-56 lg:w-56 xl:w-64 rounded-2xl border-2 border-accent/25 bg-card shadow-sm hover:border-accent/60 hover:shadow-2xl hover:shadow-accent/12 hover:-translate-y-1.5 transition-all duration-200 p-4 sm:p-5 cursor-pointer text-left">
                      <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mb-3 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-accent/30 transition-all">
                        <svg
                          className="text-white"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                      <p className="font-black text-sm mb-1">
                        I&apos;m a Citizen
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                        File a concern, track reports, and view the barangay
                        map.
                      </p>
                      <span className="text-xs text-accent font-bold group-hover:translate-x-1 transition-transform inline-block">
                        Register / Sign in →
                      </span>
                    </div>
                  </Link>

                  <Link href="/login?role=admin">
                    <div className="group w-full sm:w-56 lg:w-56 xl:w-64 rounded-2xl border-2 border-violet-500/25 bg-card shadow-sm hover:border-violet-500/60 hover:shadow-2xl hover:shadow-violet-500/12 hover:-translate-y-1.5 transition-all duration-200 p-4 sm:p-5 cursor-pointer text-left">
                      <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-violet-500/30 transition-all">
                        <svg
                          className="text-white"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                      </div>
                      <p className="font-black text-sm mb-1">
                        I&apos;m an Admin
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                        Manage reports, update statuses, and view your assigned
                        zone.
                      </p>
                      <span className="text-xs text-violet-400 font-bold group-hover:translate-x-1 transition-transform inline-block">
                        Admin Sign in →
                      </span>
                    </div>
                  </Link>
                </div>
              </div>

              {/* ── Right: decorative activity panel (lg+ only) ── */}
              <div className="hidden lg:flex lg:flex-col lg:pt-2 gap-3">
                <div className="relative">
                  {/* Floating stat chip — top right */}
                  <div className="absolute -top-4 right-0 z-10 bg-card border border-border rounded-2xl px-3.5 py-2 shadow-xl flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-black text-emerald-500">
                      +12
                    </span>
                    <span className="text-xs text-muted-foreground">
                      resolved today
                    </span>
                  </div>

                  {/* Main activity card */}
                  <div className="bg-card border border-border rounded-3xl p-5 shadow-2xl mt-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Live Reports
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground/60">
                        Brgy. San Antonio
                      </span>
                    </div>

                    {/* Complaint rows */}
                    <div className="space-y-3">
                      {PREVIEW_ITEMS.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/50"
                        >
                          <div
                            className={`w-2 h-2 rounded-full shrink-0 ${item.dot}`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${item.tagCls}`}
                              >
                                {item.tag}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {item.loc}
                            </p>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-1 rounded-lg shrink-0 ${item.statusCls}`}
                          >
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="mt-4 pt-3.5 border-t border-border/50 flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground/60">
                        Showing nearby concerns
                      </span>
                      <div className="flex items-center gap-1.5 bg-accent/8 border border-accent/20 rounded-lg px-2.5 py-1">
                        <span className="text-[11px] font-black text-accent">
                          2.4d
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          avg. resolution
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mini stat row — fills height gap on wider screens */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      value: "1,248",
                      label: "Reports Filed",
                      cls: "text-accent",
                    },
                    {
                      value: "984",
                      label: "Resolved",
                      cls: "text-emerald-400",
                    },
                    {
                      value: "2.4d",
                      label: "Avg. Resolution",
                      cls: "text-amber-400",
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="bg-card border border-border/60 rounded-2xl p-3.5 text-center"
                    >
                      <p className={`text-base font-black ${s.cls}`}>
                        {s.value}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats bar ───────────────────────────────────────────────────── */}
        <section className="border-y border-border bg-card py-10 px-6 lg:px-10">
          <div className="max-w-7xl mx-auto">
            <p className="text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-6">
              Serbisyo sa Bayan — By the numbers
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((s) => (
                <div key={s.label} className="group">
                  <p
                    className={`text-4xl lg:text-5xl font-black tracking-tight ${s.color} group-hover:scale-105 transition-transform inline-block`}
                  >
                    {s.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5 font-semibold">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ────────────────────────────────────────────────────── */}
        <section className="py-24 px-6 lg:px-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[11px] font-bold uppercase tracking-widest text-accent mb-3">
                How it works
              </p>
              <h2 className="text-3xl lg:text-4xl font-black tracking-tight mb-3">
                Everything your community needs
              </h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Transparent, fast, and built for every barangay resident.
              </p>
            </div>
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
              {features.map((f) => (
                <div
                  key={f.title}
                  className={`group bg-card border border-border/60 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1.5 ${f.border} transition-all duration-200 cursor-default`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-lg ${f.glow} transition-all`}
                  >
                    {f.icon}
                  </div>
                  <h3 className="font-black text-sm mb-2 tracking-tight">
                    {f.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {f.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA banner ──────────────────────────────────────────────────── */}
        <section className="py-20 px-6 lg:px-10">
          <div className="max-w-7xl mx-auto">
            <div className="relative overflow-hidden bg-card border border-accent/20 rounded-3xl px-8 py-14 lg:py-16 text-center shadow-2xl shadow-accent/6">
              {/* Bg glow */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-125 h-50 bg-accent/5 rounded-full blur-3xl" />
              </div>
              <div className="relative">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent shadow-lg shadow-accent/30 text-white text-2xl font-black mx-auto mb-6">
                  A
                </div>
                <h2 className="text-2xl lg:text-3xl font-black tracking-tight mb-3">
                  Ready to make a difference?
                </h2>
                <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto">
                  Join hundreds of residents already using AlalAI to improve
                  their barangay.
                </p>
                <Link href="/register">
                  <button className="h-12 px-8 rounded-xl bg-accent text-white font-black text-sm hover:bg-accent/90 transition-all shadow-md shadow-accent/30 hover:shadow-lg hover:shadow-accent/40 hover:-translate-y-0.5 active:translate-y-0">
                    Create Your Account →
                  </button>
                </Link>
                <p className="mt-4 text-xs text-muted-foreground/50 font-medium">
                  Para sa ating komunidad.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-7 px-6 lg:px-10 bg-card">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-white font-black text-xs">
              A
            </div>
            <span className="text-xs font-bold">AlalAI</span>
            <span className="text-xs text-muted-foreground">
              — Barangay Report Management System
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 AlalAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
