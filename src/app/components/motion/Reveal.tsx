"use client";

import React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { dur, ease } from "@/lib/motion";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "span" | "li";
}

// Standard scroll-reveal wrapper: opacity + a small upward drift, fires once
// (§3.4 law 4 — never re-animate on scroll-by), and collapses to a plain
// opacity fade under prefers-reduced-motion.
export default function Reveal({ children, className, delay = 0, y = 16, as = "div" }: RevealProps) {
  const reduceMotion = useReducedMotion();

  const variants: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : y },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? dur.sm : dur.reveal, delay, ease: ease.out },
    },
  };

  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-12% 0px" }}
      variants={variants}
    >
      {children}
    </MotionTag>
  );
}
