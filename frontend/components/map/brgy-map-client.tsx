"use client";

import Link from "next/link";
import { useState } from "react";
import type { CSSProperties } from "react";
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

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  "in-progress": "In Progress",
  "for-review": "For Review",
  resolved: "Resolved",
};

const STATUS_DOT: Record<string, string> = {
  pending: "bg-amber-400",
  "in-progress": "bg-blue-500",
  "for-review": "bg-violet-500",
  resolved: "bg-emerald-500",
};

const STATUS_CHIP: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/25",
  "in-progress": "bg-blue-500/10 text-blue-400 border-blue-500/25",
  "for-review": "bg-violet-500/10 text-violet-400 border-violet-500/25",
  resolved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
};

const CARD_W = 300;
const CARD_H = 210;

function PinInfoCard({
  pin,
  pos,
  onClose,
}: {
  pin: MapPin;
  pos: { x: number; y: number } | null;
  onClose: () => void;
}) {
  const style: CSSProperties = (() => {
    if (!pos) {
      return { bottom: 20, left: "50%", transform: "translateX(-50%)" };
    }

    const gap = 12;
    const showAbove = pos.y > CARD_H + 28;
    const rawLeft = pos.x - CARD_W / 2;

    return {
      top: showAbove ? pos.y - CARD_H - gap : pos.y + gap,
      left: `clamp(8px, ${rawLeft}px, calc(100% - ${CARD_W + 8}px))`,
      width: CARD_W,
    };
  })();

  const statusLabel = STATUS_LABEL[pin.status] ?? pin.status;

  return (
    <motion.div
      key={pin.id}
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      style={style}
      className="absolute z-30 pointer-events-auto"
    >
      <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        <div
          className={`h-1 w-full ${STATUS_DOT[pin.status] ?? "bg-accent"}`}
        />
        <div className="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full border shrink-0 ${
                  STATUS_CHIP[pin.status] ??
                  "bg-accent/10 text-accent border-accent/25"
                }`}
              >
                {statusLabel}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground truncate">
                {pin.tagging} · #{pin.id}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-6 h-6 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground shrink-0 transition-colors"
              aria-label="Close pin details"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <p className="font-black text-sm leading-snug mb-2 line-clamp-2">
            {pin.title}
          </p>
          {pin.summary && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-3">
              {pin.summary}
            </p>
          )}

          <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/60">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
              <span
                className={`w-2 h-2 rounded-full ${
                  STATUS_DOT[pin.status] ?? "bg-accent"
                }`}
              />
              Pinned location
            </span>
            <Link
              href={`/citizen/reports/${pin.id}`}
              className="text-[11px] font-bold text-accent hover:text-accent/80 transition-colors"
            >
              View report
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

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

export function BrgyMapClient({
  pins,
  center,
}: {
  pins: MapPin[];
  center?: [number, number];
}) {
  const [mapReady, setMapReady] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cardPos, setCardPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const selectedPin = pins.find((pin) => pin.id === selectedId) ?? null;

  if (pins.length === 0) return <EmptyState />;

  function handlePinClick(id: string) {
    setSelectedId((prev) => (prev === id ? null : id));
    setCardPos(null);
  }

  return (
    <div className="relative w-full h-full" style={{ minHeight: "400px" }}>
      <BrgyMapView
        pins={pins}
        onReady={() => setMapReady(true)}
        center={center}
        selectedId={selectedId}
        onPinClick={handlePinClick}
        onCardPos={setCardPos}
      />
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
      <AnimatePresence>
        {selectedPin && (
          <PinInfoCard
            pin={selectedPin}
            pos={cardPos}
            onClose={() => {
              setSelectedId(null);
              setCardPos(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
