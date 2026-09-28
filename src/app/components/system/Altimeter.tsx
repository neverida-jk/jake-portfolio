"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { soundFx } from "@/util/sound";
import { SECTION_IDS, useActiveSection, type SectionId } from "@/lib/useActiveSection";

const SUMMIT_METRES = 2954;

const SECTION_LABELS: Record<SectionId, string> = {
  hero: "About",
  journey: "Journey",
  work: "Work",
  toolkit: "Skills",
  approach: "Approach",
  beyond: "Beyond",
  contact: "Contact",
};

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

// Fixed altitude rail (§5.3) — desktop only; mobile gets a 2px top progress
// bar instead (rendered by this same component, toggled via Tailwind
// breakpoints so there's exactly one scroll subscription either way).
export default function Altimeter() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const springProgress = useSpring(scrollYProgress, { stiffness: 58, damping: 22, mass: 0.4 });
  // Reduced motion: track raw scroll directly — no spring lag/overshoot —
  // rather than freezing the readout, since this is a functional progress
  // indicator, not ambient motion.
  const progress = reduceMotion ? scrollYProgress : springProgress;
  const activeId = useActiveSection();
  const [offsets, setOffsets] = useState<Record<string, number>>({});
  const [metres, setMetres] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const lastWaypoint = useRef<string | null>(null);

  useEffect(() => {
    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const next: Record<string, number> = {};
      SECTION_IDS.forEach((id) => {
        const el = document.getElementById(id);
        // Document-relative top, not offsetTop (which is relative to the
        // nearest positioned ancestor).
        if (el) next[id] = Math.min(1, Math.max(0, (el.getBoundingClientRect().top + window.scrollY) / max));
      });
      setOffsets(next);
    };

    measure();
    // Re-measure whenever the page's height changes (images, fonts, tall
    // sections settling), not just on window resize — otherwise the ticks
    // drift away from the sections they mark.
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useMotionValueEvent(progress, "change", (latest) => {
    setMetres(Math.round(latest * SUMMIT_METRES));
  });

  useEffect(() => {
    if (lastWaypoint.current !== null && lastWaypoint.current !== activeId) {
      soundFx.playClick(1200, "sine", 0.05);
      // Only after a real tap/click; browsers reject (and warn on) vibrate
      // calls that arrive without user activation.
      if (navigator.userActivation?.hasBeenActive) navigator.vibrate?.(8);
    }
    lastWaypoint.current = activeId;
  }, [activeId]);

  return (
    <>
      {/* Mobile: slim top progress bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-[2px] bg-line" aria-hidden="true">
        <motion.div
          className="h-full bg-summit origin-left"
          style={{ scaleX: progress }}
        />
      </div>

      {/* Desktop: vertical altitude rail */}
      <div
        className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-3"
        aria-hidden="true"
      >
        <span className="font-mono text-[11px] text-ink-2 tabular-nums">
          {metres.toLocaleString("en-US")} m
        </span>

        <div className="relative w-px h-56 bg-line">
          <motion.div
            className="absolute top-0 left-0 w-px bg-summit origin-top"
            style={{ height: "100%", scaleY: progress }}
          />

          {SECTION_IDS.map((id) => {
            const offset = offsets[id] ?? 0;
            const isActive = activeId === id;
            const isHovered = hovered === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => scrollToSection(id)}
                onMouseEnter={() => setHovered(id)}
                onMouseLeave={() => setHovered(null)}
                className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-auto"
                style={{ top: `${offset * 100}%` }}
                tabIndex={-1}
              >
                <motion.span
                  layoutId={isActive ? "altimeterActive" : undefined}
                  className={`block rounded-full ${isActive ? "bg-summit ring-2 ring-summit/40" : "bg-ink-3"}`}
                  animate={{ width: isActive ? 9 : 4, height: isActive ? 9 : 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
                <motion.span
                  initial={false}
                  animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-full mr-2.5 whitespace-nowrap px-2 py-0.5 rounded-md bg-surface border border-line text-[10px] font-mono text-ink-2"
                >
                  {SECTION_LABELS[id]}
                </motion.span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
