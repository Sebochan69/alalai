"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";

//  Types

type MessageRole = "user" | "bot";

interface Message {
  id: number;
  role: MessageRole;
  text: string;
  timestamp: Date;
}

//  Knowledge base (static barangay info  no RAG needed)

const BOT_RESPONSES: { keywords: string[]; reply: string }[] = [
  // Greetings
  {
    keywords: [
      "hello",
      "hi",
      "hey",
      "kumusta",
      "good morning",
      "good afternoon",
      "good evening",
      "mabuhay",
      "oi",
      "hoy",
    ],
    reply:
      "Mabuhay! I'm **Lingkod AI** - your barangay information assistant.\n\nI can help you with:\n-  Emergency hotlines\n-  Evacuation centers\n-  Barangay reminders & schedules\n-  General barangay info\n\nWhat do you need today?",
  },

  // Emergency hotlines
  {
    keywords: [
      "hotline",
      "number",
      "call",
      "contact",
      "emergency",
      "help",
      "tanawagan",
      "tawag",
    ],
    reply:
      " **Emergency Hotlines  Barangay San Isidro**\n\n **Barangay Hall**  (02) 8123-4567\n **PNP Emergency**  911 / 117\n **Bureau of Fire (BFP)**  911\n **Red Cross**  143\n **NDRRMC**  911 / (02) 8911-1406\n\nFor non-emergency barangay concerns, you can also visit the hall during office hours: **MonFri, 8AM5PM**.",
  },

  // Police
  {
    keywords: [
      "police",
      "pnp",
      "pulis",
      "crime",
      "robbery",
      "theft",
      "snatching",
      "hold-up",
      "holdap",
    ],
    reply:
      " **PNP Emergency Hotline:** 911 or 117\n\nFor your nearest police station:\n- **Brgy San Isidro Police Post**  (02) 8123-9999\n- **Station Commander**  (02) 8124-0001\n\nIf you are in immediate danger, call **911** right away. Do not delay.",
  },

  // Fire
  {
    keywords: ["fire", "sunog", "apoy", "bfp", "nasusunog", "burning"],
    reply:
      " **Fire Emergency  Bureau of Fire Protection (BFP)**\n\nHotline: **911**\nLocal BFP Station: **(02) 8456-7890**\n\n**What to do:**\n1. Evacuate the building immediately\n2. Call 911\n3. Do not use elevators\n4. Close doors behind you to slow the fire\n5. Meet at your pre-agreed evacuation point",
  },

  // Medical / ambulance
  {
    keywords: [
      "ambulance",
      "hospital",
      "medical",
      "doctor",
      "ospital",
      "sick",
      "sakit",
      "injury",
      "sugat",
      "injured",
    ],
    reply:
      " **Medical Emergency Contacts**\n\n **Ambulance**  911\n **Ospital ng Maynila**  (02) 8524-6061\n **Philippine General Hospital**  (02) 8554-8400\n **Barangay Health Center**  (02) 8123-5678\n\nHealth center hours: **MonFri, 8AM5PM**\nFor after-hours emergencies, go directly to the nearest hospital.",
  },

  // Evacuation centers
  {
    keywords: [
      "evacuation",
      "evacuate",
      "evacuation center",
      "shelter",
      "likas",
      "ligtas",
      "lugar",
      "typhoon",
      "bagyo",
      "disaster",
      "baha shelter",
    ],
    reply:
      " **Evacuation Centers  Barangay San Isidro**\n\n **San Isidro Elementary School**\nCapacity: ~500 families\nContact: (02) 8123-6789\n\n **Barangay Multi-Purpose Hall**\nCapacity: ~200 families\nContact: (02) 8123-4567\n\n **San Isidro Community Center**\nCapacity: ~300 families\nContact: (02) 8123-7890\n\nEarly evacuation is always better. Don't wait for the last minute! ",
  },

  // Flood
  {
    keywords: [
      "flood",
      "baha",
      "flooding",
      "tubig",
      "overflow",
      "drainage",
      "ulan",
    ],
    reply:
      " **Flooding Advisory**\n\n**Before flooding:**\n- Prepare a go-bag (documents, medicines, water, food)\n- Know your nearest evacuation center\n- Unplug appliances\n\n**Nearest evacuation:** San Isidro Elementary School\n\n**Emergency contacts:**\n- Barangay Hall: (02) 8123-4567\n- NDRRMC: 911 / (02) 8911-1406\n\nMonitor alerts via **PAGASA**: bagong.pagasa.dost.gov.ph",
  },

  // Typhoon
  {
    keywords: [
      "typhoon",
      "bagyo",
      "signal",
      "storm",
      "warning",
      "habagat",
      "lindol",
      "earthquake",
    ],
    reply:
      " **Typhoon / Disaster Preparedness**\n\n**Go-bag essentials:**\n- Valid IDs & documents (in waterproof bag)\n- 3-day water & food supply\n- First aid kit & medicines\n- Flashlight & extra batteries\n- Cash\n\n**During a typhoon:**\n- Stay indoors, away from windows\n- Avoid flooded roads\n- Monitor PAGASA & local announcements\n\n**PAGASA weather updates:** bagong.pagasa.dost.gov.ph\n**NDRRMC hotline:** 911",
  },

  // Waste / garbage schedule
  {
    keywords: [
      "garbage",
      "trash",
      "basura",
      "waste",
      "collection",
      "schedule",
      "linis",
      "pick up",
      "pickup",
      "segregation",
    ],
    reply:
      " **Garbage Collection Schedule  Brgy San Isidro**\n\n **Biodegradable (green bin)**\nMonday & Thursday  6AM to 9AM\n\n **Non-biodegradable (black bin)**\nTuesday & Friday  6AM to 9AM\n\n **Recyclables (blue bin)**\nWednesday  6AM to 9AM\n\n Proper segregation is required by ordinance. Unsegregated waste may not be collected.",
  },

  // Curfew
  {
    keywords: [
      "curfew",
      "minor",
      "bata",
      "gabi",
      "night",
      "ordinance",
      "rule",
      "alituntunin",
    ],
    reply:
      " **Barangay Curfew Ordinance**\n\n **Minors (below 18)** are not allowed in public places without a parent or guardian from:\n- **10PM to 5AM** daily\n\nViolators may be brought to the Barangay Hall for proper assistance.\n\nFor questions, contact the Barangay Hall: **(02) 8123-4567**",
  },

  // Business permit / cedula
  {
    keywords: [
      "permit",
      "cedula",
      "clearance",
      "barangay clearance",
      "business",
      "negosyo",
      "registration",
      "id",
      "certificate",
    ],
    reply:
      " **Barangay Documents & Services**\n\n **Barangay Clearance**  50\n **Certificate of Residency**  50\n **Business Permit**  varies\n **Cedula (Community Tax Certificate)**  based on income\n\n Process at: **Barangay Hall, San Isidro**\n Office hours: **MonFri, 8AM5PM**\n Contact: **(02) 8123-4567**\n\nBring a valid ID when applying.",
  },

  // Office hours
  {
    keywords: [
      "office",
      "hours",
      "oras",
      "open",
      "bukas",
      "close",
      "sarado",
      "schedule",
      "visit",
      "pumunta",
    ],
    reply:
      " **Barangay Hall  Office Hours**\n\n **Monday to Friday:** 8:00 AM  5:00 PM\n **Saturday:** 8:00 AM  12:00 PM (noon)\n **Sunday & Holidays:** Closed\n\n Address: San Isidro Barangay Hall, [Street Name], Manila\n Hotline: **(02) 8123-4567**",
  },

  // VAWC / abuse
  {
    keywords: [
      "violence",
      "abuse",
      "vawc",
      "abuso",
      "domestic",
      "battered",
      "harassed",
      "harassment",
      "rape",
      "molest",
    ],
    reply:
      " **Violence Against Women & Children (VAWC)**\n\nYou are not alone. Help is available.\n\n **Barangay VAWC Desk**  (02) 8123-4567 ext. 3\n **PNP Women & Children Protection**  (02) 8723-0401\n **DSWD Crisis Hotline**  931 / 1800-888-7377\n **DOJ Action Center**  8523-8481\n\nAll reports are **strictly confidential**. Please seek help immediately.",
  },

  // Senior / PWD
  {
    keywords: [
      "senior",
      "elderly",
      "matanda",
      "lolo",
      "lola",
      "pwd",
      "disabled",
      "disability",
      "benefits",
      "discount",
    ],
    reply:
      " **Senior Citizen & PWD Services**\n\n**Senior Citizen benefits:**\n- 20% discount on medicines, food, transport\n- Free medical check-ups at Barangay Health Center\n- Monthly social pension (DSWD)\n\n**PWD benefits:**\n- 20% discount on select goods & services\n- Priority lanes in all government offices\n\n Register at: **Barangay Hall** (MonFri, 8AM5PM)\n OSCA Hotline: **(02) 8123-4568**",
  },

  // Help / what can you do
  {
    keywords: [
      "help",
      "what can",
      "ano kaya",
      "anong",
      "guide",
      "list",
      "topics",
      "about",
    ],
    reply:
      "Here's everything I can help you with:\n\n **Hotlines**  emergency, police, fire, medical\n **Evacuation Centers**  locations & capacity\n **Typhoon & Flood**  advisories & go-bag tips\n **Garbage Schedule**  collection days\n **Curfew**  barangay ordinance\n **Documents**  clearance, cedula, permits\n **Office Hours**  barangay hall schedule\n **VAWC / Abuse**  confidential help lines\n **Senior / PWD**  benefits & services\n\nJust type your question!",
  },
];

const QUICK_REPLIES = [
  "Emergency hotlines",
  "Evacuation centers",
  "Garbage schedule",
  "Barangay documents",
];

function getBotReply(input: string): string {
  const lower = input.toLowerCase();
  for (const entry of BOT_RESPONSES) {
    if (entry.keywords.some((kw) => lower.includes(kw))) return entry.reply;
  }
  return 'Sorry, I don\'t have information on that specific topic yet. For other concerns, please contact the **Barangay Hall** directly:\n\n **(02) 8123-4567**\n MonFri, 8AM5PM\n\nOr type **"help"** to see what I can assist with.';
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });
}

function renderText(text: string) {
  return text.split("\n").flatMap((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const rendered = parts.map((part, j) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={`${i}-${j}`}>{part.slice(2, -2)}</strong>
      ) : (
        <span key={`${i}-${j}`}>{part}</span>
      ),
    );
    return i === 0 ? rendered : [<br key={`br-${i}`} />, ...rendered];
  });
}

//  Brgy Tanod badge icon

function TanodIcon({
  size = 18,
  color = "white",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2L4 5v6c0 5.25 3.5 10.15 8 11.35C16.5 21.15 20 16.25 20 11V5L12 2z" />
      <polygon
        points="12,7 13.15,10.3 16.5,10.3 13.85,12.3 14.8,15.6 12,13.6 9.2,15.6 10.15,12.3 7.5,10.3 10.85,10.3"
        strokeWidth="1"
        fill={color}
        stroke="none"
      />
    </svg>
  );
}

//  Avatars

function BotAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-600 to-accent flex items-center justify-center shrink-0 shadow-sm shadow-accent/30">
      <TanodIcon size={14} color="white" />
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
      <div className="bg-muted/60 border border-border/50 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
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
      className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {isUser ? <UserAvatar /> : <BotAvatar />}
      <div
        className={`flex flex-col gap-1 max-w-[72%] ${isUser ? "items-end" : "items-start"}`}
      >
        <div
          className={`px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm ${isUser ? "bg-accent text-white rounded-2xl rounded-br-sm" : "bg-muted dark:bg-slate-700/90 border border-border dark:border-slate-600 text-foreground dark:text-white rounded-2xl rounded-bl-sm"}`}
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

const INITIAL_MESSAGE: Message = {
  id: 0,
  role: "bot",
  text: "Mabuhay! I'm **Lingkod AI** - your barangay information assistant.\n\nI can answer questions about hotlines, evacuation centers, schedules, and barangay services. How can I help?",
  timestamp: new Date(),
};

//  Main floating widget

export default function CitizenChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const nextId = useRef(1);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setHasUnread(false);
    }
  }, [messages, isTyping, open]);

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 96) + "px";
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
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    setIsTyping(true);
    const delay = 600 + Math.random() * 500;
    setTimeout(() => {
      const botMsg: Message = {
        id: nextId.current++,
        role: "bot",
        text: getBotReply(trimmed),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
      if (!open) setHasUnread(true);
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
    <>
      {/*  Chat window  */}
      <div
        className={`fixed bottom-24 right-4 md:bottom-8 md:right-10 z-50 w-[calc(100vw-2rem)] max-w-sm transition-all duration-300 origin-bottom-right ${open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-90 pointer-events-none"}`}
        style={{ willChange: "transform, opacity" }}
      >
        <div className="flex flex-col bg-card border border-border/70 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden h-130">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 bg-linear-to-r from-blue-700 to-accent shrink-0">
            <div className="w-9 h-9 rounded-full bg-white/15 border border-white/25 flex items-center justify-center shrink-0 shadow-sm">
              <TanodIcon size={17} color="white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-extrabold text-white leading-none tracking-tight">
                  Lingkod AI
                </p>
                <span className="flex items-center gap-1 text-[10px] font-bold text-white/90 bg-white/15 border border-white/20 px-1.5 py-0.5 rounded-full leading-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  Online
                </span>
              </div>
              <p className="text-[11px] text-white/70 mt-0.5">
                AlalAI Barangay Assistant
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {/* Clear */}
              <button
                onClick={() => {
                  setMessages([{ ...INITIAL_MESSAGE, timestamp: new Date() }]);
                  setInput("");
                  setIsTyping(false);
                  nextId.current = 1;
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white hover:bg-white/25 transition-all cursor-pointer"
                title="Clear chat"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4h6v2" />
                </svg>
              </button>
              {/* Close */}
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white hover:bg-white/25 transition-all cursor-pointer"
                title="Close"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto pl-3 pr-2 py-3 space-y-3.5"
            style={{ scrollbarWidth: "thin" }}
          >
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies */}
          {showQuickReplies && (
            <div className="px-4 pt-1 pb-2 shrink-0">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                Quick questions
              </p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_REPLIES.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="text-[11px] px-3 py-1.5 rounded-full bg-accent/10 border border-accent/25 text-accent font-semibold hover:bg-accent/20 active:scale-95 transition-all cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-3 pb-3 pt-1 shrink-0 border-t border-border/50">
            <div className="flex items-center gap-2 bg-background dark:bg-slate-900 border border-border dark:border-slate-600 rounded-xl px-3 py-2.5 focus-within:border-accent transition-all">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  autoResize(e.target);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask about hotlines, evacuation, schedules"
                rows={1}
                disabled={isTyping}
                className="flex-1 bg-transparent text-[13px] text-foreground dark:text-white resize-none outline-none placeholder:text-muted-foreground/60 dark:placeholder:text-slate-400 leading-relaxed"
                style={{ scrollbarWidth: "none", maxHeight: "96px" }}
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || isTyping}
                className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0 transition-all hover:bg-accent/90 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-sm shadow-accent/20"
              >
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
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            <p className="text-[9px] text-muted-foreground/40 text-center mt-1.5 select-none">
              Enter to send Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>

      {/*  Floating trigger button  always shows shield, never X  */}
      <button
        onClick={() => {
          setOpen((v) => !v);
          setHasUnread(false);
        }}
        className={`fixed bottom-20 right-4 md:bottom-6 md:right-10 z-50 group cursor-pointer transition-all duration-200 ${open ? "opacity-0 scale-75 pointer-events-none" : "opacity-100 scale-100"}`}
        aria-label="Open Lingkod AI chat"
      >
        <span className="absolute inset-0 rounded-full bg-accent/30 blur-md group-hover:bg-accent/50 transition-all duration-300 pointer-events-none" />
        <span className="relative flex items-center justify-center w-14 h-14 rounded-full bg-linear-to-br from-blue-600 to-accent shadow-xl shadow-accent/35 border-2 border-white/20 transition-all duration-200 group-hover:scale-105 group-active:scale-95">
          <TanodIcon size={22} color="white" />
        </span>
        {/* Unread badge */}
        {hasUnread && !open && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 border-2 border-background flex items-center justify-center">
            <span className="text-[8px] font-black text-white leading-none">
              !
            </span>
          </span>
        )}
        {/* Pulse ring when closed */}
        {!open && (
          <span
            className="absolute inset-0 rounded-full border-2 border-accent/50 animate-ping pointer-events-none"
            style={{ animationDuration: "2.5s" }}
          />
        )}
      </button>
    </>
  );
}
