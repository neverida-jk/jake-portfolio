"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { soundFx } from "@/util/sound";
import { useActiveSection } from "@/lib/useActiveSection";
import { LuVolume2, LuVolumeX, LuCopy, LuMenu, LuX } from "react-icons/lu";

// The command palette (Cmd+K) and the terminal are still reachable from the
// keyboard and from Beyond the Resume — they just aren't in the bar anymore.
interface NavbarProps {
  onCopyEmail?: () => void;
}

const TRIPLE_CLICK_WINDOW_MS = 500;

// §4: Beyond the Resume is deliberately absent — it's a reward for
// scrolling, not a nav destination.
const NAV_LINKS = [
  { id: "hero", label: "About" },
  { id: "journey", label: "Journey" },
  { id: "work", label: "Work" },
  { id: "toolkit", label: "Skills" },
  { id: "contact", label: "Contact" },
];

// A full-width bar: invisible at the top of the page, a hairline and a
// solid backing once you scroll. Numbered links (like hours on a dial) with
// a gold underline that slides to the section you're in; unframed utilities
// on the right. On phones the links drop down as a numbered list.
export default function Navbar({ onCopyEmail }: NavbarProps) {
  const activeSection = useActiveSection();
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const logoClicks = useRef<number[]>([]);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  useEffect(() => {
    setIsMuted(soundFx.getIsMuted());
    // Sound can be toggled from the command palette too — stay in sync
    // regardless of where the mute state actually changed.
    const onSoundChanged = (e: Event) => setIsMuted((e as CustomEvent<boolean>).detail);
    window.addEventListener("sound-changed", onSoundChanged);
    return () => window.removeEventListener("sound-changed", onSoundChanged);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const handleNavClick = useCallback((e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    soundFx.playClick(900);
    setMenuOpen(false);
    const el = document.getElementById(sectionId);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }
  }, []);

  // Easter egg #3 (opt-in, hidden): triple-click the wordmark for a tiny
  // build-info toast. Never blocks the normal single-click nav-home action.
  const [showBuildInfo, setShowBuildInfo] = useState(false);
  const handleLogoClick = useCallback(
    (e: React.MouseEvent) => {
      handleNavClick(e, "hero");
      const now = Date.now();
      logoClicks.current = [...logoClicks.current, now].filter((t) => now - t < TRIPLE_CLICK_WINDOW_MS);
      if (logoClicks.current.length >= 3) {
        logoClicks.current = [];
        setShowBuildInfo(true);
        setTimeout(() => setShowBuildInfo(false), 4000);
      }
    },
    [handleNavClick]
  );

  const tool =
    "grid h-9 w-9 place-items-center rounded-full text-ink-3 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-summit cursor-pointer";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        menuOpen
          ? "border-b border-line bg-canvas"
          : scrolled
            ? "border-b border-line bg-canvas/90"
            : "border-b border-transparent bg-transparent"
      }`}
      data-print-hide
    >
      <nav aria-label="Main" className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Brand */}
        <a
          href="#hero"
          onClick={handleLogoClick}
          className="relative font-display text-xl italic leading-none tracking-tight text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-summit"
        >
          Jake Neverida
          {showBuildInfo && (
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute left-0 top-full mt-2 whitespace-nowrap rounded-lg border border-line bg-raised px-2.5 py-1.5 font-mono text-[10px] not-italic text-ink-2 shadow-[var(--e2)]"
            >
              build {process.env.NEXT_PUBLIC_BUILD_ID ?? "local"} &bull; next 15 &bull; react 19
            </motion.span>
          )}
        </a>

        {/* Links */}
        <ol className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link, i) => {
            const on = activeSection === link.id;
            return (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  onClick={(e) => handleNavClick(e, link.id)}
                  aria-current={on ? "true" : undefined}
                  className="relative flex items-baseline gap-1.5 px-3 py-2 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-summit"
                >
                  <span className={`text-[10px] tabular-nums transition-colors ${on ? "text-summit" : "text-ink-3/70"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={`transition-colors ${on ? "text-ink" : "text-ink-3 hover:text-ink-2"}`}>{link.label}</span>
                  {on && (
                    <motion.span
                      layoutId="navTick"
                      className="absolute inset-x-3 -bottom-px h-px bg-summit"
                      transition={{ type: "spring", stiffness: 500, damping: 38 }}
                    />
                  )}
                </a>
              </li>
            );
          })}
        </ol>

        {/* Utilities */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => soundFx.toggleMute()}
            title={isMuted ? "Unmute audio" : "Mute audio"}
            aria-label={isMuted ? "Unmute audio" : "Mute audio"}
            aria-pressed={!isMuted}
            className={tool}
          >
            {isMuted ? <LuVolumeX className="h-4 w-4" /> : <LuVolume2 className="h-4 w-4 text-moss" />}
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className={`${tool} md:hidden`}
          >
            {menuOpen ? <LuX className="h-4 w-4" /> : <LuMenu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {/* Phones: a numbered list under the bar */}
      {menuOpen && (
        <div className="animate-fade-in-fast border-t border-line md:hidden">
          <ol className="mx-auto max-w-6xl px-4 py-2 sm:px-6">
            {NAV_LINKS.map((link, i) => {
              const on = activeSection === link.id;
              return (
                <li key={link.id} className="border-b border-line last:border-b-0">
                  <a
                    href={`#${link.id}`}
                    onClick={(e) => handleNavClick(e, link.id)}
                    className="flex items-baseline gap-4 py-3.5"
                  >
                    <span className={`font-mono text-xs tabular-nums ${on ? "text-summit" : "text-ink-3"}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className={`font-display text-3xl leading-none ${on ? "text-ink" : "text-ink-2"}`}>{link.label}</span>
                  </a>
                </li>
              );
            })}
          </ol>
          <div className="mx-auto flex max-w-6xl items-center border-t border-line px-4 py-3 font-mono text-xs sm:px-6">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onCopyEmail?.();
              }}
              className="flex items-center gap-1.5 text-ink-2 hover:text-ink cursor-pointer"
            >
              <LuCopy className="h-3.5 w-3.5 text-moss" />
              Copy email
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
