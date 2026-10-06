"use client";

// What people say. Rendered only when src/content/copy/testimonials.ts has
// real quotes (see AboutMe). Plain on purpose: the quote is the content.
import React from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { copy } from "@/content/copy";
import { ease } from "@/lib/motion";

export default function TestimonialsSection() {
  const reduceMotion = useReducedMotion();
  const { title, items } = copy.testimonials;

  return (
    <section id="testimonials" aria-labelledby="testimonials-heading" className="reveal-item px-4 sm:px-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-6 pb-2 border-b border-line">
        <h2 id="testimonials-heading" className="text-xl sm:text-2xl font-display text-ink tracking-tight">
          {title}
        </h2>
      </div>

      <ul className={`grid gap-4 ${items.length > 1 ? "md:grid-cols-2" : ""}`}>
        {items.map((t, i) => (
          <motion.li
            key={`${t.name}-${t.when}`}
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-8% 0px" }}
            transition={{ duration: 0.45, delay: i * 0.06, ease: ease.out }}
            className="flex flex-col justify-between rounded-3xl border border-line bg-surface p-6 sm:p-8 shadow-[var(--e2)]"
          >
            <blockquote className="font-display text-[clamp(1.35rem,2.4vw,1.9rem)] leading-[1.2] tracking-[-0.01em] text-ink text-balance">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-5 text-sm text-ink-2">
              <span className="font-semibold text-ink">{t.name}</span>
              <span className="text-ink-3">
                {" "}
                · {t.role}, {t.org}
              </span>
              <span className="mt-0.5 block font-mono text-[11px] text-ink-3">{t.when}</span>
            </figcaption>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
