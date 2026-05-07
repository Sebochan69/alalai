"use client";

import { useState } from "react";
import { changePassword } from "@/lib/api";

export function ChangePasswordButton({
  className,
  compact = false,
}: {
  className: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Enter your current password and confirm the new one.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await changePassword({
        old_password: currentPassword,
        new_password: newPassword,
        confirm_new_password: confirmPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Password updated successfully.");
      setOpen(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not change password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => {
          setOpen(true);
          setError(null);
          setMessage(null);
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        {!compact && <span>Change password</span>}
      </button>

      {message && (
        <p className="text-[11px] font-semibold text-emerald-500 px-1">
          {message}
        </p>
      )}

      {open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-background/75 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black">Change password</p>
                <p className="text-xs text-muted-foreground">
                  Keep your account secure.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/8 px-3 py-2 text-xs text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <label
                  htmlFor="current-password"
                  className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
                >
                  Current password
                </label>
                <input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
                  autoComplete="current-password"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="new-password"
                  className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
                >
                  New password
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="confirm-new-password"
                  className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
                >
                  Confirm new password
                </label>
                <input
                  id="confirm-new-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
                  autoComplete="new-password"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 h-10 rounded-xl border border-border text-sm font-semibold hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-10 rounded-xl bg-accent text-white text-sm font-black hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
