import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const features = [
  {
    circle: "bg-blue-500",
    emoji: "📋",
    title: "File a Concern",
    description:
      "Submit complaints about barangay issues quickly. AI routes it to the right official.",
  },
  {
    circle: "bg-emerald-500",
    emoji: "📍",
    title: "Live Brgy Map",
    description:
      "View all active reports pinned on an interactive barangay map in real time.",
  },
  {
    circle: "bg-violet-600",
    emoji: "🤖",
    title: "AI Auto-Assignment",
    description:
      "Reports are automatically routed based on location, category, and priority.",
  },
  {
    circle: "bg-amber-500",
    emoji: "🔔",
    title: "Real-time Updates",
    description:
      "Get email notifications as your report moves from Pending to Resolved.",
  },
];

const stats = [
  { label: "Reports Filed", value: "1,248", color: "text-accent" },
  { label: "Resolved", value: "984", color: "text-emerald-500" },
  { label: "Avg. Resolution", value: "2.4d", color: "text-amber-500" },
  { label: "Active Admins", value: "3", color: "text-violet-500" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ── Nav ───────────────────────────────────────────────────────── */}
      <header className="border-b border-border bg-card sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white font-extrabold text-base shrink-0">
              A
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight block leading-none">
                alalAI
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                Brgy. Report System
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login">
              <button className="h-9 px-4 rounded-xl border border-border text-sm font-semibold hover:bg-muted/50 transition-colors">
                Sign In
              </button>
            </Link>
            <Link href="/register">
              <button className="h-9 px-4 rounded-xl bg-accent text-white text-sm font-bold hover:bg-accent/90 transition-all shadow-sm hover:shadow-md hover:shadow-accent/20 hover:-translate-y-0.5 active:translate-y-0">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-20 pb-20 px-5 md:px-8">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-32 right-0 w-150 h-150 bg-accent/5 rounded-full blur-3xl" />
            <div className="absolute top-40 -left-20 w-100 h-100 bg-violet-500/4 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/8 border border-accent/20 text-accent text-xs font-bold mb-8">
              🏛️ Barangay Complaint &amp; Report Management
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-5 leading-[1.08]">
              Your voice matters
              <br className="hidden md:block" /> in{" "}
              <span className="text-accent">your barangay.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              File concerns, track resolutions, and stay informed — alalAI
              connects citizens directly with barangay officials, transparently
              and efficiently.
            </p>

            {/* Dual CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register">
                <div className="group w-64 rounded-2xl border-2 border-accent/30 bg-card shadow-sm hover:border-accent/70 hover:shadow-xl hover:shadow-accent/15 hover:-translate-y-1 transition-all duration-200 p-5 cursor-pointer text-left">
                  <div className="w-11 h-11 rounded-full bg-accent flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg
                      className="text-white"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <p className="font-black text-base mb-1">
                    I&apos;m a Citizen
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                    File a concern, track reports, and view the barangay map.
                  </p>
                  <span className="text-xs text-accent font-bold group-hover:translate-x-1 transition-transform inline-block">
                    Register / Sign in →
                  </span>
                </div>
              </Link>

              <Link href="/login?role=admin">
                <div className="group w-64 rounded-2xl border-2 border-violet-500/30 bg-card shadow-sm hover:border-violet-500/70 hover:shadow-xl hover:shadow-violet-500/15 hover:-translate-y-1 transition-all duration-200 p-5 cursor-pointer text-left">
                  <div className="w-11 h-11 rounded-full bg-violet-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg
                      className="text-white"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <p className="font-black text-base mb-1">I&apos;m an Admin</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                    Manage reports, update statuses, and view your assigned
                    zone.
                  </p>
                  <span className="text-xs text-violet-500 font-bold group-hover:translate-x-1 transition-transform inline-block">
                    Admin Sign in →
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Stats bar ─────────────────────────────────────────────────── */}
        <section className="border-y border-border py-8 px-5 md:px-8 bg-card shadow-sm">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p className={`text-3xl font-black tracking-tight ${s.color}`}>
                  {s.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ──────────────────────────────────────────────────── */}
        <section className="py-20 px-5 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-[11px] font-bold uppercase tracking-widest text-accent mb-2">
                How it works
              </p>
              <h2 className="text-3xl font-black tracking-tight mb-2">
                Everything you need
              </h2>
              <p className="text-muted-foreground text-sm">
                Transparent, fast, and community-driven.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="group bg-card border border-border/60 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-accent/30 transition-all duration-200 cursor-default"
                >
                  <div
                    className={`w-11 h-11 rounded-full ${f.circle} flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform`}
                  >
                    {f.emoji}
                  </div>
                  <h3 className="font-black text-sm mb-1.5 tracking-tight">
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

        {/* ── CTA banner ────────────────────────────────────────────────── */}
        <section className="py-16 px-5 md:px-8">
          <div className="max-w-2xl mx-auto bg-card border border-accent/20 rounded-3xl p-10 text-center shadow-xl shadow-accent/8">
            <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center text-white text-2xl font-black mx-auto mb-5">
              A
            </div>
            <h2 className="text-2xl font-black tracking-tight mb-2">
              Ready to make a difference?
            </h2>
            <p className="text-sm text-muted-foreground mb-7">
              Join hundreds of residents already using alalAI to improve their
              barangay.
            </p>
            <Link href="/register">
              <button className="h-12 px-8 rounded-xl bg-accent text-white font-black text-sm hover:bg-accent/90 transition-all shadow-md shadow-accent/25 hover:shadow-lg hover:shadow-accent/35 hover:-translate-y-0.5 active:translate-y-0">
                Create Your Account →
              </button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-6 px-6 text-center text-xs text-muted-foreground bg-card">
        © 2026 alalAI — Barangay Report Management System. All rights reserved.
      </footer>
    </div>
  );
}
