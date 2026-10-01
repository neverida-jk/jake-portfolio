"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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

const TRIPLE_CLICK_WINDOW_MS = 500;

export default function Navbar({
  onOpenCommandPalette,
  onOpenTerminal,
  onCopyEmail,
}: NavbarProps) {
  const activeSection = useActiveSection();
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const logoClicks = useRef<number[]>([]);

  useEffect(() => {
    setIsMuted(soundFx.getIsMuted());
    // Sound can be toggled from the command palette too — stay in sync
    // regardless of where the mute state actually changed.
    const onSoundChanged = (e: Event) => setIsMuted((e as CustomEvent<boolean>).detail);
    window.addEventListener("sound-changed", onSoundChanged);
    return () => window.removeEventListener("sound-changed", onSoundChanged);
  }, []);

  const handleNavClick = useCallback(
    (e: React.MouseEvent, sectionId: string) => {
      e.preventDefault();
      soundFx.playClick(900);
      setIsMobileMenuOpen(false);

      const el = document.getElementById(sectionId);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      }
    },
    []
  );

  const handleToggleSound = useCallback(() => {
    soundFx.toggleMute();
  }, []);

  // Easter egg #3 (opt-in, hidden): triple-click the wordmark for a tiny
  // build-info toast. Never blocks the normal single-click nav-home action.
  const [showBuildInfo, setShowBuildInfo] = useState(false);
  const handleLogoClick = useCallback((e: React.MouseEvent) => {
    handleNavClick(e, "hero");
    const now = Date.now();
    logoClicks.current = [...logoClicks.current, now].filter((t) => now - t < TRIPLE_CLICK_WINDOW_MS);
    if (logoClicks.current.length >= 3) {
      logoClicks.current = [];
      setShowBuildInfo(true);
      setTimeout(() => setShowBuildInfo(false), 4000);
    }
  }, [handleNavClick]);

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
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-2xl" data-print-hide>
      <nav className="glass-dock rounded-full px-3 py-1.5 flex items-center justify-between shadow-lg transition-all duration-300">
        {/* Brand */}
        <a
          href="#hero"
          onClick={handleLogoClick}
          className="relative flex items-center gap-2 pl-2 pr-2.5 py-1 group rounded-full text-ink font-sans font-semibold text-xs tracking-tight"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-moss" />
          <span className="group-hover:text-ink transition-colors">
            jake<span className="text-ink-3 font-normal">.dev</span>
          </span>
          {showBuildInfo && (
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-full left-0 mt-2 whitespace-nowrap rounded-lg border border-line bg-raised px-2.5 py-1.5 text-[10px] font-mono text-ink-2 shadow-[var(--e2)]"
            >
              build {process.env.NEXT_PUBLIC_BUILD_ID ?? "local"} &bull; next 15 &bull; react 19
            </motion.span>
          )}
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
                  isActive ? "text-ink" : "text-ink-3 hover:text-ink-2"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="navActivePill"
                    className="absolute inset-0 rounded-full bg-raised -z-10"
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
            className="p-1.5 rounded-full bg-raised/80 hover:bg-raised text-ink-3 hover:text-ink-2 border border-line cursor-pointer"
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
            className="p-1.5 sm:px-2 rounded-full bg-raised/80 hover:bg-raised text-ink-3 hover:text-ink-2 border border-line flex items-center gap-1 text-xs font-mono cursor-pointer"
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
            aria-pressed={!isMuted}
            className="p-1.5 rounded-full bg-raised/80 hover:bg-raised text-ink-3 hover:text-ink-2 border border-line cursor-pointer"
          >
            {isMuted ? (
              <LuVolumeX className="w-3.5 h-3.5 text-ink-3" />
            ) : (
              <LuVolume2 className="w-3.5 h-3.5 text-moss" />
            )}
          </motion.button>

          {/* Mobile Menu Toggle */}
          <motion.button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={{ scale: 0.85 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
            className="md:hidden p-1.5 rounded-full bg-raised/80 text-ink-2 border border-line cursor-pointer"
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
        <div className="md:hidden mt-2 glass-panel rounded-2xl p-2 animate-modal-enter space-y-0.5">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => handleNavClick(e, link.id)}
              className={`block px-3.5 py-2 rounded-xl text-xs font-medium font-sans ${
                activeSection === link.id
                  ? "bg-raised text-ink"
                  : "text-ink-2 hover:bg-raised/60 hover:text-ink"
              }`}
            >
              {link.label}
            </a>
          ))}

          <div className="pt-2 border-t border-line flex items-center justify-between px-2 text-xs">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (onOpenTerminal) onOpenTerminal();
              }}
              className="py-1.5 px-2 text-ink-2 hover:text-ink font-mono flex items-center gap-1.5 cursor-pointer"
            >
              <LuTerminal className="w-3 h-3 text-moss" />
              <span>Terminal</span>
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (onCopyEmail) onCopyEmail();
              }}
              className="py-1.5 px-2 text-ink-2 hover:text-ink font-sans flex items-center gap-1.5 cursor-pointer"
            >
              <LuCopy className="w-3 h-3 text-moss" />
              <span>Copy email</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
