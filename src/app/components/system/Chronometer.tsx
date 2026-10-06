"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { soundFx } from "@/util/sound";
import { SECTION_IDS, useActiveSection, type SectionId } from "@/lib/useActiveSection";

const SECTION_LABELS: Record<SectionId, string> = {
  hero: "About",
  journey: "Journey",
  work: "Work",
  toolkit: "Skills",
  beyond: "Beyond",
  contact: "Contact",
};

// The page reads as a timeline; the rail says where on it you are.
const ERA: Record<SectionId, string> = {
  hero: "Now",
  journey: "Then",
  work: "Shipped",
  toolkit: "Tools",
  beyond: "Off the clock",
  contact: "Next",
};

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

// Fixed rail (desktop): a small dial whose hand makes exactly one turn from
// the top of the page to the bottom, the era you're in, and a tick per
// section. Mobile gets a 2px top progress bar instead (same component, one
// scroll subscription).
export default function Chronometer() {
  const { scrollYProgress } = useScroll();
  const activeId = useActiveSection();
  const [offsets, setOffsets] = useState<Record<string, number>>({});
  const handRef = useRef<SVGLineElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const lastWaypoint = useRef<string | null>(null);

  useEffect(() => {
    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const next: Record<string, number> = {};
      SECTION_IDS.forEach((id) => {
        const el = document.getElementById(id);
        if (el) next[id] = Math.min(1, Math.max(0, (el.getBoundingClientRect().top + window.scrollY) / max));
      });
      setOffsets(next);
    };

    measure();
    // Re-measure when the page's height changes (images, fonts, tall
    // sections settling), or the ticks drift away from their sections.
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    handRef.current?.setAttribute("transform", `rotate(${(p * 360).toFixed(1)} 22 22)`);
  });

  useEffect(() => {
    if (lastWaypoint.current !== null && lastWaypoint.current !== activeId) {
      soundFx.tick();
      // Only after a real tap/click; browsers reject (and warn on) vibrate
      // calls that arrive without user activation.
      if (navigator.userActivation?.hasBeenActive) navigator.vibrate?.(8);
    }
    lastWaypoint.current = activeId;
  }, [activeId]);

  return (
    <>
      {/* Mobile: slim top progress bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-[2px] bg-line" aria-hidden="true" data-print-hide>
        <motion.div className="h-full bg-summit origin-left" style={{ scaleX: scrollYProgress }} />
      </div>

      {/* Desktop: dial + vertical rail */}
      <div
        className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-2"
        aria-hidden="true"
        data-print-hide
      >
        <svg width={44} height={44} viewBox="0 0 44 44" fill="none">
          <circle cx={22} cy={22} r={20} stroke="var(--color-line)" strokeWidth={1.2} />
          <circle cx={22} cy={22} r={16} stroke="var(--color-ink-3)" strokeWidth={4} strokeDasharray="1 7.38" />
          <line ref={handRef} x1={22} y1={22} x2={22} y2={7} stroke="var(--color-summit)" strokeWidth={2} strokeLinecap="round" transform="rotate(0 22 22)" />
          <circle cx={22} cy={22} r={2.4} fill="var(--color-summit)" />
        </svg>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-2">{ERA[activeId]}</span>

        <div className="relative mt-1 h-52 w-px bg-line">
          <motion.div
            className="absolute top-0 left-0 w-px bg-summit origin-top"
            style={{ height: "100%", scaleY: scrollYProgress }}
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
                  layoutId={isActive ? "chronometerActive" : undefined}
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
