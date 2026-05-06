import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { LoginForm } from "@/components/forms/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const isAdmin = role === "admin";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Nav */}
      <header className="border-b border-border bg-card sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white font-extrabold text-base shrink-0">
              A
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight block leading-none">
                AlalAI
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                Brgy. Report System
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/register">
              <button className="h-9 px-4 rounded-xl border border-border text-sm font-semibold hover:bg-muted/50 transition-colors">
                Create account
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          {/* Role switcher */}
          <div className="flex rounded-2xl border border-border bg-muted/40 p-1 mb-6 gap-1">
            <Link
              href="/login"
              className={`flex-1 text-center text-sm py-2.5 rounded-xl font-bold transition-all ${!isAdmin ? "bg-card shadow-sm text-accent border border-border" : "text-muted-foreground hover:text-foreground"}`}
            >
              Citizen
            </Link>
            <Link
              href="/login?role=admin"
              className={`flex-1 text-center text-sm py-2.5 rounded-xl font-bold transition-all ${isAdmin ? "bg-card shadow-sm text-violet-600 dark:text-violet-400 border border-border" : "text-muted-foreground hover:text-foreground"}`}
            >
              Admin
            </Link>
          </div>
          <LoginForm isAdmin={isAdmin} />
          <p className="text-center text-xs text-muted-foreground mt-5">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-accent font-bold hover:underline"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
