"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { soundFx } from "@/util/sound";
import {
  LuSearch,
  LuUser,
  LuGraduationCap,
  LuCode,
  LuFolder,
  LuLayers,
  LuMail,
  LuCopy,
  LuTerminal,
  LuVolume2,
  LuZap,
} from "react-icons/lu";
import { SiGithub, SiLinkedin } from "react-icons/si";

interface CommandItem {
  id: string;
  title: string;
  category: "Navigation" | "Actions" | "Preferences";
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTerminal?: () => void;
  onToggleParticles?: () => void;
  onCopyEmail?: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onOpenTerminal,
  onToggleParticles,
  onCopyEmail,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const commands: CommandItem[] = useMemo(
    () => [
      {
        id: "nav-hero",
        title: "About / Overview",
        category: "Navigation",
        icon: <LuUser className="w-4 h-4 text-zinc-400" />,
        shortcut: "H",
        action: () => scrollToSection("hero"),
      },
      {
        id: "nav-credentials",
        title: "Experience & Education",
        category: "Navigation",
        icon: <LuGraduationCap className="w-4 h-4 text-zinc-400" />,
        shortcut: "E",
        action: () => scrollToSection("credentials"),
      },
      {
        id: "nav-skills",
        title: "Skills & Technologies",
        category: "Navigation",
        icon: <LuCode className="w-4 h-4 text-zinc-400" />,
        shortcut: "S",
        action: () => scrollToSection("skills"),
      },
      {
        id: "nav-projects",
        title: "Featured Projects",
        category: "Navigation",
        icon: <LuFolder className="w-4 h-4 text-zinc-400" />,
        shortcut: "P",
        action: () => scrollToSection("projects"),
      },
      {
        id: "nav-why",
        title: "Approach & Principles",
        category: "Navigation",
        icon: <LuLayers className="w-4 h-4 text-zinc-400" />,
        shortcut: "A",
        action: () => scrollToSection("why-work-with-me"),
      },
      {
        id: "nav-contact",
        title: "Contact",
        category: "Navigation",
        icon: <LuMail className="w-4 h-4 text-zinc-400" />,
        shortcut: "C",
        action: () => scrollToSection("contact"),
      },
      {
        id: "act-copy-email",
        title: "Copy Email (jlrneverida@gmail.com)",
        category: "Actions",
        icon: <LuCopy className="w-4 h-4 text-zinc-400" />,
        action: () => {
          if (onCopyEmail) {
            onCopyEmail();
          } else {
            navigator.clipboard.writeText("jlrneverida@gmail.com");
          }
        },
      },
      {
        id: "act-github",
        title: "Open GitHub Profile",
        category: "Actions",
        icon: <SiGithub className="w-4 h-4 text-zinc-400" />,
        action: () => window.open("https://github.com/neverida-jk", "_blank"),
      },
      {
        id: "act-linkedin",
        title: "Open LinkedIn Profile",
        category: "Actions",
        icon: <SiLinkedin className="w-4 h-4 text-zinc-400" />,
        action: () => window.open("https://linkedin.com/in/your-profile", "_blank"),
      },
      {
        id: "int-terminal",
        title: "Open Terminal CLI",
        category: "Actions",
        icon: <LuTerminal className="w-4 h-4 text-zinc-400" />,
        shortcut: "T",
        action: () => {
          if (onOpenTerminal) onOpenTerminal();
        },
      },
      {
        id: "int-sound",
        title: "Toggle Audio Effects",
        category: "Preferences",
        icon: <LuVolume2 className="w-4 h-4 text-zinc-400" />,
        action: () => {
          soundFx.toggleMute();
        },
      },
      {
        id: "int-particles",
        title: "Toggle Particle Field",
        category: "Preferences",
        icon: <LuZap className="w-4 h-4 text-zinc-400" />,
        action: () => {
          if (onToggleParticles) onToggleParticles();
        },
      },
    ],
    [onCopyEmail, onOpenTerminal, onToggleParticles, scrollToSection]
  );

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.shortcut?.toLowerCase().includes(q)
    );
  }, [query, commands]);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          const evt = new CustomEvent("open-command-palette");
          window.dispatchEvent(evt);
        }
      }

      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        soundFx.playKey();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        soundFx.playKey();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          soundFx.playClick(1000);
          filteredCommands[selectedIndex].action();
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, filteredCommands, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[150] flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-md animate-fade-in-fast"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg glass-panel rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl animate-modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar */}
        <div className="flex items-center px-4 py-3 border-b border-white/[0.06] bg-zinc-950/60">
          <LuSearch className="w-4 h-4 text-zinc-500 mr-2.5 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search commands or sections..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              soundFx.playKey();
            }}
            className="w-full bg-transparent text-white placeholder-zinc-500 text-xs sm:text-sm outline-none font-rubik"
          />
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] text-zinc-400 bg-zinc-900 border border-white/[0.08] rounded font-mono">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[50vh] overflow-y-auto p-1.5 space-y-0.5 scrollbar-hide">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 text-xs font-mono">
              No matching commands
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  onClick={() => {
                    soundFx.playClick(1000);
                    cmd.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                    isSelected
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-300 hover:bg-zinc-900/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {cmd.icon}
                    <div>
                      <div className="text-xs font-medium font-rubik text-zinc-200">
                        {cmd.title}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        {cmd.category}
                      </div>
                    </div>
                  </div>

                  {cmd.shortcut && (
                    <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-white/[0.06] rounded">
                      {cmd.shortcut}
                    </kbd>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-3.5 py-2 border-t border-white/[0.06] bg-zinc-950/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <div className="flex items-center gap-3">
            <span>&uarr;&darr; navigate</span>
            <span>&crarr; select</span>
          </div>
          <span>jake.dev</span>
        </div>
      </div>
    </div>
  );
}
