"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import type { MapPin } from "./brgy-map";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function MapSkeleton() {
  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-[#1a1f2e]">
      {/* grid lines */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.07]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="brgy-grid"
            width="64"
            height="64"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 64 0 L 0 0 0 64"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#brgy-grid)" />
      </svg>

      {/* fake road lines */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          x1="0"
          y1="42%"
          x2="100%"
          y2="38%"
          stroke="white"
          strokeWidth="6"
        />
        <line
          x1="0"
          y1="65%"
          x2="100%"
          y2="60%"
          stroke="white"
          strokeWidth="3"
        />
        <line
          x1="30%"
          y1="0"
          x2="28%"
          y2="100%"
          stroke="white"
          strokeWidth="4"
        />
        <line
          x1="60%"
          y1="0"
          x2="62%"
          y2="100%"
          stroke="white"
          strokeWidth="2"
        />
        <line
          x1="0"
          y1="25%"
          x2="100%"
          y2="20%"
          stroke="white"
          strokeWidth="1.5"
        />
      </svg>

      {/* shimmer overlay */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          background:
            "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.7) 50%, transparent 60%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.8s ease-in-out infinite",
        }}
      />

      {/* fake pins */}
      {[
        { top: "38%", left: "42%" },
        { top: "55%", left: "60%" },
        { top: "30%", left: "65%" },
        { top: "62%", left: "35%" },
      ].map((pos, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 rounded-full bg-white/20 animate-pulse"
          style={{ top: pos.top, left: pos.left }}
        />
      ))}

      {/* nav control skeleton */}
      <div className="absolute top-3 right-3 flex flex-col gap-1">
        <div className="w-8 h-8 rounded-lg bg-white/10 animate-pulse" />
        <div className="w-8 h-8 rounded-lg bg-white/10 animate-pulse" />
      </div>

      {/* centre label */}
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-xs text-white/30 font-medium tracking-wide">
          Loading map…
        </p>
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
      className="w-full h-full rounded-2xl flex flex-col items-center justify-center gap-3 bg-[#1a1f2e]"
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
        className="text-white/20"
      >
        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
        <line x1="9" y1="3" x2="9" y2="18" />
        <line x1="15" y1="6" x2="15" y2="21" />
      </svg>
      <p className="text-sm font-semibold text-white/30">
        No complaints with location data yet
      </p>
      <p className="text-xs text-white/20">
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
