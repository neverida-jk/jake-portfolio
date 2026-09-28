"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { spring } from "@/lib/motion";

const PULL = 0.28;
const CLAMP = 14;

function clamp(n: number, max: number) {
  return Math.max(-max, Math.min(max, n));
}

// Magnetic hover (§8.2) — wrap a primary CTA. Desktop + fine pointer only;
// on touch devices it's a no-op wrapper.
export default function Magnetic({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, spring.smooth);
  const y = useSpring(rawY, spring.smooth);

  if (reduceMotion || typeof window !== "undefined" && !window.matchMedia("(pointer: fine)").matches) {
    return <div className={className}>{children}</div>;
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    rawX.set(clamp((e.clientX - cx) * PULL, CLAMP));
    rawY.set(clamp((e.clientY - cy) * PULL, CLAMP));
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
