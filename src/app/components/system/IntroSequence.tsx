"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { manilaAngles, manilaClockText } from "@/lib/manilaClock";

// The opening (first visit per session, ~2.4s): a dial draws itself, the
// hands spin through the years from 2022 to now, and the readout lands on the
// real time in Makati before the camera flies through the dial into the site.
//
// Visibility is decided before first paint by the inline script in
// layout.tsx: it adds `intro-seen` to <html> for repeat visits and for
// reduced-motion users, and CSS hides this overlay under that class. So it
// is server-rendered (no flash of the page before it), never shown to
// people who shouldn't see it, and has a CSS failsafe if JS never runs.
//
// Transform/opacity only (plus the rim's stroke draw) — no filters, no
// blend modes — so it stays at 60fps on ordinary phones.

export const INTRO_KEY = "jake.intro.seen";
export const INTRO_REVEAL_EVENT = "ascent:intro-reveal";

const FIRST_YEAR = 2022;
const LAST_YEAR = 2026;
const TURNS = 5; // minute-hand revolutions during the time-lapse
const DRAW_END = 1.45; // s — hands have landed on the real time
const ZOOM_AT = 1.7; // s — fly-through begins
const TICKS = Array.from({ length: 60 }, (_, i) => i);

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const rot = (deg: number) => `rotate(${deg.toFixed(2)} 500 500)`;

export default function IntroSequence() {
  const [phase, setPhase] = useState<"run" | "done">("run");
  const stage = useAnimationControls();
  const veil = useAnimationControls();
  const yearRef = useRef<HTMLSpanElement>(null);
  const minRef = useRef<SVGGElement>(null);
  const hourRef = useRef<SVGGElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const zooming = useRef(false);

  useEffect(() => {
    const root = document.documentElement;
    if (root.classList.contains("intro-seen")) {
      setPhase("done");
      return;
    }

    const real = manilaAngles();
    const timeText = manilaClockText();
    let raf = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const reveal = () => window.dispatchEvent(new Event(INTRO_REVEAL_EVENT));

    const land = () => {
      if (yearRef.current) yearRef.current.textContent = String(LAST_YEAR);
      minRef.current?.setAttribute("transform", rot(real.minute));
      hourRef.current?.setAttribute("transform", rot(real.hour));
      if (labelRef.current) labelRef.current.textContent = `Now · ${timeText} · Makati`;
    };

    const zoomThrough = async (fast: boolean) => {
      if (zooming.current) return;
      zooming.current = true;
      timers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
      land();
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

    // The time-lapse: hands race around and land exactly on the real time,
    // the year ticks up with them. Written straight to the DOM.
    const endMinute = real.minute + 360 * TURNS;
    const start = performance.now() + 150;
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / ((DRAW_END - 0.15) * 1000)));
      const e = easeOutExpo(t);
      const minute = endMinute * e;
      minRef.current?.setAttribute("transform", rot(minute));
      hourRef.current?.setAttribute("transform", rot(real.hour - (endMinute - minute) / 12));
      if (yearRef.current) yearRef.current.textContent = String(Math.floor(FIRST_YEAR + (LAST_YEAR - FIRST_YEAR) * e));
      if (t < 1) raf = requestAnimationFrame(tick);
      else land();
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
          {/* Soft glow behind the dial — a gradient, not a blur filter. */}
          <motion.div
            className="absolute inset-[14%] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,180,84,0.22) 0%, rgba(255,180,84,0.07) 40%, rgba(255,180,84,0) 70%)",
            }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] } }}
          />

          <svg viewBox="0 0 1000 1000" className="absolute inset-0 h-full w-full" fill="none">
            <motion.circle
              cx={500}
              cy={500}
              r={470}
              stroke="var(--color-ink-2)"
              strokeOpacity={0.7}
              strokeWidth={2}
              transform="rotate(-90 500 500)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            />
            {TICKS.map((i) => (
              <g key={i} transform={rot(i * 6)}>
                <line
                  x1={500}
                  y1={30}
                  x2={500}
                  y2={i % 5 === 0 ? 70 : 50}
                  stroke="var(--color-ink-2)"
                  strokeOpacity={i % 5 === 0 ? 0.9 : 0.45}
                  strokeWidth={i % 5 === 0 ? 3 : 1.6}
                  strokeLinecap="round"
                  style={{ animation: "dial-tick 0.4s ease-out backwards", animationDelay: `${0.15 + i * 0.012}s` }}
                />
              </g>
            ))}
            <g ref={hourRef} transform={rot(0)}>
              <line x1={500} y1={500} x2={500} y2={300} stroke="var(--color-ink)" strokeWidth={10} strokeLinecap="round" />
            </g>
            <g ref={minRef} transform={rot(0)}>
              <line x1={500} y1={500} x2={500} y2={150} stroke="var(--color-summit)" strokeWidth={5} strokeLinecap="round" />
            </g>
            <circle cx={500} cy={500} r={12} fill="var(--color-summit)" />
          </svg>
        </div>

        <div className="-mt-6 flex flex-col items-center">
          <span ref={labelRef} className="font-mono text-[0.6875rem] uppercase tracking-[0.28em] text-ink-3">
            Time
          </span>
          <span className="mt-2 font-display text-[clamp(3.5rem,11vw,6.5rem)] leading-none tracking-[-0.03em] text-ink tabular-nums">
            <span ref={yearRef}>{FIRST_YEAR}</span>
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
