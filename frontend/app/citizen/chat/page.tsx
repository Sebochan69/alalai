"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type MessageRole = "user" | "bot";

interface Message {
  id: number;
  role: MessageRole;
  text: string;
  timestamp: Date;
}

// ─── Mock AI responses ─────────────────────────────────────────────────────────

const BOT_RESPONSES: { keywords: string[]; reply: string }[] = [
  {
    keywords: [
      "hello",
      "hi",
      "hey",
      "kumusta",
      "good morning",
      "good afternoon",
      "good evening",
    ],
    reply:
      "Hello! 👋 I'm the **AlalAI Assistant** — your smart barangay helper.\n\nI can guide you on filing concerns, checking report statuses, and more. What can I help you with today?",
  },
  {
    keywords: [
      "status",
      "my report",
      "my concern",
      "update",
      "track",
      "progress",
      "check",
    ],
    reply:
      "You can view the latest status of all your reports on the **My Reports** page.\n\nEach report shows its current stage:\n• **Pending** — waiting to be reviewed\n• **In Progress** — admin is working on it\n• **For Review** — solution pending verification\n• **Resolved** — concern has been closed",
  },
  {
    keywords: [
      "file",
      "submit",
      "new report",
      "new concern",
      "report problem",
      "report issue",
    ],
    reply:
      "To file a new concern, head to **File a Concern**. Here's what you can do:\n\n• 📍 Drop a pin on the map to mark the exact location\n• 📝 Describe the issue in detail\n• 📷 Attach photos or videos as evidence\n\nOur AI will automatically classify and route your concern to the right admin!",
  },
  {
    keywords: ["map", "location", "brgy map", "barangay map", "see reports"],
    reply:
      "The **Barangay Map** shows all active reports pinned to their real locations. You can browse what concerns have been filed in your area and track which ones are being resolved.",
  },
  {
    keywords: ["flood", "flooding", "baha", "drainage", "drain", "water"],
    reply:
      "Flooding and drainage issues are treated as **high-priority** concerns. Please file a report right away — include:\n• Exact location (street / landmark)\n• A photo if it's safe to take\n• How severe the flooding is\n\nGo to **File a Concern** to submit.",
  },
  {
    keywords: ["garbage", "trash", "basura", "waste", "litter", "uncollected"],
    reply:
      "Uncollected garbage or improper waste disposal falls under the **Sanitation** category. Filing it routes the concern to the right team immediately.\n\nGo to **File a Concern** to submit.",
  },
  {
    keywords: ["noise", "ingay", "loud", "disturb", "neighbor"],
    reply:
      "Noise complaints are handled under **Noise Complaint**. When filing, include:\n• The time the disturbance occurs\n• Exact address or nearby landmark\n• Any evidence (photo / video if applicable)",
  },
  {
    keywords: [
      "road",
      "pothole",
      "street",
      "daan",
      "sidewalk",
      "pavement",
      "crack",
    ],
    reply:
      "Road damage and infrastructure issues fall under **Road Maintenance**. Include the street name and a photo to help the barangay prioritize repairs faster.",
  },
  {
    keywords: ["resolved", "fixed", "done", "tapos", "closed"],
    reply:
      "Once your concern has been addressed, it should be marked **Resolved** on your **My Reports** page. The assigned admin confirms this when the issue is fully handled.",
  },
  {
    keywords: [
      "ai",
      "automatic",
      "classify",
      "smart",
      "alalai",
      "how does it work",
    ],
    reply:
      "AlalAI uses **smart auto-classification** to tag, prioritize, and route every concern automatically — no manual sorting needed.\n\nYour concern goes directly to the right admin the moment you submit it!",
  },
  {
    keywords: [
      "photo",
      "image",
      "picture",
      "video",
      "media",
      "attach",
      "upload",
    ],
    reply:
      "When filing a concern, you can attach photos or videos as supporting evidence. This helps admins assess the situation much faster.\n\nSupported formats: JPG, PNG, MP4.",
  },
  {
    keywords: ["help", "what can", "how", "guide", "tutorial"],
    reply:
      "Here's what I can help you with:\n\n📋 **File a Concern** — report any barangay issue\n📍 **Barangay Map** — see active reports near you\n🔄 **Check Status** — track your report progress\n🤖 **AI Features** — learn how auto-classification works\n\nJust ask away!",
  },
];

const QUICK_REPLIES = [
  "How do I file a concern?",
  "Check my report status",
  "What is the barangay map?",
  "How does AI classification work?",
];

function getBotReply(input: string): string {
  const lower = input.toLowerCase();
  for (const entry of BOT_RESPONSES) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.reply;
    }
  }
  return "I'm not sure about that specific topic, but I'm here to help with anything on the barangay portal — filing concerns, checking reports, or navigating the map. Could you rephrase or try a different question?";
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });
}

function renderText(text: string) {
  return text.split("\n").flatMap((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const rendered = parts.map((part, j) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={j}>{part.slice(2, -2)}</strong>
      ) : (
        <span key={j}>{part}</span>
      ),
    );
    return i === 0 ? rendered : [<br key={`br-${i}`} />, ...rendered];
  });
}

const INITIAL_MESSAGE: Message = {
  id: 0,
  role: "bot",
  text: "Hi there! 👋 I'm the **AlalAI Assistant** — your smart barangay helper.\n\nI can guide you on filing concerns, checking report statuses, using the map, and more. What can I help you with today?",
  timestamp: new Date(),
};

// ─── Sub-components ────────────────────────────────────────────────────────────

function BotAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-linear-to-br from-accent to-violet-600 flex items-center justify-center shrink-0 shadow-sm shadow-accent/30">
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    </div>
  );
}

function UserAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-muted border border-border/60 flex items-center justify-center shrink-0 text-[11px] font-extrabold text-muted-foreground">
      JD
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <BotAvatar />
      <div className="bg-card border border-border/60 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5 shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div
      className={`flex items-end gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {isUser ? <UserAvatar /> : <BotAvatar />}
      <div
        className={`flex flex-col gap-1 max-w-[78%] sm:max-w-[65%] ${isUser ? "items-end" : "items-start"}`}
      >
        <div
          className={`px-4 py-3 text-sm leading-relaxed shadow-sm ${
            isUser
              ? "bg-accent text-white rounded-2xl rounded-br-sm"
              : "bg-card border border-border/60 text-foreground rounded-2xl rounded-bl-sm"
          }`}
        >
          {renderText(msg.text)}
        </div>
        <span className="text-[10px] text-muted-foreground px-1">
          {formatTime(msg.timestamp)}
        </span>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CitizenChatPage() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const nextId = useRef(1);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 128) + "px";
  }

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMsg: Message = {
      id: nextId.current++,
      role: "user",
      text: trimmed,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    setIsTyping(true);
    const delay = 750 + Math.random() * 650;
    setTimeout(() => {
      const botMsg: Message = {
        id: nextId.current++,
        role: "bot",
        text: getBotReply(trimmed),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, delay);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  const showQuickReplies = messages.length <= 1 && !isTyping;

  return (
    <div className="flex flex-col min-h-full">
      {/* ── Chat header ──────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-card/90 backdrop-blur-sm border-b border-border/60 px-5 md:px-8 py-4 shrink-0">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-accent to-violet-600 flex items-center justify-center shadow-md shadow-accent/25 shrink-0">
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-extrabold text-base tracking-tight leading-none">
                  AlalAI Assistant
                </h1>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full leading-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                AI-powered barangay assistant
              </p>
            </div>
          </div>
          {/* Clear chat */}
          <button
            onClick={() => {
              setMessages([{ ...INITIAL_MESSAGE, timestamp: new Date() }]);
              setInput("");
              setIsTyping(false);
              nextId.current = 1;
            }}
            className="text-[11px] font-semibold text-muted-foreground hover:text-foreground border border-border/60 hover:border-border px-3 py-1.5 rounded-xl transition-all hover:bg-muted/40"
          >
            Clear
          </button>
        </div>
      </div>

      {/* ── Messages ─────────────────────────────────────────────────────── */}
      <div className="flex-1 px-4 md:px-8 py-5 space-y-4 max-w-3xl mx-auto w-full">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Quick replies ─────────────────────────────────────────────────── */}
      {showQuickReplies && (
        <div className="px-4 md:px-8 pb-3 max-w-3xl mx-auto w-full">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
            Quick questions
          </p>
          <div className="flex flex-wrap gap-2">
            {QUICK_REPLIES.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="text-xs px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent font-semibold hover:bg-accent/20 active:scale-95 transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input bar ────────────────────────────────────────────────────── */}
      <div className="sticky bottom-0 z-10 border-t border-border/60 bg-background/90 backdrop-blur-sm px-4 md:px-8 pt-3 pb-5 md:pb-4 shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-3 bg-card border border-border/60 rounded-2xl px-4 py-3 shadow-sm focus-within:border-accent/50 focus-within:shadow-[0_0_0_3px_rgba(var(--accent)/0.1)] transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                autoResize(e.target);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your barangay concerns…"
              rows={1}
              className="flex-1 bg-transparent text-sm resize-none outline-none placeholder:text-muted-foreground/50 leading-relaxed"
              style={{ scrollbarWidth: "none", maxHeight: "128px" }}
              disabled={isTyping}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || isTyping}
              className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shrink-0 transition-all hover:bg-accent/90 active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed shadow-sm shadow-accent/20"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground/50 text-center mt-2 select-none">
            <kbd className="font-mono bg-muted/60 border border-border/60 px-1.5 py-0.5 rounded text-[9px]">
              Enter
            </kbd>{" "}
            to send ·{" "}
            <kbd className="font-mono bg-muted/60 border border-border/60 px-1.5 py-0.5 rounded text-[9px]">
              Shift + Enter
            </kbd>{" "}
            for new line
          </p>
        </div>
      </div>
    </div>
  );
}
