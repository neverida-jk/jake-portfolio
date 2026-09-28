"use client";

import React from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

// Deterministic PRNG (mulberry32) — pure 32-bit integer ops, so server and
// client produce the same star field (no hydration mismatch).
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

const randStar = mulberry32(20260601);
const STARS = Array.from({ length: 46 }, () => ({
  x: randStar() * 100,
  y: randStar() * 100,
  size: 1 + randStar() * 0.9,
  o: 0.25 + randStar() * 0.35,
}));

// The whole climb as ONE gradient painted down the full length of the page:
// pre-dawn at the top, sunrise at the summit. It scrolls natively with the
// content, so the sky changes colour as you climb with zero JavaScript and
// zero per-frame repaints. (The previous version re-painted a full-screen
// gradient every scroll frame — the main source of scroll lag.)
const CLIMB_GRADIENT =
  "linear-gradient(180deg, #04060C 0%, #05081A 14%, #0B1530 35%, #1A1634 52%, #2A1B36 64%, #402334 80%, #5E3030 91%, #7E4428 100%)";

const RIDGES =
  "M0,230 L120,160 L220,200 L340,120 L460,190 L600,130 L720,185 L860,140 L1000,200 L1140,160 L1280,210 L1280,320 L0,320 Z";
const RIDGES_MID =
  "M0,265 L160,205 L300,245 L420,175 L560,235 L700,185 L840,240 L980,195 L1120,250 L1280,215 L1280,320 L0,320 Z";
const RIDGES_NEAR =
  "M0,292 L140,252 L280,287 L440,237 L600,282 L760,242 L920,287 L1080,247 L1280,282 L1280,320 L0,320 Z";

export default function AscentSky() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.5 });

  // The sun is the one moving element: a single small composited layer,
  // soft by gradient (no blur filter, no blend mode).
  const sunY = useTransform(p, [0.55, 1], ["115vh", "40vh"]);
  const sunO = useTransform(p, [0.55, 0.8, 1], [0, 0.55, 1]);

  return (
    <>
      {/* Sky + stars: part of the document, scrolls natively. */}
      <div
        className="pointer-events-none absolute inset-0 -z-50 overflow-hidden"
        style={{ background: CLIMB_GRADIENT }}
        aria-hidden="true"
        data-print-hide
      >
        <div className="absolute inset-x-0 top-0 h-[150vh]">
          {STARS.map((s, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-ink"
              style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, opacity: s.o }}
            />
          ))}
        </div>
      </div>

      {/* Sun + ridgeline: fixed to the viewport, behind the content. */}
      <div className="pointer-events-none fixed inset-0 -z-40 overflow-hidden" aria-hidden="true" data-print-hide>
        <motion.div
          className="absolute left-1/2 top-0 h-[70vmin] w-[70vmin] -translate-x-1/2 rounded-full"
          style={{
            y: reduceMotion ? "60vh" : sunY,
            opacity: reduceMotion ? 0.6 : sunO,
            willChange: "transform, opacity",
            background:
              "radial-gradient(circle, rgba(255,196,120,0.95) 0%, rgba(255,180,84,0.55) 18%, rgba(255,160,84,0.22) 38%, rgba(255,150,84,0.07) 56%, rgba(255,150,84,0) 70%)",
          }}
        />
        <svg
          className="absolute inset-x-0 bottom-0 h-[40vh] w-full"
          viewBox="0 0 1280 320"
          preserveAspectRatio="none"
        >
          <path d={RIDGES} fill="var(--color-raised)" fillOpacity={0.5} />
          <path d={RIDGES_MID} fill="var(--color-surface)" fillOpacity={0.82} />
          <path d={RIDGES_NEAR} fill="var(--color-void)" />
        </svg>
      </div>
    </>
  );
}
