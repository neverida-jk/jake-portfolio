"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { soundFx } from "@/util/sound";
import { useActiveSection } from "@/lib/useActiveSection";
import { LuVolume2, LuVolumeX, LuUser, LuRoute, LuFolder, LuWrench, LuMail } from "react-icons/lu";

// The command palette (Cmd+K) and the terminal are still reachable from the
// keyboard and from Beyond the Resume — they just aren't in the bar anymore.
const TRIPLE_CLICK_WINDOW_MS = 500;

// §4: Beyond the Resume is deliberately absent — it's a reward for
// scrolling, not a nav destination.
const NAV_LINKS = [
  { id: "hero", label: "About", Icon: LuUser },
  { id: "journey", label: "Journey", Icon: LuRoute },
  { id: "work", label: "Work", Icon: LuFolder },
  { id: "toolkit", label: "Skills", Icon: LuWrench },
  { id: "contact", label: "Contact", Icon: LuMail },
];

// Sections without their own nav entry highlight their neighbour.
const DOCK_ALIAS: Record<string, string> = { testimonials: "toolkit", beyond: "contact" };

// A full-width bar: invisible at the top of the page, a hairline and a
// solid backing once you scroll. Numbered links (like hours on a dial) with
// a gold underline that slides to the section you're in; unframed utilities
// on the right. On phones the links live in a thumb-reach dock at the bottom.
export default function Navbar() {
  const activeSection = useActiveSection();
  const [isMuted, setIsMuted] = useState<boolean>(true);
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

  const handleNavClick = useCallback((e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    soundFx.playClick(900);
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
        scrolled ? "border-b border-line bg-canvas/90" : "border-b border-transparent bg-transparent"
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
        </div>
      </nav>

      {/* Phones: a dock at the bottom, where the thumb already is. */}
      <nav
        aria-label="Sections"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-canvas/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
        data-print-hide
      >
        <ol className="grid grid-cols-5">
          {NAV_LINKS.map(({ id, label, Icon }) => {
            const on = (DOCK_ALIAS[activeSection] ?? activeSection) === id;
            return (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={(e) => handleNavClick(e, id)}
                  aria-current={on ? "true" : undefined}
                  className={`relative flex flex-col items-center gap-1 pb-2 pt-2.5 font-mono text-[10px] transition-colors ${on ? "text-summit" : "text-ink-3"}`}
                >
                  {on && <span className="absolute inset-x-5 top-0 h-px bg-summit" aria-hidden="true" />}
                  <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                  {label}
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    </header>
  );
}
