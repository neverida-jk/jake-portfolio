"use client";

import React from "react";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

// Deterministic PRNG (mulberry32) — pure 32-bit integer ops only, so it
// produces the exact same sequence on server and client. Math.sin-based
// "seeded" randomness looked deterministic but wasn't: sin's argument
// reduction for large inputs can differ at the ULP level between the
// Node and browser V8 builds, which showed up as a real hydration
// mismatch (§3.3 — "seeded, not Math.random at render").
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

const STAR_COUNT = 40;
const randStar = mulberry32(20260601);
const STARS = Array.from({ length: STAR_COUNT }, () => ({
  x: randStar() * 100,
  y: randStar() * 55,
  size: 1 + randStar() * 0.9,
}));

// Hand-authored mountain silhouettes, three depths. Plain static paths —
// deterministic by construction, no randomness needed.
const RIDGE_FAR =
  "M0,230 L120,160 L220,200 L340,120 L460,190 L600,130 L720,185 L860,140 L1000,200 L1140,160 L1280,210 L1280,320 L0,320 Z";
const RIDGE_MID =
  "M0,265 L160,205 L300,245 L420,175 L560,235 L700,185 L840,240 L980,195 L1120,250 L1280,215 L1280,320 L0,320 Z";
const RIDGE_NEAR =
  "M0,292 L140,252 L280,287 L440,237 L600,282 L760,242 L920,287 L1080,247 L1280,282 L1280,320 L0,320 Z";

// Fixed, decorative, behind everything (§5.1). One scroll-linked layer for
// the whole site — sky gradient, sun, seeded stars, three parallax ridges.
export default function AscentSky() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const spring = useSpring(scrollYProgress, { stiffness: 58, damping: 22, mass: 0.4 });
  const fixedProgress = useMotionValue(0.5);
  const p = reduceMotion ? fixedProgress : spring;

  const top = useTransform(p, [0, 0.35, 0.62, 0.85, 1], ["#04060C", "#070F22", "#141230", "#241730", "#2A1A28"]);
  const bottom = useTransform(p, [0, 0.35, 0.62, 0.85, 1], ["#070D1A", "#0F1C38", "#2E1E3C", "#5A2F33", "#8A4A28"]);
  const bg = useMotionTemplate`linear-gradient(180deg, ${top} 0%, ${bottom} 100%)`;

  const sunY = useTransform(p, [0.55, 1], ["115vh", "38vh"]);
  const sunO = useTransform(p, [0.55, 0.8, 1], [0, 0.5, 0.9]);
  // Capped well below full brightness: at full opacity, a star landing in a
  // gap between words reads as stray punctuation.
  const starO = useTransform(p, [0, 0.5], [0.55, 0]);

  // Bounded, not proportional to raw scrollY: an unbounded -scrollY*k offset
  // flings the ridges off-screen long before the summit, which is exactly
  // where the sun needs them to crest behind. Climbing puts you above the
  // range, so the ridges *sink* a little — nearer ones more (parallax depth).
  const yFar = useTransform(p, [0, 1], [0, 18]);
  const yMid = useTransform(p, [0, 1], [0, 38]);
  const yNear = useTransform(p, [0, 1], [0, 64]);

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none" aria-hidden="true">
      <motion.div className="absolute inset-0" style={{ background: bg }} />

      <motion.div
        className="absolute left-1/2 w-[60vmin] h-[60vmin] -translate-x-1/2 rounded-full"
        style={{
          top: 0,
          y: sunY,
          opacity: reduceMotion ? 0.7 : sunO,
          willChange: "transform",
          background: "radial-gradient(circle, var(--color-summit) 0%, transparent 70%)",
          filter: "blur(40px)",
          mixBlendMode: "screen",
        }}
      />

      <motion.div className="absolute inset-0" style={{ opacity: reduceMotion ? 0 : starO }}>
        {STARS.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-ink"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
          />
        ))}
      </motion.div>

      <svg
        className="absolute bottom-0 left-0 w-full"
        style={{ height: "40vh" }}
        viewBox="0 0 1280 320"
        preserveAspectRatio="none"
      >
        {/* Atmospheric perspective: far ridges are hazy and let the sky tint
            through, near ridges are the darkest, most solid silhouettes. */}
        <motion.path
          d={RIDGE_FAR}
          fill="var(--color-raised)"
          fillOpacity={0.5}
          style={{ y: reduceMotion ? 0 : yFar, willChange: "transform" }}
        />
        <motion.path
          d={RIDGE_MID}
          fill="var(--color-surface)"
          fillOpacity={0.82}
          style={{ y: reduceMotion ? 0 : yMid, willChange: "transform" }}
        />
        <motion.path
          d={RIDGE_NEAR}
          fill="var(--color-void)"
          style={{ y: reduceMotion ? 0 : yNear, willChange: "transform" }}
        />
      </svg>
    </div>
  );
}
