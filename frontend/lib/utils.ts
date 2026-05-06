import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Exact-match first, then keyword fallback for AI-generated BE category tags.
const CATEGORY_EMOJI_MAP: Record<string, string> = {
  Infrastructure: "🏗️",
  Environment: "🌿",
  "Public Safety": "🛡️",
  Sanitation: "🗑️",
  "Noise Complaint": "🔊",
  "Illegal Construction": "🚧",
  Flooding: "🌊",
  "Animal Control": "🐕",
  Other: "📋",
};

const KEYWORD_MAP: [RegExp, string][] = [
  [/electrical|lighting|light|power|electric/i, "💡"],
  [/road|pavement|pothole|infrastructure|streetlight/i, "🏗️"],
  [/flood|drainage|water|canal/i, "🌊"],
  [/garbage|trash|waste|sanit|sewage/i, "🗑️"],
  [/noise|sound|disturbance/i, "🔊"],
  [/illegal|construct|building|demolish/i, "🚧"],
  [/environment|tree|plant|pollution|smoke/i, "🌿"],
  [/safety|crime|peace|order|security|tanod/i, "🛡️"],
  [/animal|stray|dog|cat/i, "🐕"],
  [/health|medical|hospital/i, "🏥"],
  [/fire|blaze/i, "🔥"],
];

export function getCategoryEmoji(tag: string): string {
  if (!tag) return "📋";
  // exact match
  if (CATEGORY_EMOJI_MAP[tag]) return CATEGORY_EMOJI_MAP[tag];
  // keyword match (case-insensitive)
  for (const [pattern, emoji] of KEYWORD_MAP) {
    if (pattern.test(tag)) return emoji;
  }
  return "📋";
}
