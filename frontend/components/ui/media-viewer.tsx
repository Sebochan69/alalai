"use client";

import { useState } from "react";

export function MediaViewer({
  src,
  label = "Photo Evidence",
}: {
  src: string;
  label?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm mb-4">
      {/* Header */}
      <div className="px-5 py-3 border-b border-border/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-sky-600/80 flex items-center justify-center shrink-0">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
        </div>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 h-7 px-3 rounded-lg bg-sky-600/80 text-white text-[11px] font-bold hover:bg-sky-600 transition-colors"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Full Size
        </a>
      </div>

      {/* Image area */}
      <div className="relative bg-muted/20" style={{ minHeight: "260px" }}>
        {/* Skeleton — shown until loaded or error */}
        {!loaded && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted/30 animate-pulse">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground/40"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <p className="text-xs text-muted-foreground/40 font-medium">
              Loading photo…
            </p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted/20">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground/40"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-xs text-muted-foreground/50 font-medium">
              Could not load image
            </p>
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-accent hover:underline font-semibold"
            >
              Open directly ↗
            </a>
          </div>
        )}

        {/* Actual image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="Complaint photo evidence"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          onClick={() => window.open(src, "_blank")}
          className={`w-full object-cover cursor-zoom-in transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
          style={{ maxHeight: "420px", minHeight: "260px", display: "block" }}
        />
      </div>

      {/* Footer hint */}
      {loaded && (
        <div className="px-5 py-2 border-t border-border/40 bg-muted/20">
          <p className="text-[10px] text-muted-foreground">
            Click image or &ldquo;Full Size&rdquo; to view original
          </p>
        </div>
      )}
    </div>
  );
}
