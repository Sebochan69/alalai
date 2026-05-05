"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/api";

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", email: "", location_assigned: "", password: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((p) => ({ ...p, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
    if (!form.username || !form.email || !form.password) { setError("Please fill in all required fields."); return; }
    setError(null);
    setLoading(true);
    try {
      await register({ username: form.username, email: form.email, password: form.password, location_assigned: form.location_assigned || undefined });
      router.push("/citizen/dashboard");
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
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
            <svg className="text-white" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight">Create account</h2>
            <p className="text-xs text-muted-foreground">Register as a citizen to file concerns.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/8 border border-destructive/20 rounded-xl px-4 py-3">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          {[
            { id: "username",          label: "Username",                  type: "text",     placeholder: "juandelacruz",              autoComplete: "username",     required: true  },
            { id: "email",             label: "Email address",             type: "email",    placeholder: "juan@example.com",           autoComplete: "email",        required: true  },
            { id: "location_assigned", label: "Home address / Purok",      type: "text",     placeholder: "Purok 1, Barangay San Isidro", autoComplete: "street-address", required: false },
          ].map((f) => (
            <div key={f.id} className="space-y-1.5">
              <label htmlFor={f.id} className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                {f.label}
                {!f.required && <span className="normal-case font-normal text-muted-foreground/60">(optional)</span>}
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
            <label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Password <span className="text-destructive">*</span></label>
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
              <button type="button" onClick={() => setShowPw((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPw ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Confirm password <span className="text-destructive">*</span></label>
            <input
              id="confirmPassword"
              type={showPw ? "text" : "password"}
              placeholder="Repeat password"
              autoComplete="new-password"
              required
              className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
              value={form.confirmPassword}
              onChange={update("confirmPassword")}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl font-black text-sm text-white bg-accent hover:bg-accent/90 transition-all shadow-sm hover:shadow-md hover:shadow-accent/25 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}