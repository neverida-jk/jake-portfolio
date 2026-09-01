"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { soundFx } from "@/util/sound";
import { fireConfetti } from "@/util/confetti";
import { LuX } from "react-icons/lu";

interface TerminalSandboxProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToSection?: (sectionId: string) => void;
}

interface CommandHistory {
  command: string;
  output: React.ReactNode;
}

export default function TerminalSandbox({
  isOpen,
  onClose,
  onNavigateToSection,
}: TerminalSandboxProps) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<CommandHistory[]>([
    {
      command: "init",
      output: (
        <div className="space-y-0.5 text-zinc-400 font-mono text-xs">
          <p className="text-zinc-200 font-semibold">
            jake.dev [version 2.1.0] &bull; UPLB CS &apos;26 Alumnus
          </p>
          <p className="text-zinc-500">
            Type <span className="text-zinc-300">help</span> to view available commands.
          </p>
        </div>
      ),
    },
  ]);
  const [commandListHistory, setCommandListHistory] = useState<string[]>([]);
  const [historyPointer, setHistoryPointer] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const availableCommands = [
    "help",
    "whoami",
    "skills",
    "projects",
    "education",
    "experience",
    "gwa",
    "contact",
    "resume",
    "celebrate",
    "hire",
    "clear",
  ];

  const scrollToBottom = () => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
      soundFx.playClick(750);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const executeCommand = useCallback(
    (cmdRaw: string) => {
      const cmd = cmdRaw.trim().toLowerCase();
      soundFx.playKey();

      if (cmd === "") return;

      setCommandListHistory((prev) => [...prev, cmdRaw]);
      setHistoryPointer(-1);

      let output: React.ReactNode = null;

      switch (cmd) {
        case "help":
          output = (
            <div className="space-y-1 text-xs text-zinc-300 font-mono">
              <p className="text-zinc-400 font-semibold mb-1">Commands:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 text-zinc-400">
                <div><span className="text-zinc-200">whoami</span> - Developer overview</div>
                <div><span className="text-zinc-200">skills</span> - Technical stack & tools</div>
                <div><span className="text-zinc-200">projects</span> - Selected projects</div>
                <div><span className="text-zinc-200">experience</span> - QA Analyst & SWE background</div>
                <div><span className="text-zinc-200">skills</span> - Engineering & QA stack</div>
                <div><span className="text-zinc-200">education</span> - UPLB degree</div>
                <div><span className="text-zinc-200">resume</span> - Plain-text resume</div>
                <div><span className="text-zinc-200">hire</span> - Trigger direct contact</div>
                <div><span className="text-zinc-200">contact</span> - Email & links</div>
                <div><span className="text-zinc-200">clear</span> - Clear terminal</div>
              </div>
            </div>
          );
          break;

        case "whoami":
          output = (
            <div className="space-y-1 text-xs text-zinc-300 font-mono">
              <p className="text-white font-semibold">Jake Neverida</p>
              <p className="text-emerald-400">Quality Assurance Analyst @ Vertere Global Solutions Inc.</p>
              <p>Software Engineer &bull; Full-Stack Web Developer</p>
              <p className="text-zinc-400">Building production web systems with Next.js, React, TypeScript, and rigorous QA test suites.</p>
            </div>
          );
          break;

        case "skills":
          output = (
            <div className="space-y-1 text-xs text-zinc-300 font-mono">
              <p className="text-zinc-400 font-semibold mb-1">Skills:</p>
              <p><span className="text-zinc-200">QA & Testing:</span> Test Case Authoring, Regression Suites, Defect Management, Release QA</p>
              <p><span className="text-zinc-200">Frontend:</span> React 19, Next.js 15, Tailwind CSS v4, TypeScript, Framer Motion</p>
              <p><span className="text-zinc-200">Backend & DB:</span> Node.js, Express, MongoDB, IndexedDB, RESTful APIs</p>
              <p><span className="text-zinc-200">Languages & Tools:</span> TypeScript, JavaScript, Python, C/C++, Git, Vercel</p>
            </div>
          );
          break;

        case "projects":
          output = (
            <div className="space-y-2 text-xs text-zinc-300 font-mono">
              <div>
                <p className="text-white font-semibold">1. Prediction Market Edge Engine (<a href="https://quant.dev-jk.me" target="_blank" rel="noreferrer" className="text-emerald-400 underline">quant.dev-jk.me</a>)</p>
                <p className="text-zinc-400">Quantitative probability modeling & Kelly criterion position sizing for prediction markets.</p>
              </div>
              <div>
                <p className="text-white font-semibold">2. Tropa — Mountain Climb Coordinator (<a href="https://tropa.dev-jk.me" target="_blank" rel="noreferrer" className="text-emerald-400 underline">tropa.dev-jk.me</a>)</p>
                <p className="text-zinc-400">Next.js 15 platform for Philippine trail itineraries, logistics, and multi-party expense splitting.</p>
              </div>
              <div>
                <p className="text-white font-semibold">3. Finance Tracker PWA (<a href="https://finance.dev-jk.me" target="_blank" rel="noreferrer" className="text-emerald-400 underline">finance.dev-jk.me</a>)</p>
                <p className="text-zinc-400">Offline-first personal finance management using Dexie.js (IndexedDB) and Recharts analytics.</p>
              </div>
              <div>
                <p className="text-white font-semibold">4. Developer Portfolio v2 (<a href="https://neverida-jk.github.io/portfolio" target="_blank" rel="noreferrer" className="text-emerald-400 underline">dev-jk.me</a>)</p>
                <p className="text-zinc-400">Next.js 15, React 19, Tailwind v4, Web Audio API haptics, and embedded Unix shell.</p>
              </div>
            </div>
          );
          break;

        case "education":
          output = (
            <div className="space-y-1 text-xs text-zinc-300 font-mono">
              <p className="text-white font-semibold">University of the Philippines Los Baños</p>
              <p>Bachelor of Science in Computer Science &bull; <span className="text-emerald-400 font-bold">Graduated (2022 - 2026)</span></p>
              <p>Iskolar ng Bayan &bull; Cumulative GWA: <span className="text-emerald-400 font-bold">1.95</span></p>
            </div>
          );
          break;

        case "experience":
          output = (
            <div className="space-y-2 text-xs text-zinc-300 font-mono">
              <div>
                <p className="text-white font-semibold">1. Vertere Global Solutions Inc.</p>
                <p className="text-emerald-400 font-semibold">Quality Assurance Analyst (June 2026 - Present)</p>
                <p className="text-zinc-400">Software testing, test execution, regression suites, defect tracking, and release quality verification.</p>
              </div>
              <div>
                <p className="text-white font-semibold">2. Limitless Lab</p>
                <p className="text-zinc-400">Software Engineer Intern (May 2025 - July 2025)</p>
                <p className="text-zinc-400">Developed frontend features with React and Next.js; collaborated on agile sprints.</p>
              </div>
            </div>
          );
          break;

        case "gwa":
          output = (
            <div className="text-xs text-zinc-300 font-mono">
              Cumulative GWA: <span className="text-emerald-400 font-bold">1.95</span> (UP Los Baños BS Computer Science, Graduated 2026)
            </div>
          );
          break;

        case "celebrate":
          soundFx.playSuccess();
          fireConfetti();
          output = (
            <div className="text-xs text-emerald-400 font-mono">
              Class of 2026! BS Computer Science, UP Los Baños (GWA 1.95).
            </div>
          );
          break;

        case "resume":
          output = (
            <div className="space-y-1 text-xs text-zinc-300 font-mono bg-zinc-900/60 p-2.5 rounded border border-white/[0.06]">
              <p className="text-white font-bold">Jake Neverida</p>
              <p className="text-zinc-400">Email: jlrneverida@gmail.com | GitHub: github.com/neverida-jk</p>
              <p className="text-zinc-500">----------------------------------------</p>
              <p className="text-zinc-200">Current: Quality Assurance Analyst @ Vertere Global Solutions Inc. (June 2026 - Present)</p>
              <p className="text-zinc-400">Previous: Software Engineer Intern @ Limitless Lab (May - July 2025)</p>
              <p className="text-zinc-200">Education: BS Computer Science, UP Los Baños (2022-2026 Graduated | GWA 1.95)</p>
              <p className="text-zinc-200">Stack: React, Next.js, TypeScript, Python, Node.js, Tailwind, MongoDB, QA Testing</p>
            </div>
          );
          break;

        case "hire":
        case "sudo hire":
          soundFx.playSuccess();
          fireConfetti();
          output = (
            <div className="space-y-1 text-xs text-zinc-300 font-mono bg-zinc-900/60 p-2.5 rounded border border-emerald-500/30">
              <p className="text-emerald-400 font-semibold">Opportunity noted. Ready to bring high-velocity engineering value!</p>
              <p>Direct inquiry: jlrneverida@gmail.com</p>
              <button
                onClick={() => {
                  if (onNavigateToSection) {
                    onNavigateToSection("contact");
                    onClose();
                  }
                }}
                className="mt-1 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-[11px] font-mono transition-colors"
              >
                Go to contact form &rarr;
              </button>
            </div>
          );
          break;

        case "contact":
          output = (
            <div className="space-y-0.5 text-xs text-zinc-300 font-mono">
              <p>Email: <a href="mailto:jlrneverida@gmail.com" className="text-white underline">jlrneverida@gmail.com</a></p>
              <p>GitHub: <a href="https://github.com/neverida-jk" target="_blank" rel="noreferrer" className="text-white underline">github.com/neverida-jk</a></p>
              <p>LinkedIn: <a href="https://linkedin.com/in/your-profile" target="_blank" rel="noreferrer" className="text-white underline">linkedin.com/in/your-profile</a></p>
            </div>
          );
          break;

        case "clear":
          setHistory([]);
          setInput("");
          return;

        default:
          output = (
            <div className="text-xs text-zinc-400 font-mono">
              command not found: {cmdRaw}. Type <span className="text-zinc-200">help</span> for commands.
            </div>
          );
          break;
      }

      setHistory((prev) => [...prev, { command: cmdRaw, output }]);
      setInput("");
    },
    [onNavigateToSection, onClose]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeCommand(input);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandListHistory.length > 0) {
        const newPtr =
          historyPointer === -1
            ? commandListHistory.length - 1
            : Math.max(0, historyPointer - 1);
        setHistoryPointer(newPtr);
        setInput(commandListHistory[newPtr]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyPointer !== -1) {
        const newPtr = historyPointer + 1;
        if (newPtr >= commandListHistory.length) {
          setHistoryPointer(-1);
          setInput("");
        } else {
          setHistoryPointer(newPtr);
          setInput(commandListHistory[newPtr]);
        }
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const match = availableCommands.find((c) =>
        c.startsWith(input.toLowerCase())
      );
      if (match) {
        setInput(match);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl glass-panel rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl font-mono flex flex-col h-[65vh] max-h-[520px] animate-modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-zinc-950/80 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-2.5 h-2.5 rounded-full bg-zinc-600 hover:bg-zinc-400 transition-colors"
              title="Close"
            />
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            <span className="ml-2 text-xs text-zinc-400">
              jake@portfolio:~ (uplb-grad-2026)
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
          >
            <LuX className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-3 py-1.5 bg-zinc-950/40 border-b border-white/[0.04] flex items-center gap-1.5 overflow-x-auto scrollbar-hide text-xs">
          {["help", "whoami", "skills", "projects", "education", "celebrate", "hire"].map((cmd) => (
            <button
              key={cmd}
              onClick={() => executeCommand(cmd)}
              className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-white/[0.04] transition-colors text-[11px] shrink-0 cursor-pointer"
            >
              {cmd}
            </button>
          ))}
        </div>

        {/* Terminal Body */}
        <div
          className="flex-1 overflow-y-auto p-3.5 space-y-2.5 bg-[#070709]/90 text-xs scrollbar-hide"
          onClick={() => inputRef.current?.focus()}
        >
          {history.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center gap-1.5 text-zinc-500">
                <span className="text-zinc-400">&gt;</span>
                <span className="text-zinc-200 font-mono">{item.command}</span>
              </div>
              <div className="pl-3">{item.output}</div>
            </div>
          ))}

          {/* Active Input Line */}
          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-zinc-400">&gt;</span>
            <div className="flex-1 flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-zinc-100 text-xs outline-none font-mono caret-white"
                autoFocus
                placeholder="type a command (try 'celebrate')..."
              />
            </div>
          </div>

          <div ref={terminalEndRef} />
        </div>

        {/* Terminal Footer */}
        <div className="px-3.5 py-1.5 bg-zinc-950 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-zinc-500">
          <span>Tab: complete &bull; &uarr;&darr;: history</span>
          <span>zsh</span>
        </div>
      </div>
    </div>
  );
}
