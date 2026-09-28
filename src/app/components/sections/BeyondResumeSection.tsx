"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { soundFx } from "@/util/sound";
import { fireConfetti } from "@/util/confetti";
import { projects } from "@/content/projects";
import { copy } from "@/content/copy";
import Dual from "@/components/system/Dual";
import Sheet from "@/components/system/Sheet";
import {
  LuTerminal,
  LuGraduationCap,
  LuMountainSnow,
  LuSparkles,
  LuPartyPopper,
  LuMail,
  LuArrowRight,
  LuCopy,
  LuCheck,
  LuCircleHelp,
  LuCompass,
} from "react-icons/lu";

type LayerId = "story" | "hobbies" | "philosophy" | "funfact" | "sayhi" | "whyqa" | "whatsnext";

interface LogEntry {
  id: number;
  command: string;
  response: string;
}

const PROMPTS: { id: LayerId; label: string; keywords: string[] }[] = [
  { id: "story", label: "My Story", keywords: ["story", "my story", "journey"] },
  { id: "hobbies", label: "Hobbies", keywords: ["hobbies", "hobby"] },
  { id: "philosophy", label: "Philosophy", keywords: ["philosophy", "motto"] },
  { id: "whyqa", label: "Why QA?", keywords: ["why qa", "whyqa", "why quality", "qa"] },
  { id: "whatsnext", label: "What's next?", keywords: ["what's next", "whats next", "next"] },
  { id: "funfact", label: "Fun Fact", keywords: ["fun fact", "funfact", "fact"] },
  { id: "sayhi", label: "Say Hi", keywords: ["say hi", "hi", "hire", "contact"] },
];

const FALLBACK_RESPONSE =
  "Not sure about that one — try a button above, or press ⌘K for the full command palette.";

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
  }, [text]);

  const done = shown.length >= text.length;

  return (
    <p className="text-xs sm:text-sm text-ink-2 font-sans leading-relaxed">
      {shown}
      {!done && <span className="animate-pulse text-moss">|</span>}
    </p>
  );
}

function jumpTo(id: string) {
  const el = document.getElementById(id);
  if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 250);
}

// -----------------------------------------------------------------
// Per-topic layer content.
// -----------------------------------------------------------------

function StoryLayer() {
  const milestones = [
    { year: "2022", label: "Started BS Computer Science", detail: "University of the Philippines Los Baños" },
    { year: "2025", label: "Software Engineer Intern", detail: "Limitless Lab — shipped React & Next.js features on an agile team" },
    { year: "2026", label: "Graduated, Iskolar ng Bayan", detail: "BS Computer Science, 1.95 GWA" },
    { year: "2026", label: "QA Analyst", detail: "Vertere Global Solutions Inc. — still building on the side" },
  ];

  return (
    <div className="space-y-2.5">
      {milestones.map((m, i) => (
        <motion.div
          key={m.year + m.label}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 * i, duration: 0.3 }}
          className="flex items-start gap-3"
        >
          <span className="mt-0.5 shrink-0 px-2 py-0.5 rounded-full bg-raised text-ink-2 border border-line text-[10px] font-mono">
            {m.year}
          </span>
          <div>
            <div className="text-sm font-sans font-semibold text-ink">{m.label}</div>
            <div className="text-xs text-ink-2 font-sans">{m.detail}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function HobbiesLayer({ onClose }: { onClose: () => void }) {
  const trails = ["Mt. Pulag", "Mt. Apo", "Mt. Ulap", "Mt. Batulao"];
  const hasTropa = projects.some((p) => p.id === "tropa");

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-2 font-sans leading-relaxed">
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
            className="px-3 py-1 rounded-full bg-raised text-ink-2 border border-line text-xs font-mono"
          >
            {t}
          </motion.span>
        ))}
      </div>

      {hasTropa && (
        <motion.button
          onClick={() => {
            soundFx.playClick(900);
            onClose();
            jumpTo("work");
          }}
          whileHover={{ x: 3 }}
          className="flex items-center gap-1.5 text-xs font-mono text-alpine hover:underline cursor-pointer"
        >
          <span>See the app I built for this (Tropa)</span>
          <LuArrowRight className="w-3.5 h-3.5" />
        </motion.button>
      )}
    </div>
  );
}

function PhilosophyLayer({ onClose }: { onClose: () => void }) {
  const principles = ["Quality & Reliability", "Clean Architecture", "Execution & Ownership", "Engineering Rigor"];

  return (
    <div className="space-y-4">
      <p className="text-base sm:text-lg font-sans font-semibold text-ink leading-snug">
        &ldquo;I&apos;d rather ship something small that works than something big that mostly
        works.&rdquo;
      </p>
      <p className="text-xs sm:text-sm text-ink-2 font-sans leading-relaxed">
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
            className="px-2.5 py-1 rounded-lg bg-raised text-ink-2 border border-line text-[11px] font-mono"
          >
            {p}
          </motion.span>
        ))}
      </div>

      <motion.button
        onClick={() => {
          soundFx.playClick(900);
          onClose();
          jumpTo("approach");
        }}
        whileHover={{ x: 3 }}
        className="flex items-center gap-1.5 text-xs font-mono text-alpine hover:underline cursor-pointer"
      >
        <span>Read the full breakdown</span>
        <LuArrowRight className="w-3.5 h-3.5" />
      </motion.button>
    </div>
  );
}

function WhyQaLayer() {
  return <Dual value={copy.beyond.whyQa} className="text-sm sm:text-base text-ink-2 font-sans leading-relaxed" />;
}

function WhatsNextLayer() {
  return <Dual value={copy.beyond.whatsNext} className="text-sm sm:text-base text-ink-2 font-sans leading-relaxed" />;
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
      <p className="text-sm sm:text-base text-ink font-sans leading-relaxed">
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
      <p className="text-sm text-ink-2 font-sans leading-relaxed">
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
          className="px-4 py-2 rounded-full bg-raised hover:bg-void text-ink-2 border border-line text-xs font-mono flex items-center gap-1.5 cursor-pointer"
        >
          {copied ? <LuCheck className="w-3.5 h-3.5 text-moss" /> : <LuCopy className="w-3.5 h-3.5" />}
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
          className="px-4 py-2 rounded-full bg-summit text-void text-xs font-sans font-medium flex items-center gap-1.5 cursor-pointer"
        >
          <span>Jump to Contact</span>
          <LuArrowRight className="w-3.5 h-3.5" />
        </motion.button>
      </div>
    </div>
  );
}

const LAYER_META: Record<LayerId, { eyebrow: string; title: string; icon: React.ReactNode }> = {
  story: { eyebrow: "MY STORY", title: "From UPLB to QA", icon: <LuGraduationCap className="w-5 h-5" /> },
  hobbies: { eyebrow: "HOBBIES", title: "Chasing Summits", icon: <LuMountainSnow className="w-5 h-5" /> },
  philosophy: { eyebrow: "PHILOSOPHY", title: "Why Quality Matters", icon: <LuSparkles className="w-5 h-5" /> },
  whyqa: { eyebrow: "WHY QA?", title: "Why QA?", icon: <LuCircleHelp className="w-5 h-5" /> },
  whatsnext: { eyebrow: "LOOKING AHEAD", title: "What's Next?", icon: <LuCompass className="w-5 h-5" /> },
  funfact: { eyebrow: "FUN FACT", title: "Just Because", icon: <LuPartyPopper className="w-5 h-5" /> },
  sayhi: { eyebrow: "LET'S TALK", title: "Say Hi", icon: <LuMail className="w-5 h-5" /> },
};

export default function BeyondResumeSection() {
  const [log, setLog] = useState<LogEntry[]>([
    {
      id: 0,
      command: "help",
      response: "Hi, I'm Jake. Try one of the buttons below, or type your own question.",
    },
  ]);
  const [input, setInput] = useState("");
  const [activeLayer, setActiveLayer] = useState<LayerId | null>(null);
  // Bug fix: this used to be a scrollIntoView() on a sentinel below the log,
  // which fires on mount (the log starts non-empty) and drags the whole
  // page down to it. Scrolling the log's own container instead, and
  // skipping the first mount, keeps the effect scoped to the terminal.
  const logContainerRef = useRef<HTMLDivElement>(null);
  const isFirstLogRender = useRef(true);

  useEffect(() => {
    if (isFirstLogRender.current) {
      isFirstLogRender.current = false;
      return;
    }
    const container = logContainerRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [log]);

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
    <section id="beyond" aria-labelledby="beyond-heading" className="reveal-item px-4 sm:px-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-6 pb-2 border-b border-line">
        <h2 id="beyond-heading" className="text-xl sm:text-2xl font-display text-ink tracking-tight">
          Beyond the Resume
        </h2>
        <span className="text-xs font-mono text-ink-3">Ask Me Anything</span>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden">
        {/* Terminal Header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-void/60 border-b border-line">
          <div className="w-2.5 h-2.5 rounded-full bg-line" />
          <div className="w-2.5 h-2.5 rounded-full bg-line" />
          <div className="w-2.5 h-2.5 rounded-full bg-line" />
          <LuTerminal className="w-3.5 h-3.5 text-moss ml-1" />
          <span className="text-xs text-ink-2 font-mono">jake &bull; get-to-know-me</span>
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
              className="px-3 py-1.5 rounded-full bg-surface hover:bg-raised text-ink-2 hover:text-summit border border-line hover:border-summit/40 text-xs font-mono cursor-pointer transition-colors"
            >
              {p.label}
            </motion.button>
          ))}
        </div>

        {/* Response Log */}
        <div ref={logContainerRef} className="px-4 py-4 space-y-4 max-h-[280px] overflow-y-auto scrollbar-hide">
          {log.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-1"
            >
              <div className="text-xs font-mono text-ink-3">
                <span className="text-moss">&gt;</span> {entry.command}
              </div>
              <div className="pl-3">
                <TypedLine text={entry.response} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Free-Type Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            runCommand(input);
          }}
          className="flex items-center gap-2 px-4 py-3 border-t border-line bg-void/40"
        >
          <span className="text-moss font-mono text-sm">&gt;</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ask me anything, or try a button above..."
            className="w-full bg-transparent text-ink text-xs sm:text-sm outline-none font-mono caret-ink placeholder-ink-3"
          />
        </form>
      </div>

      {/* Full Topic Layer — centred dialog on desktop, bottom sheet on mobile */}
      <Sheet isOpen={activeLayer !== null} onClose={closeLayer} titleId="beyond-layer-heading" className="max-w-lg">
        {activeLayer && (
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-2xl border border-line bg-void text-ink-2 shrink-0">
                {LAYER_META[activeLayer].icon}
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-ink-3 block">
                  {LAYER_META[activeLayer].eyebrow}
                </span>
                <h3 id="beyond-layer-heading" className="font-sans font-bold text-lg sm:text-xl text-ink">
                  {LAYER_META[activeLayer].title}
                </h3>
              </div>
            </div>

            {activeLayer === "story" && <StoryLayer />}
            {activeLayer === "hobbies" && <HobbiesLayer onClose={closeLayer} />}
            {activeLayer === "philosophy" && <PhilosophyLayer onClose={closeLayer} />}
            {activeLayer === "whyqa" && <WhyQaLayer />}
            {activeLayer === "whatsnext" && <WhatsNextLayer />}
            {activeLayer === "funfact" && <FunFactLayer />}
            {activeLayer === "sayhi" && <SayHiLayer onClose={closeLayer} />}
          </div>
        )}
      </Sheet>
    </section>
  );
}
