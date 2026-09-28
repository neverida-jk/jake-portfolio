"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { soundFx } from "@/util/sound";
import { LuTerminal } from "react-icons/lu";

interface LogEntry {
  id: number;
  command: string;
  response: string;
}

const PROMPTS: { label: string; command: string; response: string }[] = [
  {
    label: "My Story",
    command: "story",
    response:
      "Four years at UP Los Baños studying Computer Science, graduating an Iskolar ng Bayan with a 1.95 GWA. Along the way I interned as a software engineer, then found my footing in QA — I like being the person who makes sure things actually work before they reach anyone else. Now I'm a QA Analyst at Vertere Global Solutions, still building on the side because I never really stopped.",
  },
  {
    label: "Hobbies",
    command: "hobbies",
    response:
      "I climb mountains around the Philippines with a small group of friends — Pulag, Apo, Ulap, Batulao. Planning those trips got annoying enough that I built an app for it (that's Tropa, one of the projects below).",
  },
  {
    label: "Philosophy",
    command: "philosophy",
    response:
      "I'd rather ship something small that works than something big that mostly works. Quality isn't a phase at the end — it's a habit, whether I'm testing someone else's code or writing my own.",
  },
  {
    label: "Fun Fact",
    command: "fun fact",
    response:
      "This whole site has a working terminal, a command palette, and sound effects I synthesized myself — nobody asked for that, I just wanted to see if I could.",
  },
  {
    label: "Say Hi",
    command: "say hi",
    response:
      "Always happy to talk shop or just chat. Scroll down to the contact section, or email jlrneverida@gmail.com directly.",
  },
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

export default function TechnicalExpertiseSection() {
  const [log, setLog] = useState<LogEntry[]>([
    {
      id: 0,
      command: "help",
      response: "Hi, I'm Jake. Try one of the buttons below, or type your own question.",
    },
  ]);
  const [input, setInput] = useState("");
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [log]);

  const runCommand = useCallback((command: string) => {
    soundFx.playKey();
    const normalized = command.trim().toLowerCase();
    if (!normalized) return;

    if (normalized === "clear") {
      setLog([]);
      setInput("");
      return;
    }

    const match = PROMPTS.find(
      (p) => p.command === normalized || p.label.toLowerCase() === normalized
    );

    logIdCounter += 1;
    setLog((prev) => [
      ...prev,
      { id: logIdCounter, command, response: match ? match.response : FALLBACK_RESPONSE },
    ]);
    setInput("");
  }, []);

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
              key={p.command}
              onClick={() => runCommand(p.command)}
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
    </section>
  );
}
