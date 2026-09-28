"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { spring } from "@/lib/motion";

const PULL = 0.28;
const CLAMP = 14;

function clamp(n: number, max: number) {
  return Math.max(-max, Math.min(max, n));
}

// Magnetic hover (§8.2) — wrap a primary CTA. Desktop + fine pointer only.
//
// Always renders the same element on server and client; the pointer check
// happens after mount. (Branching on window.matchMedia during render made
// the server HTML and a phone's first client render disagree — a hydration
// mismatch on every touch device.)
export default function Magnetic({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [finePointer, setFinePointer] = useState(false);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, spring.smooth);
  const y = useSpring(rawY, spring.smooth);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setFinePointer(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const active = finePointer && !reduceMotion;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!active) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    rawX.set(clamp((e.clientX - (rect.left + rect.width / 2)) * PULL, CLAMP));
    rawY.set(clamp((e.clientY - (rect.top + rect.height / 2)) * PULL, CLAMP));
  };

  const handleMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
}
