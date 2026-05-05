"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { closeComplaint } from "@/lib/api";

export function CloseReportButton({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClose() {
    setLoading(true);
    try {
      await closeComplaint(reportId);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClose}
      disabled={loading}
      className="shrink-0 h-9 px-4 rounded-xl border border-emerald-500/40 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Closing…" : "Close Report"}
    </button>
  );
}
