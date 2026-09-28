"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { soundFx } from "@/util/sound";
import { useActiveSection } from "@/lib/useActiveSection";
import {
  LuTerminal,
  LuCommand,
  LuVolume2,
  LuVolumeX,
  LuCopy,
  LuMenu,
  LuX,
} from "react-icons/lu";

interface NavbarProps {
  onOpenCommandPalette?: () => void;
  onOpenTerminal?: () => void;
  onCopyEmail?: () => void;
}

export default function Navbar({
  onOpenCommandPalette,
  onOpenTerminal,
  onCopyEmail,
}: NavbarProps) {
  const activeSection = useActiveSection();
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    setIsMuted(soundFx.getIsMuted());
  }, []);

  const handleNavClick = useCallback(
    (e: React.MouseEvent, sectionId: string) => {
      e.preventDefault();
      soundFx.playClick(900);
      setIsMobileMenuOpen(false);

      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    },
    []
  );

  const handleToggleSound = useCallback(() => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
  }, []);

  // §4: Beyond the Resume is deliberately absent — it's a reward for
  // scrolling, not a nav destination.
  const navLinks = [
    { id: "hero", label: "About" },
    { id: "journey", label: "Journey" },
    { id: "work", label: "Work" },
    { id: "toolkit", label: "Skills" },
    { id: "approach", label: "Approach" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-2xl">
      <nav className="glass-dock rounded-full px-3 py-1.5 flex items-center justify-between shadow-lg transition-all duration-300">
        {/* Brand */}
        <a
          href="#hero"
          onClick={(e) => handleNavClick(e, "hero")}
          className="flex items-center gap-2 pl-2 pr-2.5 py-1 group rounded-full text-zinc-200 font-sans font-semibold text-xs tracking-tight"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="group-hover:text-white transition-colors">
            jake<span className="text-zinc-500 font-normal">.dev</span>
          </span>
        </a>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-0.5">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => handleNavClick(e, link.id)}
                className={`relative px-3 py-1 rounded-full text-xs font-medium font-sans transition-colors duration-150 ${
                  isActive ? "text-white" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="navActivePill"
                    className="absolute inset-0 rounded-full bg-zinc-800/80 -z-10"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                {link.label}
              </a>
            );
          })}
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-1">
          {/* Terminal */}
          <motion.button
            onClick={() => {
              soundFx.playClick(1000);
              if (onOpenTerminal) onOpenTerminal();
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
            title="Terminal CLI"
            className="p-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-white/[0.06]"
          >
            <LuTerminal className="w-3.5 h-3.5" />
          </motion.button>

          {/* Command Palette */}
          <motion.button
            onClick={() => {
              soundFx.playClick(900);
              if (onOpenCommandPalette) onOpenCommandPalette();
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
            title="Command Palette (Cmd+K)"
            className="p-1.5 sm:px-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-white/[0.06] flex items-center gap-1 text-xs font-mono"
          >
            <LuCommand className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">K</span>
          </motion.button>

          {/* Sound Toggle */}
          <motion.button
            onClick={handleToggleSound}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9, rotate: -15 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
            title={isMuted ? "Unmute audio" : "Mute audio"}
            className="p-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-white/[0.06]"
          >
            {isMuted ? (
              <LuVolumeX className="w-3.5 h-3.5 text-zinc-500" />
            ) : (
              <LuVolume2 className="w-3.5 h-3.5 text-zinc-300" />
            )}
          </motion.button>

          {/* Mobile Menu Toggle */}
          <motion.button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={{ scale: 0.85 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
            className="md:hidden p-1.5 rounded-full bg-zinc-900/80 text-zinc-300 border border-white/[0.06]"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? (
              <LuX className="w-3.5 h-3.5" />
            ) : (
              <LuMenu className="w-3.5 h-3.5" />
            )}
          </motion.button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-2 glass-panel rounded-2xl p-2 border border-white/[0.08] shadow-2xl animate-modal-enter space-y-0.5">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => handleNavClick(e, link.id)}
              className={`block px-3.5 py-2 rounded-xl text-xs font-medium font-sans ${
                activeSection === link.id
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              {link.label}
            </a>
          ))}

          <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between px-2 text-xs">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (onOpenTerminal) onOpenTerminal();
              }}
              className="py-1.5 px-2 text-zinc-300 hover:text-white font-mono flex items-center gap-1.5"
            >
              <LuTerminal className="w-3 h-3 text-emerald-400" />
              <span>Terminal</span>
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (onCopyEmail) onCopyEmail();
              }}
              className="py-1.5 px-2 text-zinc-300 hover:text-white font-sans flex items-center gap-1.5"
            >
              <LuCopy className="w-3 h-3 text-emerald-400" />
              <span>Copy Email</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
