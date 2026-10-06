"use client";

// Beyond the Resume: four short facts about the person behind the page.
import React from "react";
import { motion } from "framer-motion";
import { LuArrowRight } from "react-icons/lu";
import { copy } from "@/content/copy";
import { projectById } from "@/content/projects";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { ease } from "@/lib/motion";

export default function BeyondResumeSection() {
  const reduceMotion = useReducedMotion();
  const { title, meta, peaks, items } = copy.beyond;
  const tropa = projectById("tropa");

  const openTropa = () => {
    if (!tropa) return;
    window.location.hash = `work/${tropa.id}`;
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  };

  return (
    <section id="beyond" aria-labelledby="beyond-heading" className="reveal-item mx-auto max-w-5xl px-4 sm:px-6" data-print-hide>
      <div className="mb-6 flex items-center justify-between gap-3 border-b border-line pb-2">
        <h2 id="beyond-heading" className="font-display text-xl tracking-tight text-ink sm:text-2xl">
          {title}
        </h2>
        <span className="font-mono text-xs text-ink-3">{meta}</span>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {items.map((it, i) => (
          <div key={it.label} className={`rounded-3xl border border-line bg-surface p-6 shadow-[var(--e2)] sm:p-7 ${i === 0 ? "sm:col-span-2" : ""}`}>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-3">{it.label}</p>
            <p className="mt-3 max-w-xl font-display text-[clamp(1.25rem,2vw,1.625rem)] leading-snug tracking-[-0.01em] text-ink text-balance">
              {it.text}
            </p>
            {i === 0 && (
              <>
                <svg viewBox="0 0 300 70" className="mt-5 h-auto w-full max-w-md" fill="none" aria-hidden="true">
                  <motion.path
                    d="M0,62 L38,34 L62,50 L104,12 L138,44 L170,26 L206,52 L240,22 L300,60"
                    stroke="var(--color-ink-3)"
                    strokeWidth={1.4}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    initial={reduceMotion ? false : { pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true, margin: "-10% 0px" }}
                    transition={{ duration: 1.4, ease: ease.out }}
                  />
                  <circle cx={104} cy={12} r={3.2} fill="var(--color-summit)" />
                </svg>
                <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Mountains I've climbed">
                  {peaks.map((p) => (
                    <li key={p} className="rounded-md border border-line bg-raised px-2 py-0.5 font-mono text-[0.6875rem] text-ink-2">
                      {p}
                    </li>
                  ))}
                </ul>
                {tropa && (
                  <button
                    type="button"
                    onClick={openTropa}
                    className="group/link mt-4 inline-flex items-center gap-1.5 font-mono text-xs text-alpine hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-summit cursor-pointer"
                  >
                    See {tropa.title}
                    <LuArrowRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5" aria-hidden="true" />
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
