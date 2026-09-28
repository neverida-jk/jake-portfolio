"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { soundFx } from "@/util/sound";
import { projects } from "@/content/projects";
import { tools } from "@/content/tools";
import { useToolFocus } from "@/components/system/ToolFocusProvider";
import {
  LuSearch,
  LuUser,
  LuRoute,
  LuFolder,
  LuWrench,
  LuCompass,
  LuTerminal as LuTerminalIcon,
  LuMail,
  LuCopy,
  LuVolume2,
  LuVolumeX,
  LuPrinter,
  LuBug,
  LuFlag,
  LuMountainSnow,
} from "react-icons/lu";
import { SiGithub } from "react-icons/si";

type Category = "Jump to" | "Work" | "Toolkit" | "Beyond the resume" | "Actions";

interface CommandItem {
  id: string;
  title: string;
  category: Category;
  icon: React.ReactNode;
  keywords?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTerminal?: () => void;
  onCopyEmail?: () => void;
}

const RECENTS_KEY = "jake.cmdk.recent";
const RECENTS_MAX = 5;

// A small subsequence fuzzy scorer (no dependency). All query characters must
// appear in `target`, in order; consecutive and word-boundary matches score
// higher so "wk" beats a scattered match, and "tropa" ranks its exact
// substring above a looser one. Returns null on no match.
function fuzzyMatch(query: string, target: string): { score: number; indices: number[] } | null {
  if (!query) return { score: 0, indices: [] };
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  const indices: number[] = [];
  let qi = 0;
  let score = 0;
  let prevIndex = -2;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] !== q[qi]) continue;
    indices.push(ti);
    score += prevIndex === ti - 1 ? 8 : 1; // consecutive-run bonus
    if (ti === 0 || t[ti - 1] === " " || t[ti - 1] === "-" || t[ti - 1] === "/") score += 4;
    prevIndex = ti;
    qi++;
  }
  if (qi < q.length) return null;
  score -= t.length * 0.02; // prefer shorter, more specific targets
  return { score, indices };
}

function HighlightedTitle({ title, indices }: { title: string; indices: number[] }) {
  if (indices.length === 0) return <>{title}</>;
  const set = new Set(indices);
  return (
    <>
      {Array.from(title).map((ch, i) =>
        set.has(i) ? (
          <span key={i} className="text-summit">
            {ch}
          </span>
        ) : (
          <React.Fragment key={i}>{ch}</React.Fragment>
        )
      )}
    </>
  );
}

export default function CommandPalette({
  isOpen,
  onClose,
  onOpenTerminal,
  onCopyEmail,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setFocusedTool } = useToolFocus();

  useEffect(() => {
    setIsMuted(soundFx.getIsMuted());
    const onSoundChanged = (e: Event) => setIsMuted((e as CustomEvent<boolean>).detail);
    window.addEventListener("sound-changed", onSoundChanged);
    return () => window.removeEventListener("sound-changed", onSoundChanged);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENTS_KEY);
      if (raw) setRecentIds(JSON.parse(raw));
    } catch {
      // ignore malformed storage
    }
  }, []);

  const remember = useCallback((id: string) => {
    setRecentIds((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, RECENTS_MAX);
      try {
        localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Section jumps use window.scrollTo — never scrollIntoView, which can walk
  // up transformed ancestors (reveal-item sections) and land in the wrong place.
  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, []);

  const openCaseStudy = useCallback((id: string) => {
    const base = window.location.pathname + window.location.search;
    window.location.hash = `work/${id}`;
    // The Work section only reads the hash on mount — this nudges it to
    // react to a hash set after load without a full navigation.
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    void base;
  }, []);

  const commands: CommandItem[] = useMemo(() => {
    const sectionCmds: CommandItem[] = [
      { id: "nav-hero", title: "Base Camp — About", category: "Jump to", icon: <LuUser className="h-4 w-4" />, action: () => scrollToSection("hero") },
      { id: "nav-journey", title: "The Route — Journey", category: "Jump to", icon: <LuRoute className="h-4 w-4" />, action: () => scrollToSection("journey") },
      { id: "nav-work", title: "Expeditions — Work", category: "Jump to", icon: <LuFolder className="h-4 w-4" />, action: () => scrollToSection("work") },
      { id: "nav-toolkit", title: "The Toolkit — Skills", category: "Jump to", icon: <LuWrench className="h-4 w-4" />, action: () => scrollToSection("toolkit") },
      { id: "nav-approach", title: "How I Work — Approach", category: "Jump to", icon: <LuCompass className="h-4 w-4" />, action: () => scrollToSection("approach") },
      { id: "nav-beyond", title: "Beyond the Resume", category: "Jump to", icon: <LuTerminalIcon className="h-4 w-4" />, action: () => scrollToSection("beyond") },
      { id: "nav-contact", title: "Summit — Contact", category: "Jump to", icon: <LuMail className="h-4 w-4" />, action: () => scrollToSection("contact") },
    ];

    const projectCmds: CommandItem[] = projects.map((p) => ({
      id: `work-${p.id}`,
      title: p.title,
      category: "Work",
      icon: <LuFolder className="h-4 w-4" />,
      keywords: p.domain,
      action: () => openCaseStudy(p.id),
    }));

    const toolCmds: CommandItem[] = tools.map((t) => ({
      id: `tool-${t.id}`,
      title: t.label,
      category: "Toolkit",
      icon: <LuWrench className="h-4 w-4" />,
      action: () => {
        scrollToSection("toolkit");
        setFocusedTool(t.id);
        setTimeout(() => setFocusedTool(null), 2400);
      },
    }));

    const beyondCmds: CommandItem[] = [
      { id: "beyond-story", title: "Beyond: My Story", category: "Beyond the resume", icon: <LuTerminalIcon className="h-4 w-4" />, action: () => scrollToSection("beyond") },
      { id: "beyond-hobbies", title: "Beyond: Hobbies", category: "Beyond the resume", icon: <LuTerminalIcon className="h-4 w-4" />, action: () => scrollToSection("beyond") },
      { id: "beyond-philosophy", title: "Beyond: Philosophy", category: "Beyond the resume", icon: <LuTerminalIcon className="h-4 w-4" />, action: () => scrollToSection("beyond") },
      { id: "beyond-whyqa", title: "Beyond: Why QA?", category: "Beyond the resume", icon: <LuTerminalIcon className="h-4 w-4" />, action: () => scrollToSection("beyond") },
      { id: "beyond-whatsnext", title: "Beyond: What's next?", category: "Beyond the resume", icon: <LuTerminalIcon className="h-4 w-4" />, action: () => scrollToSection("beyond") },
    ];

    const actionCmds: CommandItem[] = [
      {
        id: "act-copy-email",
        title: "Copy email (jlrneverida@gmail.com)",
        category: "Actions",
        icon: <LuCopy className="h-4 w-4" />,
        action: () => {
          if (onCopyEmail) onCopyEmail();
          else navigator.clipboard.writeText("jlrneverida@gmail.com");
        },
      },
      { id: "act-github", title: "Open GitHub profile", category: "Actions", icon: <SiGithub className="h-4 w-4" />, action: () => window.open("https://github.com/neverida-jk", "_blank", "noopener,noreferrer") },
      { id: "act-terminal", title: "Open terminal", category: "Actions", icon: <LuTerminalIcon className="h-4 w-4" />, action: () => onOpenTerminal?.() },
      { id: "act-print", title: "Print résumé", category: "Actions", icon: <LuPrinter className="h-4 w-4" />, action: () => window.print() },
      { id: "act-break-it", title: "Break It mode", category: "Actions", icon: <LuBug className="h-4 w-4" />, keywords: "qa test self-check", action: () => window.dispatchEvent(new CustomEvent("open-break-it")) },
      { id: "act-summit", title: "Jump to summit", category: "Actions", icon: <LuFlag className="h-4 w-4" />, action: () => scrollToSection("contact") },
      {
        id: "act-sound",
        title: isMuted ? "Unmute sound" : "Mute sound",
        category: "Actions",
        icon: isMuted ? <LuVolumeX className="h-4 w-4" /> : <LuVolume2 className="h-4 w-4" />,
        action: () => soundFx.toggleMute(),
      },
    ];

    return [...sectionCmds, ...projectCmds, ...toolCmds, ...beyondCmds, ...actionCmds];
  }, [onCopyEmail, onOpenTerminal, scrollToSection, openCaseStudy, setFocusedTool, isMuted]);

  const results = useMemo(() => {
    if (!query.trim()) {
      const ids = recentIds.length > 0 ? recentIds : ["nav-hero", "nav-work", "nav-toolkit", "nav-contact", "act-print", "act-break-it"];
      const byId = new Map(commands.map((c) => [c.id, c]));
      const suggested = ids.map((id) => byId.get(id)).filter((c): c is CommandItem => !!c);
      return suggested.map((c) => ({ cmd: c, indices: [] as number[] }));
    }
    const scored = commands
      .map((c) => {
        const m = fuzzyMatch(query, `${c.title} ${c.keywords ?? ""} ${c.category}`);
        return m ? { cmd: c, score: m.score, indices: m.indices.filter((i) => i < c.title.length) } : null;
      })
      .filter((r): r is { cmd: CommandItem; score: number; indices: number[] } => !!r);
    scored.sort((a, b) => b.score - a.score);
    return scored.map(({ cmd, indices }) => ({ cmd, indices }));
  }, [query, commands, recentIds]);

  const isSuggested = !query.trim();

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      soundFx.playClick(900);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  const runAt = useCallback(
    (idx: number) => {
      const item = results[idx]?.cmd;
      if (!item) return;
      soundFx.playClick(1000);
      remember(item.id);
      item.action();
      onClose();
    },
    [results, remember, onClose]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else window.dispatchEvent(new CustomEvent("open-command-palette"));
      }

      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        soundFx.playKey();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, results.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        soundFx.playKey();
        setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(1, results.length));
      } else if (e.key === "Enter") {
        e.preventDefault();
        runAt(selectedIndex);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, results, selectedIndex, runAt]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[150] flex items-start justify-center pt-20 px-4 bg-void/70 backdrop-blur-md animate-fade-in-fast"
      onClick={onClose}
      data-print-hide
    >
      <div
        className="w-full max-w-lg glass-panel rounded-2xl overflow-hidden animate-modal-enter"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        {/* Search Bar */}
        <div className="flex items-center px-4 py-3 border-b border-line bg-void/60">
          <LuSearch className="w-4 h-4 text-ink-3 mr-2.5 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search sections, projects, tools..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              soundFx.playKey();
            }}
            className="w-full bg-transparent text-ink placeholder-ink-3 text-xs sm:text-sm outline-none font-sans"
          />
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] text-ink-2 bg-raised border border-line rounded font-mono">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[50vh] overflow-y-auto p-1.5 space-y-0.5 scrollbar-hide">
          {isSuggested && results.length > 0 && (
            <div className="px-2.5 pb-1 pt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
              {recentIds.length > 0 ? "Recent" : "Suggested"}
            </div>
          )}
          {results.length === 0 ? (
            <div className="py-8 text-center text-ink-3 text-xs font-mono">No matching commands</div>
          ) : (
            results.map(({ cmd, indices }, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  onClick={() => runAt(idx)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                    isSelected ? "bg-raised text-ink" : "text-ink-2 hover:bg-raised/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-ink-3 shrink-0">{cmd.icon}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-medium font-sans text-ink truncate">
                        <HighlightedTitle title={cmd.title} indices={indices} />
                      </div>
                      <div className="text-[10px] text-ink-3 font-mono">{cmd.category}</div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-3.5 py-2 border-t border-line bg-void/80 flex items-center justify-between text-[11px] text-ink-3 font-mono">
          <div className="flex items-center gap-3">
            <span>&uarr;&darr; navigate</span>
            <span>&crarr; select</span>
          </div>
          <span className="flex items-center gap-1">
            <LuMountainSnow className="h-3 w-3" />
            jake.dev
          </span>
        </div>
      </div>
    </div>
  );
}
