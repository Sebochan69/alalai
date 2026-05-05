"use client";

import { motion } from "framer-motion";

export interface StatItem {
  label: string;
  value: number;
  sub: string;
  colorClass: string;
  circleBg: string;
  border: string;
  glow: string;
  icon: React.ReactNode;
}

export function AdminStats({ stats }: { stats: StatItem[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.4 }}
          className={`group bg-card border rounded-2xl p-4 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-default ${s.border} ${s.glow}`}
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              {s.label}
            </p>
            <div
              className={`w-9 h-9 rounded-xl ${s.circleBg} flex items-center justify-center shrink-0`}
            >
              {s.icon}
            </div>
          </div>
          <div className={`text-3xl font-black tracking-tight ${s.colorClass}`}>
            {s.value}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">{s.sub}</p>
        </motion.div>
      ))}
    </div>
  );
}

export function AdminAIBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.36, duration: 0.4 }}
      className="flex items-start gap-3.5 mb-6 p-4 rounded-2xl bg-linear-to-r from-violet-500/10 to-transparent border border-violet-500/20"
    >
      <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/30">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-black text-violet-500 dark:text-violet-400">
            AI Backend Active
          </p>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse inline-block" />
            Live
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Reports are auto-classified by AI — category, priority, and zone
          routing happen on the backend before reaching you.
        </p>
      </div>
    </motion.div>
  );
}
