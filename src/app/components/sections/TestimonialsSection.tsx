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

      <ul className={`-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:px-6 md:mx-0 md:grid md:gap-4 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden ${items.length > 1 ? "md:grid-cols-2" : ""}`}>
        {items.map((t, i) => (
          <motion.li
            key={`${t.role}-${t.org}-${i}`}
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-8% 0px" }}
            transition={{ duration: 0.45, delay: i * 0.06, ease: ease.out }}
            className="w-[86%] shrink-0 snap-center rounded-3xl border border-line bg-surface p-5 shadow-[var(--e2)] md:w-auto md:p-9"
          >
            <figure className="flex h-full flex-col justify-between">
              <blockquote className="max-w-[40ch] font-display text-[clamp(1.25rem,2.8vw,2.25rem)] leading-[1.18] tracking-[-0.015em] text-ink text-balance">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 text-sm text-ink-2">
                {t.name && <span className="font-semibold text-ink">{t.name} · </span>}
                <span className={t.name ? "text-ink-3" : "font-semibold text-ink"}>{t.role}</span>
                <span className="text-ink-3">, {t.org}</span>
                {t.when && <span className="mt-0.5 block font-mono text-[11px] text-ink-3">{t.when}</span>}
              </figcaption>
            </figure>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
