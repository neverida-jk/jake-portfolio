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
        <div className="space-y-0.5 text-ink-2 font-mono text-xs">
          <p className="text-ink font-semibold">
            jake.dev [version 2.1.0] &bull; UPLB CS &apos;26 Alumnus
          </p>
          <p className="text-ink-3">
            Type <span className="text-ink-2">help</span> to view available commands.
          </p>
        </div>
      ),
    },
  ]);
  const [commandListHistory, setCommandListHistory] = useState<string[]>([]);
  const [historyPointer, setHistoryPointer] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

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
    "sudo hire me",
    "clear",
  ];

  // Scroll only the terminal's own body, never the page. The previous
  // implementation called scrollIntoView() on a sentinel, which walks up
  // every ancestor (including transformed .reveal-item sections) and can
  // drag the whole page to this modal instead of just the log.
  const scrollToBottom = () => {
    const container = bodyRef.current;
    if (container) container.scrollTop = container.scrollHeight;
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
            <div className="space-y-1 text-xs text-ink-2 font-mono">
              <p className="text-ink-2 font-semibold mb-1">Commands:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 text-ink-2">
                <div><span className="text-ink">whoami</span> - Developer overview</div>
                <div><span className="text-ink">skills</span> - Technical stack &amp; tools</div>
                <div><span className="text-ink">projects</span> - Selected projects</div>
                <div><span className="text-ink">experience</span> - QA Analyst &amp; SWE background</div>
                <div><span className="text-ink">education</span> - UPLB degree</div>
                <div><span className="text-ink">resume</span> - Plain-text resume</div>
                <div><span className="text-ink">sudo hire me</span> - You know what to do</div>
                <div><span className="text-ink">contact</span> - Email &amp; links</div>
                <div><span className="text-ink">clear</span> - Clear terminal</div>
              </div>
            </div>
          );
          break;

        case "whoami":
          output = (
            <div className="space-y-1 text-xs text-ink-2 font-mono">
              <p className="text-ink font-semibold">Jake Neverida</p>
              <p className="text-moss">Quality Assurance Analyst @ Vertere Global Solutions Inc.</p>
              <p>Software Engineer &bull; Full-Stack Web Developer</p>
              <p className="text-ink-2">Building production web systems with Next.js, React, TypeScript, and rigorous QA test suites.</p>
            </div>
          );
          break;

        case "skills":
          output = (
            <div className="space-y-1 text-xs text-ink-2 font-mono">
              <p className="text-ink-2 font-semibold mb-1">Skills:</p>
              <p><span className="text-ink">QA &amp; Testing:</span> Test Case Authoring, Regression Suites, Defect Management, Release QA</p>
              <p><span className="text-ink">Frontend:</span> React 19, Next.js 15, Tailwind CSS v4, TypeScript, Framer Motion</p>
              <p><span className="text-ink">Backend &amp; DB:</span> Node.js, Express, MongoDB, IndexedDB, RESTful APIs</p>
              <p><span className="text-ink">Cloud &amp; DevOps:</span> AWS, Docker, GitHub Actions (CI/CD)</p>
              <p><span className="text-ink">Languages &amp; Tools:</span> TypeScript, JavaScript, Python, C/C++, Git, Vercel</p>
            </div>
          );
          break;

        case "projects":
          output = (
            <div className="space-y-2 text-xs text-ink-2 font-mono">
              <div>
                <p className="text-ink font-semibold">1. Prediction Market Edge Engine (<a href="https://quant.dev-jk.me" target="_blank" rel="noreferrer" className="text-moss underline">quant.dev-jk.me</a>)</p>
                <p className="text-ink-2">Quantitative probability modeling &amp; Kelly criterion position sizing for prediction markets.</p>
              </div>
              <div>
                <p className="text-ink font-semibold">2. Tropa — Mountain Climb Coordinator (<a href="https://tropa.dev-jk.me" target="_blank" rel="noreferrer" className="text-moss underline">tropa.dev-jk.me</a>)</p>
                <p className="text-ink-2">Next.js 15 platform for Philippine trail itineraries, logistics, and multi-party expense splitting.</p>
              </div>
              <div>
                <p className="text-ink font-semibold">3. Finance Tracker PWA (<a href="https://finance.dev-jk.me" target="_blank" rel="noreferrer" className="text-moss underline">finance.dev-jk.me</a>)</p>
                <p className="text-ink-2">Offline-first personal finance management using Dexie.js (IndexedDB) and Recharts analytics.</p>
              </div>
              <div>
                <p className="text-ink font-semibold">4. Developer Portfolio v2 (<a href="https://neverida-jk.github.io/portfolio" target="_blank" rel="noreferrer" className="text-moss underline">dev-jk.me</a>)</p>
                <p className="text-ink-2">Next.js 15, React 19, Tailwind v4, Web Audio API haptics, and an embedded Unix shell.</p>
              </div>
            </div>
          );
          break;

        case "education":
          output = (
            <div className="space-y-1 text-xs text-ink-2 font-mono">
              <p className="text-ink font-semibold">University of the Philippines Los Baños</p>
              <p>Bachelor of Science in Computer Science &bull; <span className="text-moss font-bold">Graduated (2022 - 2026)</span></p>
              <p>Iskolar ng Bayan &bull; Cumulative GWA: <span className="text-moss font-bold">1.95</span></p>
            </div>
          );
          break;

        case "experience":
          output = (
            <div className="space-y-2 text-xs text-ink-2 font-mono">
              <div>
                <p className="text-ink font-semibold">1. Vertere Global Solutions Inc.</p>
                <p className="text-moss font-semibold">Quality Assurance Analyst (June 2026 - Present)</p>
                <p className="text-ink-2">Software testing, test execution, regression suites, defect tracking, and release quality verification.</p>
              </div>
              <div>
                <p className="text-ink font-semibold">2. Limitless Lab</p>
                <p className="text-ink-2">Software Engineer Intern (May 2025 - July 2025)</p>
                <p className="text-ink-2">Developed frontend features with React and Next.js; collaborated on agile sprints.</p>
              </div>
            </div>
          );
          break;

        case "gwa":
          output = (
            <div className="text-xs text-ink-2 font-mono">
              Cumulative GWA: <span className="text-moss font-bold">1.95</span> (UP Los Baños BS Computer Science, Graduated 2026)
            </div>
          );
          break;

        case "celebrate":
          soundFx.playSuccess();
          fireConfetti();
          output = (
            <div className="text-xs text-moss font-mono">
              Class of 2026! BS Computer Science, UP Los Baños (GWA 1.95).
            </div>
          );
          break;

        case "resume":
          output = (
            <div className="space-y-1 text-xs text-ink-2 font-mono bg-raised/60 p-2.5 rounded border border-line">
              <p className="text-ink font-bold">Jake Neverida</p>
              <p className="text-ink-2">Email: jlrneverida@gmail.com | GitHub: github.com/neverida-jk</p>
              <p className="text-ink-3">----------------------------------------</p>
              <p className="text-ink">Current: Quality Assurance Analyst @ Vertere Global Solutions Inc. (June 2026 - Present)</p>
              <p className="text-ink-2">Previous: Software Engineer Intern @ Limitless Lab (May - July 2025)</p>
              <p className="text-ink">Education: BS Computer Science, UP Los Baños (2022-2026 Graduated | GWA 1.95)</p>
              <p className="text-ink">Stack: React, Next.js, TypeScript, Python, Node.js, Tailwind, MongoDB, QA Testing</p>
            </div>
          );
          break;

        // Easter egg (§7.9 / §9 of ASCENT_MASTERPLAN.md item 9) — a warm
        // response plus a direct link to the summit.
        case "sudo hire me":
        case "hire":
          soundFx.playSuccess();
          fireConfetti();
          output = (
            <div className="space-y-1 text-xs text-ink-2 font-mono bg-raised/60 p-2.5 rounded border border-moss/30">
              <p className="text-moss font-semibold">Permission granted. Let&apos;s talk.</p>
              <p>Direct inquiry: jlrneverida@gmail.com</p>
              <button
                onClick={() => {
                  if (onNavigateToSection) {
                    onNavigateToSection("contact");
                    onClose();
                  }
                }}
                className="mt-1 px-2.5 py-1 bg-raised hover:bg-void text-ink rounded text-[11px] font-mono transition-colors cursor-pointer border border-line"
              >
                Go to contact form &rarr;
              </button>
            </div>
          );
          break;

        case "contact":
          output = (
            <div className="space-y-0.5 text-xs text-ink-2 font-mono">
              <p>Email: <a href="mailto:jlrneverida@gmail.com" className="text-ink underline">jlrneverida@gmail.com</a></p>
              <p>GitHub: <a href="https://github.com/neverida-jk" target="_blank" rel="noreferrer" className="text-ink underline">github.com/neverida-jk</a></p>
            </div>
          );
          break;

        case "clear":
          setHistory([]);
          setInput("");
          return;

        default:
          output = (
            <div className="text-xs text-ink-2 font-mono">
              command not found: {cmdRaw}. Type <span className="text-ink">help</span> for commands.
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
      className="fixed inset-0 z-[140] flex items-center justify-center p-3 sm:p-4 bg-void/70 backdrop-blur-md animate-fade-in-fast"
      onClick={onClose}
      data-print-hide
    >
      <div
        className="w-full max-w-2xl glass-panel rounded-2xl overflow-hidden font-mono flex flex-col h-[65vh] max-h-[520px] animate-modal-enter"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Terminal"
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-void/80 border-b border-line">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-2.5 h-2.5 rounded-full bg-ink-3/60 hover:bg-ink-2 transition-colors cursor-pointer"
              title="Close"
            />
            <div className="w-2.5 h-2.5 rounded-full bg-line" />
            <div className="w-2.5 h-2.5 rounded-full bg-line" />
            <span className="ml-2 text-xs text-ink-2">
              jake@portfolio:~ (uplb-grad-2026)
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-ink-3 hover:text-ink-2 transition-colors p-1 cursor-pointer"
            aria-label="Close terminal"
          >
            <LuX className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-3 py-1.5 bg-void/40 border-b border-line flex items-center gap-1.5 overflow-x-auto scrollbar-hide text-xs">
          {["help", "whoami", "skills", "projects", "education", "celebrate", "sudo hire me"].map((cmd) => (
            <button
              key={cmd}
              onClick={() => executeCommand(cmd)}
              className="px-2 py-0.5 rounded bg-raised hover:bg-void/80 text-ink-2 hover:text-ink border border-line transition-colors text-[11px] shrink-0 cursor-pointer"
            >
              {cmd}
            </button>
          ))}
        </div>

        {/* Terminal Body */}
        <div
          ref={bodyRef}
          className="flex-1 overflow-y-auto p-3.5 space-y-2.5 bg-void/90 text-xs scrollbar-hide"
          onClick={() => inputRef.current?.focus()}
        >
          {history.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center gap-1.5 text-ink-3">
                <span className="text-ink-2">&gt;</span>
                <span className="text-ink font-mono">{item.command}</span>
              </div>
              <div className="pl-3">{item.output}</div>
            </div>
          ))}

          {/* Active Input Line */}
          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-ink-2">&gt;</span>
            <div className="flex-1 flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-ink text-xs outline-none font-mono caret-summit"
                autoFocus
                placeholder="type a command (try 'sudo hire me')..."
              />
            </div>
          </div>
        </div>

        {/* Terminal Footer */}
        <div className="px-3.5 py-1.5 bg-void border-t border-line flex items-center justify-between text-[10px] text-ink-3">
          <span>Tab: complete &bull; &uarr;&darr;: history</span>
          <span>zsh</span>
        </div>
      </div>
    </div>
  );
}
