"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateComplaint } from "@/lib/api";
import type { Complaint, ReportStatus } from "@/lib/types";

const STATUS_OPTIONS: { value: ReportStatus; label: string; dot: string }[] = [
  { value: "pending", label: "⏳ Pending", dot: "bg-amber-400" },
  { value: "in-progress", label: "🔄 In Progress", dot: "bg-blue-400" },
  { value: "for-review", label: "👁️ Mark For Review", dot: "bg-violet-400" },
];

export function AdminUpdateForm({ report }: { report: Complaint }) {
  const router = useRouter();
  const [status, setStatus] = useState<ReportStatus>(report.status);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      await updateComplaint(report.id, {
        status,
        adminComment: comment.trim() || undefined,
      });
      setSaved(true);
      router.refresh();
    } catch {
      setError("Failed to update. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Status picker */}
      <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-border/60 bg-muted/30">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Update Status
          </p>
        </div>
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatus(opt.value)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 text-sm font-semibold text-left transition-all ${
                  status === opt.value
                    ? "border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400"
                    : "border-border bg-muted/20 text-muted-foreground hover:border-border hover:bg-muted/50"
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${opt.dot}`}
                />
                {opt.label.replace(/^\S+\s/, "")}
              </button>
            ))}
          </div>
          {status === "for-review" && (
            <div className="flex items-start gap-2 rounded-xl bg-violet-500/8 border border-violet-500/20 px-3 py-2.5">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-violet-400 mt-0.5 shrink-0"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <p className="text-xs text-violet-600 dark:text-violet-400">
                Citizen will be notified to confirm and resolve the report.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Comment */}
      <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-border/60 bg-muted/30">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Admin Comment{" "}
            <span className="normal-case font-normal">(optional)</span>
          </p>
        </div>
        <div className="p-5 space-y-3">
          {/* Previous comment */}
          {report.adminComment && (
            <div className="flex items-start gap-3 bg-muted/30 border border-border/50 rounded-xl p-3">
              <div className="w-7 h-7 rounded-full bg-violet-600/15 border border-violet-500/25 flex items-center justify-center text-violet-500 dark:text-violet-400 text-[10px] font-black shrink-0">
                A
              </div>
              <div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {report.adminComment}
                </p>
                {report.adminCommentDate && (
                  <p className="text-[10px] text-muted-foreground/60 mt-1">
                    {report.adminName ?? "Admin"} ·{" "}
                    {new Date(report.adminCommentDate).toLocaleDateString(
                      "en-PH",
                      { month: "short", day: "numeric", year: "numeric" },
                    )}
                  </p>
                )}
              </div>
            </div>
          )}
          <textarea
            rows={3}
            placeholder={
              report.adminComment
                ? "Add a new comment (replaces previous)..."
                : "Write a message to the citizen..."
            }
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition-all resize-none"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
      </div>

      {/* Error / success */}
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
      {saved && !error && (
        <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/8 border border-emerald-500/20 rounded-xl px-4 py-3">
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
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          Report updated successfully. The citizen email notification was sent.
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/reports")}
          className="flex-1 h-11 rounded-xl border border-border text-sm font-semibold hover:bg-muted/40 transition-colors"
        >
          Back to Reports
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={handleSave}
          className="flex-2 h-11 rounded-xl bg-violet-600 text-white font-black text-sm hover:bg-violet-600/90 disabled:opacity-50 transition-all shadow-sm hover:shadow-md hover:shadow-violet-500/25 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="animate-spin"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Saving…
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </div>
  );
}
