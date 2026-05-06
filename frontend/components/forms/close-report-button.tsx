"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clearToken, closeComplaint } from "@/lib/api";

export function CloseReportButton({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClose() {
    setLoading(true);
    setError(null);
    try {
      await closeComplaint(reportId);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      const authError =
        message.toLowerCase().includes("invalid token") ||
        message.toLowerCase().includes("not authenticated") ||
        message.includes("401");

      if (authError) {
        clearToken();
        setError("Session expired. Please sign in again to confirm.");
        return;
      }

      setError("Could not confirm this report yet. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="shrink-0 flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleClose}
        disabled={loading}
        className="h-9 px-4 rounded-xl border border-emerald-500/40 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Confirming..." : "Confirm Resolved"}
      </button>
      {error && (
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="max-w-44 text-right text-[11px] font-semibold leading-snug text-destructive hover:underline"
        >
          {error}
        </button>
      )}
    </div>
  );
}
