"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { soundFx } from "@/util/sound";
import { fireConfetti } from "@/util/confetti";
import {
  LuTerminal,
  LuX,
  LuGraduationCap,
  LuMountainSnow,
  LuSparkles,
  LuPartyPopper,
  LuMail,
  LuArrowRight,
  LuCopy,
  LuCheck,
} from "react-icons/lu";

type LayerId = "story" | "hobbies" | "philosophy" | "funfact" | "sayhi";

interface LogEntry {
  id: number;
  command: string;
  response: string;
}

const PROMPTS: { id: LayerId; label: string; keywords: string[] }[] = [
  { id: "story", label: "My Story", keywords: ["story", "my story", "journey"] },
  { id: "hobbies", label: "Hobbies", keywords: ["hobbies", "hobby"] },
  { id: "philosophy", label: "Philosophy", keywords: ["philosophy", "motto"] },
  { id: "funfact", label: "Fun Fact", keywords: ["fun fact", "funfact", "fact"] },
  { id: "sayhi", label: "Say Hi", keywords: ["say hi", "hi", "hire", "contact"] },
];

const FALLBACK_RESPONSE =
  "Not sure about that one — try Story, Hobbies, Philosophy, Fun Fact, or Say Hi.";

let logIdCounter = 1;

function TypedLine({ text }: { text: string }) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    setShown("");
    let i = 0;
    const speed = Math.max(8, Math.min(18, 900 / text.length));
    const interval = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const done = shown.length >= text.length;

  return (
    <p className="text-xs sm:text-sm text-zinc-300 font-rubik leading-relaxed">
      {shown}
      {!done && <span className="animate-pulse text-emerald-400">|</span>}
    </p>
  );
}

function jumpTo(id: string) {
  const el = document.getElementById(id);
  if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 250);
}

// -----------------------------------------------------------------
// Per-topic layer content — each one gets its own small moment rather
// than a generic text block, so opening a layer feels like a payoff.
// -----------------------------------------------------------------

function StoryLayer() {
  const milestones = [
    { year: "2022", label: "Started BS Computer Science", detail: "University of the Philippines Los Baños" },
    { year: "2025", label: "Software Engineer Intern", detail: "Limitless Lab — shipped React & Next.js features on an agile team" },
    { year: "2026", label: "Graduated, Iskolar ng Bayan", detail: "BS Computer Science, 1.95 GWA" },
    { year: "2026", label: "QA Analyst", detail: "Vertere Global Solutions Inc. — still building on the side" },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-2.5">
        {milestones.map((m, i) => (
          <motion.div
            key={m.year + m.label}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i, duration: 0.3 }}
            className="flex items-start gap-3"
          >
            <span className="mt-0.5 shrink-0 px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
              {m.year}
            </span>
            <div>
              <div className="text-sm font-rubik font-semibold text-white">{m.label}</div>
              <div className="text-xs text-zinc-400 font-rubik">{m.detail}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function HobbiesLayer({ onClose }: { onClose: () => void }) {
  const trails = ["Mt. Pulag", "Mt. Apo", "Mt. Ulap", "Mt. Batulao"];

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-300 font-rubik leading-relaxed">
        I climb mountains around the Philippines with a small group of friends. Planning those
        trips got annoying enough that I built an app for it.
      </p>

      <div className="flex flex-wrap gap-2">
        {trails.map((t, i) => (
          <motion.span
            key={t}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.08 * i, type: "spring", stiffness: 400, damping: 18 }}
            className="px-3 py-1 rounded-full bg-amber-950/50 text-amber-300 border border-amber-500/30 text-xs font-mono"
          >
            {t}
          </motion.span>
        ))}
      </div>

      <motion.button
        onClick={() => {
          soundFx.playClick(900);
          onClose();
          jumpTo("projects");
        }}
        whileHover={{ x: 3 }}
        className="flex items-center gap-1.5 text-xs font-mono text-amber-400 hover:text-amber-300 cursor-pointer"
      >
        <span>See the app I built for this (Tropa)</span>
        <LuArrowRight className="w-3.5 h-3.5" />
      </motion.button>
    </div>
  );
}

function PhilosophyLayer({ onClose }: { onClose: () => void }) {
  const principles = ["Quality & Reliability", "Clean Architecture", "Execution & Ownership", "Engineering Rigor"];

  return (
    <div className="space-y-4">
      <p className="text-base sm:text-lg font-rubik font-semibold text-white leading-snug">
        &ldquo;I&apos;d rather ship something small that works than something big that mostly
        works.&rdquo;
      </p>
      <p className="text-xs sm:text-sm text-zinc-400 font-rubik leading-relaxed">
        Quality isn&apos;t a phase at the end — it&apos;s a habit, whether I&apos;m testing someone
        else&apos;s code or writing my own.
      </p>

      <div className="flex flex-wrap gap-1.5">
        {principles.map((p, i) => (
          <motion.span
            key={p}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 * i }}
            className="px-2.5 py-1 rounded-lg bg-cyan-950/50 text-cyan-300 border border-cyan-500/30 text-[11px] font-mono"
          >
            {p}
          </motion.span>
        ))}
      </div>

      <motion.button
        onClick={() => {
          soundFx.playClick(900);
          onClose();
          jumpTo("why-work-with-me");
        }}
        whileHover={{ x: 3 }}
        className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 cursor-pointer"
      >
        <span>Read the full breakdown</span>
        <LuArrowRight className="w-3.5 h-3.5" />
      </motion.button>
    </div>
  );
}

function FunFactLayer() {
  useEffect(() => {
    soundFx.playSuccess();
    fireConfetti();
  }, []);

  return (
    <div className="space-y-3">
      <motion.div
        animate={{ rotate: [0, -8, 8, -8, 0] }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="text-4xl w-fit"
      >
        🎉
      </motion.div>
      <p className="text-sm sm:text-base text-zinc-200 font-rubik leading-relaxed">
        This whole site has a working terminal, a command palette, and sound effects I
        synthesized myself — nobody asked for that, I just wanted to see if I could.
      </p>
    </div>
  );
}

function SayHiLayer({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-300 font-rubik leading-relaxed">
        Always happy to talk shop or just chat. Say hi below, or jump straight to the contact
        form.
      </p>

      <div className="flex flex-wrap gap-2">
        <motion.button
          onClick={() => {
            soundFx.playSuccess();
            navigator.clipboard.writeText("jlrneverida@gmail.com");
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          className="px-4 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/[0.1] text-xs font-mono flex items-center gap-1.5 cursor-pointer"
        >
          {copied ? <LuCheck className="w-3.5 h-3.5 text-emerald-400" /> : <LuCopy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied!" : "Copy Email"}</span>
        </motion.button>

        <motion.button
          onClick={() => {
            soundFx.playClick(900);
            onClose();
            jumpTo("contact");
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          className="px-4 py-2 rounded-full bg-white text-zinc-950 text-xs font-rubik font-medium flex items-center gap-1.5 cursor-pointer"
        >
          <span>Jump to Contact</span>
          <LuArrowRight className="w-3.5 h-3.5" />
        </motion.button>
      </div>
    </div>
  );
}

const LAYER_META: Record<
  LayerId,
  { eyebrow: string; title: string; icon: React.ReactNode; accent: string }
> = {
  story: { eyebrow: "MY STORY", title: "From UPLB to QA", icon: <LuGraduationCap className="w-5 h-5" />, accent: "emerald" },
  hobbies: { eyebrow: "HOBBIES", title: "Chasing Summits", icon: <LuMountainSnow className="w-5 h-5" />, accent: "amber" },
  philosophy: { eyebrow: "PHILOSOPHY", title: "Why Quality Matters", icon: <LuSparkles className="w-5 h-5" />, accent: "cyan" },
  funfact: { eyebrow: "FUN FACT", title: "Just Because", icon: <LuPartyPopper className="w-5 h-5" />, accent: "fuchsia" },
  sayhi: { eyebrow: "LET'S TALK", title: "Say Hi", icon: <LuMail className="w-5 h-5" />, accent: "emerald" },
};

const ACCENT_CLASSES: Record<string, { text: string; border: string; iconBg: string }> = {
  emerald: { text: "text-emerald-400", border: "border-emerald-500/30", iconBg: "bg-emerald-950/60" },
  amber: { text: "text-amber-400", border: "border-amber-500/30", iconBg: "bg-amber-950/60" },
  cyan: { text: "text-cyan-400", border: "border-cyan-500/30", iconBg: "bg-cyan-950/60" },
  fuchsia: { text: "text-fuchsia-400", border: "border-fuchsia-500/30", iconBg: "bg-fuchsia-950/60" },
};

export default function TechnicalExpertiseSection() {
  const [log, setLog] = useState<LogEntry[]>([
    {
      id: 0,
      command: "help",
      response: "Hi, I'm Jake. Try one of the buttons below, or type your own question.",
    },
  ]);
  const [input, setInput] = useState("");
  const [activeLayer, setActiveLayer] = useState<LayerId | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [log]);

  useEffect(() => {
    if (!activeLayer) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveLayer(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeLayer]);

  const openLayer = useCallback((id: LayerId, command: string) => {
    soundFx.playClick(950);
    logIdCounter += 1;
    setLog((prev) => [...prev, { id: logIdCounter, command, response: `Opening ${LAYER_META[id].title}...` }]);
    setInput("");
    setActiveLayer(id);
  }, []);

  const runCommand = useCallback(
    (command: string) => {
      const normalized = command.trim().toLowerCase();
      if (!normalized) return;

      if (normalized === "clear") {
        soundFx.playKey();
        setLog([]);
        setInput("");
        return;
      }

      const match = PROMPTS.find((p) => p.keywords.some((k) => normalized === k || normalized.includes(k)));
      if (match) {
        openLayer(match.id, command);
        return;
      }

      soundFx.playKey();
      logIdCounter += 1;
      setLog((prev) => [...prev, { id: logIdCounter, command, response: FALLBACK_RESPONSE }]);
      setInput("");
    },
    [openLayer]
  );

  const closeLayer = useCallback(() => setActiveLayer(null), []);

  return (
    <section id="skills" className="reveal-item px-4 sm:px-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-6 pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-bold font-rubik text-zinc-100 tracking-tight">
            Beyond the Resume
          </h2>
        </div>
        <span className="text-xs font-mono text-zinc-500">Ask Me Anything</span>
      </div>

      <div className="glass-panel rounded-3xl border border-white/[0.1] shadow-2xl bg-[#08080a]/90 overflow-hidden">
        {/* Terminal Header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-zinc-950/80 border-b border-white/[0.06]">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          <LuTerminal className="w-3.5 h-3.5 text-emerald-400 ml-1" />
          <span className="text-xs text-zinc-400 font-mono">jake &bull; get-to-know-me</span>
        </div>

        {/* Quick Prompts */}
        <div className="flex flex-wrap items-center gap-1.5 px-4 pt-3.5">
          {PROMPTS.map((p) => (
            <motion.button
              key={p.id}
              onClick={() => openLayer(p.id, p.label.toLowerCase())}
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 500, damping: 22 }}
              className="px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white border border-white/[0.08] text-xs font-mono cursor-pointer"
            >
              {p.label}
            </motion.button>
          ))}
        </div>

        {/* Response Log */}
        <div className="px-4 py-4 space-y-4 max-h-[280px] overflow-y-auto scrollbar-hide">
          {log.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-1"
            >
              <div className="text-xs font-mono text-zinc-500">
                <span className="text-emerald-400">&gt;</span> {entry.command}
              </div>
              <div className="pl-3">
                <TypedLine text={entry.response} />
              </div>
            </motion.div>
          ))}
          <div ref={logEndRef} />
        </div>

        {/* Free-Type Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            runCommand(input);
          }}
          className="flex items-center gap-2 px-4 py-3 border-t border-white/[0.06] bg-zinc-950/40"
        >
          <span className="text-emerald-400 font-mono text-sm">&gt;</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ask me anything, or try a button above..."
            className="w-full bg-transparent text-white text-xs sm:text-sm outline-none font-mono caret-white placeholder-zinc-600"
          />
        </form>
      </div>

      {/* Full Topic Layer */}
      <AnimatePresence>
        {activeLayer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeLayer}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 8 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg glass-panel rounded-3xl border border-white/[0.12] shadow-2xl bg-gradient-to-br from-zinc-900/95 via-zinc-900/70 to-zinc-950/95 p-6 sm:p-8"
            >
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-2xl border shrink-0 ${ACCENT_CLASSES[LAYER_META[activeLayer].accent].iconBg} ${ACCENT_CLASSES[LAYER_META[activeLayer].accent].border} ${ACCENT_CLASSES[LAYER_META[activeLayer].accent].text}`}
                  >
                    {LAYER_META[activeLayer].icon}
                  </div>
                  <div>
                    <span className={`text-[10px] font-mono uppercase tracking-wider block ${ACCENT_CLASSES[LAYER_META[activeLayer].accent].text}`}>
                      {LAYER_META[activeLayer].eyebrow}
                    </span>
                    <h3 className="font-rubik font-bold text-lg sm:text-xl text-white">
                      {LAYER_META[activeLayer].title}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={closeLayer}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                >
                  <LuX className="w-4 h-4" />
                </button>
              </div>

              {activeLayer === "story" && <StoryLayer />}
              {activeLayer === "hobbies" && <HobbiesLayer onClose={closeLayer} />}
              {activeLayer === "philosophy" && <PhilosophyLayer onClose={closeLayer} />}
              {activeLayer === "funfact" && <FunFactLayer />}
              {activeLayer === "sayhi" && <SayHiLayer onClose={closeLayer} />}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
