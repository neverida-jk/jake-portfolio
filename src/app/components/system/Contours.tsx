"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { ease } from "@/lib/motion";

// Topographic contour generator (§3.3). Produces nested closed rings around
// a peak — like elevation lines on a trail map. Each ring shares the same
// underlying terrain harmonics (so the rings read as one landform) with a
// slow drift outward, and the peak's centre wanders a little per ring.
//
// Hydration safety: the rings are computed during render on both server
// and client, so every coordinate is rounded to 1 decimal place — tiny
// floating-point differences between the Node and browser Math builds
// can't survive the rounding and cause an attribute mismatch.

function mulberry32(seed: number) {
  let t = seed;
  return () => {
    t |= 0;
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = (n: number) => Math.round(n * 10) / 10;

// Closed Catmull-Rom spline through the points, emitted as cubic beziers,
// so the rings are smooth curves rather than polygons.
function smoothClosedPath(pts: [number, number][]) {
  const n = pts.length;
  let d = `M${r1(pts[0][0])},${r1(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C${r1(c1x)},${r1(c1y)} ${r1(c2x)},${r1(c2y)} ${r1(p2[0])},${r1(p2[1])}`;
  }
  return `${d}Z`;
}

export function contourRings({
  seed,
  rings,
  cx,
  cy,
  r0,
  dr,
  points = 48,
}: {
  seed: number;
  rings: number;
  cx: number;
  cy: number;
  r0: number;
  dr: number;
  points?: number;
}) {
  const rand = mulberry32(seed);
  const harmonics = [2, 3, 5, 7].map((k, idx) => ({
    k,
    amp: [0.085, 0.055, 0.03, 0.016][idx] * (0.7 + rand() * 0.6),
    phase: rand() * Math.PI * 2,
    drift: (rand() - 0.5) * 0.35,
  }));
  const driftX = (rand() - 0.5) * 9;
  const driftY = (rand() - 0.5) * 9;

  return Array.from({ length: rings }, (_, ring) => {
    const r = r0 + ring * dr;
    // Outer rings wander more — terrain gets less regular away from a peak.
    const rough = 1 + ring * 0.14;
    const ccx = cx + ring * driftX;
    const ccy = cy + ring * driftY;
    const pts: [number, number][] = [];
    for (let i = 0; i < points; i++) {
      const a = (i / points) * Math.PI * 2;
      let w = 0;
      for (const h of harmonics) w += h.amp * rough * Math.sin(h.k * a + h.phase + h.drift * ring);
      const rr = r * (1 + w);
      pts.push([ccx + rr * Math.cos(a), ccy + rr * Math.sin(a)]);
    }
    return smoothClosedPath(pts);
  });
}

interface ContoursProps {
  seed?: number;
  rings?: number;
  /** Peak position inside the 1000x1000 viewBox. */
  cx?: number;
  cy?: number;
  r0?: number;
  dr?: number;
  /** Draw the rings in (innermost first) on mount. */
  draw?: boolean;
  drawDelay?: number;
  /** Innermost ring in summit gold — the peak. */
  summitRing?: boolean;
  className?: string;
}

export default function Contours({
  seed = 2954,
  rings = 9,
  cx = 640,
  cy = 420,
  r0 = 46,
  dr = 44,
  draw = false,
  drawDelay = 0,
  summitRing = true,
  className = "",
}: ContoursProps) {
  const reduceMotion = useReducedMotion();
  const paths = useMemo(
    () => contourRings({ seed, rings, cx, cy, r0, dr }),
    [seed, rings, cx, cy, r0, dr]
  );
  const animate = draw && !reduceMotion;

  return (
    <svg
      className={`pointer-events-none ${className}`}
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      fill="none"
    >
      {paths.map((d, i) => {
        const isPeak = summitRing && i === 0;
        // Fade outward: the peak is the clearest line, the foothills whisper.
        const opacity = isPeak ? 0.55 : Math.max(0.05, 0.22 - i * 0.02);
        return (
          <motion.path
            key={i}
            d={d}
            stroke={isPeak ? "var(--color-summit)" : "var(--color-ink-2)"}
            strokeOpacity={opacity}
            strokeWidth={isPeak ? 1.4 : 1}
            vectorEffect="non-scaling-stroke"
            initial={animate ? { pathLength: 0 } : false}
            animate={animate ? { pathLength: 1 } : undefined}
            transition={
              animate
                ? { duration: 1.6, delay: drawDelay + i * 0.07, ease: ease.out }
                : undefined
            }
          />
        );
      })}
    </svg>
  );
}
