"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { contourRings } from "./Contours";

// The opening (first visit per session, ~2.4s): a summit point ignites, the
// mountain maps itself in contour lines, the altitude races to 2,954 m, and
// the camera flies through the summit into the site.
//
// Visibility is decided before first paint by the inline script in
// layout.tsx: it adds `intro-seen` to <html> for repeat visits and for
// reduced-motion users, and CSS hides this overlay under that class. So it
// is server-rendered (no flash of the page before it), never shown to
// people who shouldn't see it, and has a CSS failsafe if JS never runs.
//
// Transform/opacity only (plus the rings' stroke draw) — no filters, no
// blend modes — so it stays at 60fps on ordinary phones.

export const INTRO_KEY = "jake.intro.seen";
export const INTRO_REVEAL_EVENT = "ascent:intro-reveal";

const SUMMIT = 2954;
const RINGS = contourRings({ seed: 2954, rings: 10, cx: 500, cy: 500, r0: 30, dr: 27, points: 44 });
const DRAW_END = 1.45; // s — rings finished, counter at the summit
const ZOOM_AT = 1.7; // s — fly-through begins

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

export default function IntroSequence() {
  const [phase, setPhase] = useState<"run" | "done">("run");
  const [summit, setSummit] = useState(false);
  const stage = useAnimationControls();
  const veil = useAnimationControls();
  const counterRef = useRef<HTMLSpanElement>(null);
  const zooming = useRef(false);

  useEffect(() => {
    const root = document.documentElement;
    if (root.classList.contains("intro-seen")) {
      setPhase("done");
      return;
    }

    let raf = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const reveal = () => window.dispatchEvent(new Event(INTRO_REVEAL_EVENT));

    const zoomThrough = async (fast: boolean) => {
      if (zooming.current) return;
      zooming.current = true;
      timers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
      if (counterRef.current) counterRef.current.textContent = SUMMIT.toLocaleString("en-US");
      setSummit(true);
      sessionStorage.setItem(INTRO_KEY, "1");
      reveal(); // the hero starts rising as we fly in
      const d = fast ? 0.35 : 0.7;
      await Promise.all([
        stage.start({ scale: fast ? 2.2 : 3.4, opacity: 0, transition: { duration: d, ease: [0.7, 0, 0.84, 0] } }),
        veil.start({ opacity: 0, transition: { duration: d * 0.85, delay: d * 0.15, ease: [0.4, 0, 0.2, 1] } }),
      ]);
      root.classList.add("intro-seen");
      setPhase("done");
    };

    // Hydrated late (slow device): don't hold the page hostage — go now.
    if (performance.now() > 2600) {
      zoomThrough(true);
      return;
    }

    // The climb: altitude counter, eased, written straight to the DOM.
    const start = performance.now() + 150;
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / ((DRAW_END - 0.15) * 1000)));
      if (counterRef.current) counterRef.current.textContent = Math.round(easeOutExpo(t) * SUMMIT).toLocaleString("en-US");
      if (t < 1) raf = requestAnimationFrame(tick);
      else setSummit(true);
    };
    raf = requestAnimationFrame(tick);

    stage.start({ scale: 1, rotate: 0, transition: { duration: ZOOM_AT, ease: [0.16, 1, 0.3, 1] } });
    timers.push(setTimeout(() => zoomThrough(false), ZOOM_AT * 1000));

    // Any input skips straight to the fly-through.
    const skip = () => zoomThrough(true);
    const opts = { passive: true } as const;
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip, opts);
    window.addEventListener("wheel", skip, opts);
    window.addEventListener("touchstart", skip, opts);
    return () => {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchstart", skip);
    };
  }, [stage, veil]);

  if (phase === "done") return null;

  return (
    <div className="intro-overlay fixed inset-0 z-[300] items-center justify-center" aria-hidden="true" data-print-hide>
      <motion.div className="absolute inset-0 bg-void" initial={{ opacity: 1 }} animate={veil} />

      <motion.div
        className="relative flex flex-col items-center"
        initial={{ scale: 0.86, rotate: -8, opacity: 1 }}
        animate={stage}
        style={{ willChange: "transform, opacity" }}
      >
        <div className="relative h-[min(78vmin,540px)] w-[min(78vmin,540px)]">
          {/* Soft glow behind the peak — a gradient, not a blur filter. */}
          <motion.div
            className="absolute inset-[18%] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,180,84,0.30) 0%, rgba(255,180,84,0.10) 35%, rgba(255,180,84,0) 70%)",
            }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] } }}
          />

          <svg viewBox="0 0 1000 1000" className="absolute inset-0 h-full w-full" fill="none">
            {RINGS.map((d, i) => (
              <motion.path
                key={i}
                d={d}
                stroke={i === 0 ? "var(--color-summit)" : "var(--color-ink-2)"}
                strokeOpacity={i === 0 ? 0.9 : Math.max(0.1, 0.5 - i * 0.04)}
                strokeWidth={i === 0 ? 2.4 : 1.4}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.95, delay: 0.12 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              />
            ))}
            {/* The summit point */}
            <motion.circle
              cx="500"
              cy="500"
              r="7"
              fill="var(--color-summit)"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.6, 1], opacity: 1 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: "500px 500px" }}
            />
          </svg>
        </div>

        <div className="-mt-4 flex flex-col items-center">
          <span className="font-mono text-[0.6875rem] uppercase tracking-[0.28em] text-ink-3">
            {summit ? "Summit · Mt. Apo" : "Altitude"}
          </span>
          <span className="mt-2 font-display text-[clamp(3.5rem,11vw,6.5rem)] leading-none tracking-[-0.03em] text-ink tabular-nums">
            <span ref={counterRef}>0</span>
            <span className="ml-2 text-[0.4em] text-summit">m</span>
          </span>
        </div>
      </motion.div>

      <motion.span
        className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[0.625rem] uppercase tracking-[0.2em] text-ink-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8, transition: { delay: 0.7, duration: 0.5 } }}
      >
        Click or press any key to skip
      </motion.span>
    </div>
  );
}
