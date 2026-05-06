"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import type { AdminPin } from "./admin-map";

function MapSkeleton() {
  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-200 dark:bg-[#1a1f2e]">
      {/* tile grid */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="admin-tile"
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
        <rect width="100%" height="100%" fill="url(#admin-tile)" />
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
          strokeWidth="12"
          className="text-slate-300 dark:text-white/10"
        />
        <line
          x1="62%"
          y1="0"
          x2="64%"
          y2="100%"
          stroke="currentColor"
          strokeWidth="6"
          className="text-slate-300 dark:text-white/8"
        />
        <line
          x1="0"
          y1="20%"
          x2="60%"
          y2="18%"
          stroke="currentColor"
          strokeWidth="3"
          className="text-slate-300 dark:text-white/6"
        />
      </svg>

      {/* shimmer */}
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 dark:via-white/4 to-transparent animate-[shimmer_1.8s_ease-in-out_infinite] bg-size-[200%_100%]" />

      {/* fake pins */}
      {[
        { top: "38%", left: "32%", color: "bg-amber-400" },
        { top: "55%", left: "58%", color: "bg-violet-400" },
        { top: "28%", left: "65%", color: "bg-amber-400" },
        { top: "62%", left: "40%", color: "bg-blue-400" },
      ].map((pos, i) => (
        <div
          key={i}
          className={`absolute w-3 h-3 rounded-full animate-pulse opacity-50 dark:opacity-70 ${pos.color}`}
          style={{ top: pos.top, left: pos.left }}
        />
      ))}

      {/* zoom controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-1">
        <div className="w-8 h-8 rounded bg-white/60 dark:bg-white/10 animate-pulse" />
        <div className="w-8 h-8 rounded bg-white/60 dark:bg-white/10 animate-pulse" />
      </div>

      {/* loading label */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/70 dark:bg-black/40 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-full px-4 py-2">
        <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
        <span className="text-xs font-semibold text-slate-500 dark:text-white/50">
          Loading map…
        </span>
      </div>
    </div>
  );
}

const AdminMapView = dynamic(
  () => import("./admin-map").then((m) => m.AdminMapView),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  },
);

const STATUS_DOT: Record<string, string> = {
  pending: "bg-amber-400",
  "in-progress": "bg-violet-400",
  "for-review": "bg-blue-400",
  resolved: "bg-emerald-400",
};
const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  "in-progress": "In Progress",
  "for-review": "For Review",
  resolved: "Resolved",
};
const PRIORITY_SCORE: Record<string, number> = { high: 3, medium: 2, low: 1 };
const STATUS_SCORE: Record<string, number> = {
  pending: 3,
  "for-review": 2,
  "in-progress": 1,
};
const PRIORITY_CHIP: Record<string, string> = {
  high: "bg-red-500/10 text-red-400 border border-red-500/20",
  medium: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  low: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
};
const PRIORITY_DOT: Record<string, string> = {
  high: "bg-red-400",
  medium: "bg-amber-400",
  low: "bg-emerald-400",
};
const PRIORITY_BAR: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-emerald-500",
};

const LEGEND = [
  { color: "bg-amber-400", label: "Pending" },
  { color: "bg-blue-400", label: "Under Review" },
  { color: "bg-violet-400", label: "In Progress" },
  { color: "bg-emerald-400", label: "Resolved" },
];

function sortByPriority(pins: AdminPin[]) {
  return [...pins].sort((a, b) => {
    const pa = PRIORITY_SCORE[a.priority ?? "medium"] ?? 2;
    const pb = PRIORITY_SCORE[b.priority ?? "medium"] ?? 2;
    if (pb !== pa) return pb - pa;
    const sa = STATUS_SCORE[a.status] ?? 0;
    const sb = STATUS_SCORE[b.status] ?? 0;
    return sb - sa;
  });
}

function buildNavigateUrl(orderedPins: AdminPin[]) {
  if (orderedPins.length === 0) return null;
  if (orderedPins.length === 1) {
    return `https://www.google.com/maps/dir/?api=1&destination=${orderedPins[0].lat},${orderedPins[0].lng}`;
  }
  const dest = orderedPins[orderedPins.length - 1];
  const waypoints = orderedPins
    .slice(0, -1)
    .map((p) => `${p.lat},${p.lng}`)
    .join("|");
  return `https://www.google.com/maps/dir/?api=1&waypoints=${encodeURIComponent(waypoints)}&destination=${dest.lat},${dest.lng}`;
}

// Floating info card — positioned near the clicked pin
const CARD_W = 300;
const CARD_H = 230;

function PinInfoCard({
  pin,
  pos,
  onClose,
}: {
  pin: AdminPin;
  pos: { x: number; y: number } | null;
  onClose: () => void;
}) {
  const prio = pin.priority ?? "medium";

  // pos.y is the pin TIP (anchor:'bottom'), pos.x is horizontal center of pin
  const style: React.CSSProperties = (() => {
    if (!pos) {
      return { bottom: 20, left: "50%", transform: "translateX(-50%)" };
    }
    const GAP = 10;
    const showAbove = pos.y > CARD_H + 20;
    const rawLeft = pos.x - CARD_W / 2;
    // Above: card sits just above the tip. Below: card sits just below.
    const top = showAbove ? pos.y - CARD_H - GAP : pos.y + GAP;
    return {
      top,
      left: `clamp(8px, ${rawLeft}px, calc(100% - ${CARD_W + 8}px))`,
      width: CARD_W,
      transform: "none",
    };
  })();

  return (
    <motion.div
      key="pin-card"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      style={style}
      className="absolute z-50 pointer-events-auto"
    >
      <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Priority accent bar */}
        <div className={`h-1 w-full ${PRIORITY_BAR[prio]}`} />
        <div className="p-4">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[9px] font-black px-2 py-0.5 rounded-full ${PRIORITY_CHIP[prio]}`}
              >
                {prio.toUpperCase()}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                {pin.tagging} · #{pin.id}
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground shrink-0 transition-colors"
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

          {/* Title */}
          <p className="font-black text-sm leading-snug mb-3">{pin.title}</p>

          {/* Meta */}
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="truncate">{pin.location}</span>
            </div>
            {pin.citizenName && (
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>{pin.citizenName}</span>
              </div>
            )}
          </div>

          {/* Footer: status + directions */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/60">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[pin.status] ?? "bg-muted-foreground"}`}
              />
              <span className="text-[11px] font-semibold text-muted-foreground">
                {STATUS_LABEL[pin.status]}
              </span>
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${pin.lat},${pin.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition-colors"
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
                <polygon points="3 11 22 2 13 21 11 13 3 11" />
              </svg>
              Get Directions
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function AdminMapClient({
  pins,
  emptyState = false,
  center,
}: {
  pins: AdminPin[];
  emptyState?: boolean;
  center?: [number, number];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cardPos, setCardPos] = useState<{ x: number; y: number } | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const active = sortByPriority(
    pins.filter((p) => p.status !== "resolved" && p.status !== "closed"),
  );
  const done = pins.filter(
    (p) => p.status === "resolved" || p.status === "closed",
  );

  const highUrgent = active.filter(
    (p) => p.priority === "high" && p.status === "pending",
  );
  const navigateUrl = buildNavigateUrl(active);
  const selectedPin = pins.find((p) => p.id === selectedId) ?? null;

  function handlePinClick(id: string) {
    setSelectedId((prev) => (prev === id ? null : id));
    setCardPos(null);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-5 md:px-8 py-5 border-b border-border bg-card shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-violet-500 dark:text-violet-400 mb-0.5">
              Admin
            </p>
            <h1 className="text-2xl font-black tracking-tight">Barangay Map</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Live complaint locations — sorted by severity
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="flex items-center gap-1.5 bg-muted/40 border border-border rounded-full px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-muted-foreground">
                Live · {pins.length} pins
              </span>
            </div>
            {highUrgent.length > 0 && (
              <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 rounded-full px-3 py-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <span className="text-xs font-bold text-red-400">
                  {highUrgent.length} urgent pending
                </span>
              </div>
            )}
          </div>
        </div>
        {/* Navigate All + Legend row */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {navigateUrl && (
            <a
              href={navigateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-colors"
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="3 11 22 2 13 21 11 13 3 11" />
              </svg>
              Navigate All Active ({active.length})
            </a>
          )}
          {LEGEND.map((l) => (
            <div
              key={l.label}
              className="flex items-center gap-1.5 bg-background border border-border rounded-full px-2.5 py-1"
            >
              <span className={`w-2 h-2 rounded-full ${l.color} shrink-0`} />
              <span className="text-[11px] font-semibold text-muted-foreground">
                {l.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Body: sidebar + map */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 border-r border-border bg-card flex-col hidden md:flex overflow-hidden shrink-0">
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {active.length > 0 && (
              <>
                <div className="flex items-center justify-between px-2 pt-1 pb-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Active ({active.length})
                  </p>
                  <p className="text-[9px] text-muted-foreground font-semibold">
                    ↓ by severity
                  </p>
                </div>
                {active.map((pin, i) => {
                  const prio = pin.priority ?? "medium";
                  return (
                    <motion.button
                      key={pin.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => handlePinClick(pin.id)}
                      className={`w-full text-left rounded-xl p-3 transition-all border shadow-sm ${
                        selectedId === pin.id
                          ? "border-violet-500/50 bg-violet-100 dark:bg-violet-500/10 shadow-violet-500/10"
                          : "bg-muted/40 dark:bg-[oklch(0.26_0.022_258)] border-border hover:border-violet-500/30 hover:-translate-y-0.5 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-black text-muted-foreground/60 w-4 shrink-0">
                          #{i + 1}
                        </span>
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${PRIORITY_CHIP[prio]}`}
                        >
                          {prio.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold ml-auto">
                          {STATUS_LABEL[pin.status]}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span
                          className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${STATUS_DOT[pin.status] ?? "bg-muted-foreground"}`}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate leading-snug">
                            {pin.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                            {pin.location}
                          </p>
                          <p className="text-[10px] text-muted-foreground/60 mt-0.5 font-mono">
                            #{pin.id}
                          </p>
                        </div>
                      </div>
                      {selectedId === pin.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 flex items-center gap-2"
                        >
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${pin.lat},${pin.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[11px] font-bold text-violet-500 dark:text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-1 rounded-lg hover:bg-violet-500/20 transition-colors"
                            onClick={(e) => e.stopPropagation()}
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
                              <polygon points="3 11 22 2 13 21 11 13 3 11" />
                            </svg>
                            Directions
                          </a>
                          <span
                            className={`w-2.5 h-2.5 rounded-full shrink-0 ${PRIORITY_DOT[prio]}`}
                          />
                          <span className="text-[10px] text-muted-foreground">
                            {prio} priority
                          </span>
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </>
            )}

            {done.length > 0 && (
              <>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 pt-3 pb-0.5">
                  Resolved ({done.length})
                </p>
                {done.map((pin, i) => (
                  <motion.button
                    key={pin.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.04 }}
                    onClick={() => handlePinClick(pin.id)}
                    className={`w-full text-left rounded-xl p-3 transition-all border shadow-sm ${
                      selectedId === pin.id
                        ? "border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/8 shadow-emerald-500/10"
                        : "bg-muted/40 dark:bg-[oklch(0.26_0.022_258)] border-border opacity-75 hover:opacity-100 hover:border-emerald-500/30 hover:-translate-y-0.5 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-emerald-400" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate leading-snug">
                          {pin.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                          {pin.location}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative overflow-hidden">
          {emptyState ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground bg-muted/30 dark:bg-[oklch(0.12_0.022_258)]">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-30"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              <p className="text-sm font-semibold">
                No complaints with GPS data yet
              </p>
              <p className="text-xs text-center max-w-xs">
                Pins will appear here once complaints are filed with a GPS
                location.
              </p>
            </div>
          ) : (
            <>
              <AdminMapView
                pins={pins}
                selectedId={selectedId}
                onPinClick={(id) => handlePinClick(id)}
                onCardPos={(pos) => setCardPos(pos)}
                onReady={() => setMapReady(true)}
                center={center}
              />
              <AnimatePresence>
                {!mapReady && (
                  <motion.div
                    key="map-skeleton"
                    className="absolute inset-0 z-10"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <MapSkeleton />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Floating React info card — stays fixed, works on all screen sizes */}
              <AnimatePresence>
                {selectedPin && (
                  <PinInfoCard
                    key={selectedPin.id}
                    pin={selectedPin}
                    pos={cardPos}
                    onClose={() => {
                      setSelectedId(null);
                      setCardPos(null);
                    }}
                  />
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
