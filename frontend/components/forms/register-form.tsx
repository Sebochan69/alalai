"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/api";

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    location_assigned: "",
    password: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
        location_assigned: form.location_assigned || undefined,
      });
      setSuccess(true);
      setLoading(false);
      window.setTimeout(() => router.replace("/login?registered=1"), 1200);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.",
      );
      setLoading(false);
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl shadow-md overflow-hidden">
      {/* Header stripe */}
      <div className="h-1.5 w-full bg-accent" />

      <div className="p-6">
        {/* Icon + title */}
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
            <svg
              className="text-white"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight">
              Create account
            </h2>
            <p className="text-xs text-muted-foreground">
              Register as a citizen to file concerns.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {success && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-3">
              <p className="text-sm font-black text-emerald-500">
                Account created
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Your account is ready. Redirecting you to sign in...
              </p>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/8 border border-destructive/20 rounded-xl px-4 py-3">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {[
            {
              id: "username",
              label: "Username",
              type: "text",
              placeholder: "juandelacruz",
              autoComplete: "username",
              required: true,
            },
            {
              id: "email",
              label: "Email address",
              type: "email",
              placeholder: "juan@example.com",
              autoComplete: "email",
              required: true,
            },
            {
              id: "location_assigned",
              label: "Home address / Purok",
              type: "text",
              placeholder: "Purok 1, Barangay San Isidro",
              autoComplete: "street-address",
              required: false,
            },
          ].map((f) => (
            <div key={f.id} className="space-y-1.5">
              <label
                htmlFor={f.id}
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1"
              >
                {f.label}
                {!f.required && (
                  <span className="normal-case font-normal text-muted-foreground/60">
                    (optional)
                  </span>
                )}
                {f.required && <span className="text-destructive">*</span>}
              </label>
              <input
                id={f.id}
                type={f.type}
                placeholder={f.placeholder}
                autoComplete={f.autoComplete}
                required={f.required}
                className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
                value={form[f.id as keyof typeof form]}
                onChange={update(f.id as keyof typeof form)}
              />
            </div>
          ))}

          {/* Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
            >
              Password <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPw ? "text" : "password"}
                placeholder="Create a password"
                autoComplete="new-password"
                required
                className="w-full h-11 px-4 pr-11 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
                value={form.password}
                onChange={update("password")}
              />
              <button
                type="button"
                onClick={() => setShowPw((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? (
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full h-11 rounded-xl font-black text-sm text-white bg-accent hover:bg-accent/90 transition-all shadow-sm hover:shadow-md hover:shadow-accent/25 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-2.5 mt-1 cursor-pointer"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin shrink-0"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="white"
                    strokeWidth="3"
                  />
                  <path
                    className="opacity-90"
                    fill="white"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <span>Creating account…</span>
              </>
            ) : success ? (
              "Redirecting to sign in..."
            ) : (
              "Create account"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
