"use client";

import React from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { stagger as staggerTokens } from "@/lib/motion";

interface RevealTextProps {
  text: string;
  className?: string;
  /** Split by "word" (default) or "char" — use "char" sparingly (H1s only, §8.1). */
  split?: "word" | "char";
  stagger?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

// Per-glyph/word mask reveal (§8.1). The wrapping element carries the real
// text as aria-label so screen readers get one clean sentence; every inner
// span is aria-hidden so it's never read twice or word-by-word.
export default function RevealText({
  text,
  className,
  split = "word",
  stagger = staggerTokens.tight,
  as = "span",
}: RevealTextProps) {
  const reduceMotion = useReducedMotion();
  const Tag = motion[as];
  const pieces = split === "char" ? Array.from(text) : text.split(" ");

  if (reduceMotion) {
    return (
      <Tag className={className} aria-label={text}>
        {text}
      </Tag>
    );
  }

  return (
    <Tag className={className} aria-label={text}>
      {pieces.map((piece, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="inline-block overflow-hidden align-top"
          style={{ paddingBottom: "0.08em", marginBottom: "-0.08em" }}
        >
          <motion.span
            className="inline-block"
            initial={{ y: "105%" }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * stagger, ease: [0.16, 1, 0.3, 1] }}
          >
            {piece === " " ? " " : piece}
            {split === "word" && i < pieces.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
