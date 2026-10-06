"use client";

import React, { useEffect, useRef } from "react";
import { subscribeFrame } from "@/lib/ticker";
import { manilaAngles } from "@/lib/manilaClock";
import { getWarp } from "@/lib/timeWarp";
import { useReducedMotion } from "@/lib/useReducedMotion";

// The site's motif: a Roman-numeral dial running on live Manila time.
//  - Scrolling adds "warp" to the hands (see timeWarp.ts): they spin ahead,
//    leave faint afterimages, then a spring settles them back to real time.
//  - With `reactive`, ticks near the pointer stretch inward, like time
//    bunching up around a mass.
// The face is a static SVG, rasterised once. Each hand is its own small
// element rotated with a CSS transform on a promoted layer, driven from the
// shared ticker — so a spinning hand costs the compositor a rotate, not a
// repaint of the whole dial.

const NS = 500; // centre of the 1000x1000 face viewBox
const ROMAN = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
const TICKS = Array.from({ length: 60 }, (_, i) => i);
const R_TICK_OUTER = 30;

const MIN_GHOSTS = [0.7, 0.4];
const SEC_GHOSTS = [0.74, 0.5, 0.26]; // how far each afterimage lags the warp

const rot = (deg: number) => `rotate(${deg.toFixed(2)} ${NS} ${NS})`;

// A hand as an element in the dial's 1000-unit space: `len` above the pivot,
// `tail` below it, `w` wide.
function handStyle(len: number, tail: number, w: number): React.CSSProperties {
  const total = len + tail;
  return {
    position: "absolute",
    left: `${50 - w / 20}%`,
    bottom: `${50 - tail / 10}%`,
    width: `${w / 10}%`,
    height: `${total / 10}%`,
    transformOrigin: `50% ${((len / total) * 100).toFixed(2)}%`,
    willChange: "transform",
    borderRadius: 999,
  };
}

const HOUR = handStyle(210, 0, 9);
const MINUTE = handStyle(350, 0, 5);
const SECOND = handStyle(430, 60, 2.2);

interface DialProps {
  className?: string;
  /** Ticks stretch toward the pointer. */
  reactive?: boolean;
  /** Ticks fan in on mount. */
  fan?: boolean;
}

export default function Dial({ className = "", reactive = false, fan = false }: DialProps) {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const hourRef = useRef<HTMLDivElement>(null);
  const minRef = useRef<HTMLDivElement>(null);
  const secRef = useRef<HTMLDivElement>(null);
  const minGhosts = useRef<(HTMLDivElement | null)[]>([]);
  const secGhosts = useRef<(HTMLDivElement | null)[]>([]);
  const tickRefs = useRef<(SVGLineElement | null)[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "100px" });
    io.observe(root);

    // Pointer, as an angle around the dial (degrees from 12, clockwise).
    let pointer: { ang: number; near: boolean } | null = null;
    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const dist = Math.hypot(dx, dy);
      pointer = { ang: ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360, near: dist < r.width * 0.62 };
    };
    if (reactive && !reduce) window.addEventListener("pointermove", onMove, { passive: true });

    const scale = new Float32Array(60).fill(1);
    const turn = (el: HTMLElement | null, deg: number) => {
      if (el) el.style.transform = `rotate(${deg.toFixed(2)}deg)`;
    };

    const off = subscribeFrame(() => {
      if (!visible) return;
      const a = manilaAngles();
      const w = reduce ? 0 : getWarp();
      const sec = reduce ? Math.floor(a.second / 6) * 6 : a.second;

      turn(hourRef.current, a.hour + w / 12);
      turn(minRef.current, a.minute + w);
      turn(secRef.current, sec + w * 2.4);

      const mag = Math.min(1, Math.abs(w) / 8);
      MIN_GHOSTS.forEach((g, i) => {
        const el = minGhosts.current[i];
        if (!el) return;
        turn(el, a.minute + w * g);
        el.style.opacity = String(mag * (0.3 - i * 0.1));
      });
      SEC_GHOSTS.forEach((g, i) => {
        const el = secGhosts.current[i];
        if (!el) return;
        turn(el, sec + w * 2.4 * g);
        el.style.opacity = String(mag * (0.5 - i * 0.14));
      });

      if (reactive && !reduce) {
        let moving = false;
        for (let i = 0; i < 60; i++) {
          let target = 1;
          if (pointer?.near) {
            const d = Math.abs(((pointer.ang - i * 6 + 540) % 360) - 180);
            target = 1 + 1.1 * Math.exp(-Math.pow(d / 16, 2));
          }
          const delta = target - scale[i];
          if (Math.abs(delta) < 0.004) continue;
          moving = true;
          scale[i] += delta * 0.18;
          const base = i % 5 === 0 ? 38 : 20;
          tickRefs.current[i]?.setAttribute("y2", String(R_TICK_OUTER + base * scale[i]));
        }
        void moving;
      }
    });

    return () => {
      off();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [reactive, reduce]);

  return (
    <div ref={rootRef} className={`pointer-events-none relative ${className}`} aria-hidden="true" data-print-hide>
      <svg viewBox="0 0 1000 1000" className="absolute inset-0 h-full w-full" fill="none">
        <circle cx={NS} cy={NS} r={478} stroke="var(--color-ink-2)" strokeOpacity={0.3} strokeWidth={1.2} />
        <circle cx={NS} cy={NS} r={330} stroke="var(--color-ink-2)" strokeOpacity={0.1} strokeWidth={1} />
        <circle cx={NS} cy={NS} r={210} stroke="var(--color-ink-2)" strokeOpacity={0.07} strokeWidth={1} />

        {TICKS.map((i) => {
          const major = i % 5 === 0;
          return (
            <g key={i} transform={rot(i * 6)}>
              <line
                ref={(el) => {
                  tickRefs.current[i] = el;
                }}
                x1={NS}
                y1={R_TICK_OUTER}
                x2={NS}
                y2={R_TICK_OUTER + (major ? 38 : 20)}
                stroke={major ? "var(--color-ink)" : "var(--color-ink-2)"}
                strokeOpacity={major ? 0.6 : 0.32}
                strokeWidth={major ? 2.2 : 1.2}
                strokeLinecap="round"
                style={fan && !reduce ? { animation: "dial-tick 0.5s ease-out backwards", animationDelay: `${i * 0.018}s` } : undefined}
              />
            </g>
          );
        })}

        {ROMAN.map((n, i) => {
          const a = (i * 30 * Math.PI) / 180;
          const quarter = i % 3 === 0;
          return (
            <text
              key={n}
              x={(NS + 352 * Math.sin(a)).toFixed(1)}
              y={(NS - 352 * Math.cos(a)).toFixed(1)}
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily="var(--font-instrument-serif)"
              fontStyle="italic"
              fontSize={quarter ? 54 : 40}
              fill="var(--color-ink)"
              fillOpacity={quarter ? 0.62 : 0.34}
            >
              {n}
            </text>
          );
        })}
      </svg>

      {MIN_GHOSTS.map((_, i) => (
        <div key={`mg${i}`} ref={(el) => { minGhosts.current[i] = el; }} className="bg-ink" style={{ ...MINUTE, opacity: 0 }} />
      ))}
      {SEC_GHOSTS.map((_, i) => (
        <div key={`sg${i}`} ref={(el) => { secGhosts.current[i] = el; }} className="bg-summit" style={{ ...SECOND, opacity: 0 }} />
      ))}

      <div ref={hourRef} className="bg-ink/85" style={HOUR} />
      <div ref={minRef} className="bg-ink/90" style={MINUTE} />
      <div ref={secRef} className="bg-summit" style={SECOND} />
      <div
        className="absolute rounded-full border-2 border-ink/90 bg-canvas"
        style={{ left: "48.7%", top: "48.7%", width: "2.6%", height: "2.6%" }}
      />
    </div>
  );
}
