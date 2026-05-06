"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import type { MapPin } from "./brgy-map";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function MapSkeleton() {
  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-200 dark:bg-[#1a1f2e]">
      {/* tile grid */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="brgy-tile"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <rect
              width="60"
              height="60"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-slate-300 dark:text-white/8"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#brgy-tile)" />
      </svg>

      {/* road lines */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          x1="0"
          y1="42%"
          x2="100%"
          y2="38%"
          stroke="currentColor"
          strokeWidth="10"
          className="text-slate-300 dark:text-white/10"
        />
        <line
          x1="0"
          y1="65%"
          x2="100%"
          y2="60%"
          stroke="currentColor"
          strokeWidth="5"
          className="text-slate-300 dark:text-white/8"
        />
        <line
          x1="30%"
          y1="0"
          x2="28%"
          y2="100%"
          stroke="currentColor"
          strokeWidth="8"
          className="text-slate-300 dark:text-white/10"
        />
        <line
          x1="62%"
          y1="0"
          x2="62%"
          y2="100%"
          stroke="currentColor"
          strokeWidth="4"
          className="text-slate-300 dark:text-white/8"
        />
        <line
          x1="0"
          y1="25%"
          x2="100%"
          y2="20%"
          stroke="currentColor"
          strokeWidth="3"
          className="text-slate-300 dark:text-white/6"
        />
      </svg>

      {/* shimmer */}
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 dark:via-white/4 to-transparent animate-[shimmer_1.8s_ease-in-out_infinite] bg-size-[200%_100%]" />

      {/* fake pins */}
      {[
        { top: "38%", left: "42%", color: "bg-amber-400" },
        { top: "55%", left: "60%", color: "bg-blue-400" },
        { top: "30%", left: "65%", color: "bg-violet-400" },
        { top: "62%", left: "35%", color: "bg-emerald-400" },
      ].map((pos, i) => (
        <div
          key={i}
          className={`absolute w-3 h-3 rounded-full animate-pulse opacity-50 dark:opacity-70 ${pos.color}`}
          style={{ top: pos.top, left: pos.left }}
        />
      ))}

      {/* zoom controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-1">
        <div className="w-8 h-8 rounded-lg bg-white/60 dark:bg-white/10 animate-pulse" />
        <div className="w-8 h-8 rounded-lg bg-white/60 dark:bg-white/10 animate-pulse" />
      </div>

      {/* loading label */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/70 dark:bg-black/40 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-full px-4 py-2">
        <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        <span className="text-xs font-semibold text-slate-500 dark:text-white/50">
          Loading map…
        </span>
      </div>
    </div>
  );
}

// ─── Dynamic map import (ssr:false must live in a client component) ────────────

const BrgyMapView = dynamic(
  () => import("./brgy-map").then((m) => m.BrgyMapView),
  { ssr: false, loading: () => <MapSkeleton /> },
);

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div
      className="w-full h-full rounded-2xl flex flex-col items-center justify-center gap-3 bg-slate-100 dark:bg-[#1a1f2e]"
      style={{ minHeight: "400px" }}
    >
      <svg
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-slate-400 dark:text-white/20"
      >
        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
        <line x1="9" y1="3" x2="9" y2="18" />
        <line x1="15" y1="6" x2="15" y2="21" />
      </svg>
      <p className="text-sm font-semibold text-slate-500 dark:text-white/30">
        No complaints with location data yet
      </p>
      <p className="text-xs text-slate-400 dark:text-white/20">
        Pins appear when a complaint is filed with GPS coordinates.
      </p>
    </div>
  );
}

// ─── Client wrapper ───────────────────────────────────────────────────────────

export function BrgyMapClient({ pins }: { pins: MapPin[] }) {
  const [mapReady, setMapReady] = useState(false);

  if (pins.length === 0) return <EmptyState />;

  return (
    <div className="relative w-full h-full" style={{ minHeight: "400px" }}>
      <BrgyMapView pins={pins} onReady={() => setMapReady(true)} />
      <AnimatePresence>
        {!mapReady && (
          <motion.div
            className="absolute inset-0 z-10"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <MapSkeleton />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
