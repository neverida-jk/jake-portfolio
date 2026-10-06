"use client";

import React, { useEffect, useRef } from "react";
import { subscribeFrame } from "@/lib/ticker";
import { getWarp } from "@/lib/timeWarp";
import { useReducedMotion } from "@/lib/useReducedMotion";

// The page's backdrop: concentric tick rings, like the bezels of a huge
// orrery, turning at different speeds behind everything. Scroll warp
// (timeWarp.ts) speeds them up and eases them back, so the whole page feels
// like it is being scrubbed through time.
//
// Each ring is its own SVG layer rotated with a CSS transform on a promoted
// layer: it is rasterised once and the compositor turns it, so a turning ring
// costs no repaint. (Rotating an SVG <g> attribute instead repaints the whole
// SVG every frame.)
const TICK = 1.6;

const RINGS = [
  { r: 250, speed: 1.1, warp: 0.3, opacity: 0.2, bead: true },
  { r: 400, speed: -0.7, warp: -0.22, opacity: 0.15, bead: false },
  { r: 560, speed: 0.5, warp: 0.16, opacity: 0.12, bead: true },
  { r: 750, speed: -0.34, warp: -0.1, opacity: 0.09, bead: false },
].map((ring, i) => {
  const c = 2 * Math.PI * ring.r;
  const n = Math.round(c / 22);
  const seg = c / n;
  return { ...ring, start: i * 37, dash: `${TICK} ${(seg - TICK).toFixed(3)}`, box: 2 * ring.r + 24 };
});

export default function TimeField() {
  const reduce = useReducedMotion();
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (reduce) return;
    const t0 = performance.now();
    return subscribeFrame((now) => {
      const t = (now - t0) / 1000;
      const w = getWarp();
      RINGS.forEach((ring, i) => {
        const deg = ring.start + ring.speed * t + ring.warp * w;
        const el = refs.current[i];
        if (el) el.style.transform = `translate(-50%, -50%) rotate(${deg.toFixed(2)}deg)`;
      });
    });
  }, [reduce]);

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-50 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 90% 70% at 62% 38%, rgba(20,28,58,0.55) 0%, rgba(7,11,20,0) 70%), linear-gradient(180deg, #04060C 0%, #070B14 55%, #0A0D18 100%)",
      }}
      aria-hidden="true"
      data-print-hide
    >
      {RINGS.map((ring, i) => {
        // Sized against the larger viewport side so the rings fill any aspect.
        const size = `calc(max(100vw, 100vh) * ${(ring.box / 1000).toFixed(3)})`;
        const c = ring.box / 2;
        return (
          <div
            key={ring.r}
            ref={(el) => {
              refs.current[i] = el;
            }}
            className="absolute left-1/2 top-1/2"
            style={{
              width: size,
              height: size,
              opacity: ring.opacity,
              willChange: "transform",
              transform: `translate(-50%, -50%) rotate(${ring.start}deg)`,
            }}
          >
            <svg viewBox={`0 0 ${ring.box} ${ring.box}`} className="block h-full w-full" fill="none">
              <circle cx={c} cy={c} r={ring.r} stroke="var(--color-ink-2)" strokeWidth={0.8} />
              <circle cx={c} cy={c} r={ring.r} stroke="var(--color-ink)" strokeWidth={9} strokeDasharray={ring.dash} />
              {ring.bead && <circle cx={c + ring.r} cy={c} r={5} fill="var(--color-summit)" />}
            </svg>
          </div>
        );
      })}
    </div>
  );
}
