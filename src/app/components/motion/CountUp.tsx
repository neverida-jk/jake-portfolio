"use client";

import React, { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring, useMotionValueEvent } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

interface CountUpProps {
  value: number;
  className?: string;
  format?: (n: number) => string;
}

const defaultFormat = (n: number) => n.toLocaleString("en-US");

// Number ticker (§8.3) — animates from 0 to `value` once it scrolls into
// view. Renders the final value immediately under reduced motion.
export default function CountUp({ value, className, format = defaultFormat }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12% 0px" });
  const reduceMotion = useReducedMotion();
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 90, damping: 22, mass: 0.8 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (inView) motionValue.set(value);
  }, [inView, value, motionValue]);

  useMotionValueEvent(spring, "change", (latest) => {
    setDisplay(Math.round(latest));
  });

  if (reduceMotion) {
    return (
      <span ref={ref} className={className}>
        {format(value)}
      </span>
    );
  }

  return (
    <span ref={ref} className={className}>
      {format(display)}
    </span>
  );
}
