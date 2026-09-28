"use client";

// How I Work (§6.5 / Phase 6). Same 4-tab mechanic as before, but each
// principle is now a single Dual (claim + receipt) and the tabs
// auto-advance on an 8s CSS fill, paused on hover/focus, skipped entirely
// under reduced motion.
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { soundFx } from "@/util/sound";
import { projects, projectById } from "@/content/projects";
import { getApproachPrinciples } from "@/content/copy/approach";
import DualText from "@/components/system/Dual";
import { LuLayers, LuZap, LuCpu, LuShieldCheck } from "react-icons/lu";

const ICONS = {
  qa: <LuShieldCheck className="w-4 h-4" />,
  arch: <LuLayers className="w-4 h-4" />,
  execution: <LuZap className="w-4 h-4" />,
  rigor: <LuCpu className="w-4 h-4" />,
} as const;

export default function ApproachSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const principles = getApproachPrinciples(projects.length);
  const active = principles[activeIndex];

  const advance = () => {
    if (isPaused) return;
    setActiveIndex((i) => (i + 1) % principles.length);
  };

  return (
    <section
      id="approach"
      aria-labelledby="approach-heading"
      className="reveal-item px-4 sm:px-6 max-w-5xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="flex items-center justify-between gap-3 mb-6 pb-2 border-b border-line">
        <h2 id="approach-heading" className="text-xl sm:text-2xl font-display text-ink tracking-tight">
          How I Work
        </h2>
        <span className="text-xs font-mono text-ink-3">4 principles, one receipt each</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        <div className="md:col-span-5 space-y-2">
          {principles.map((p, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  soundFx.playClick(900);
                  setActiveIndex(idx);
                }}
                className={`relative w-full overflow-hidden rounded-2xl p-3.5 flex items-center gap-3 text-left border transition-colors cursor-pointer ${
                  isSelected ? "bg-raised border-summit/40" : "bg-surface border-line hover:border-ink-3/40"
                }`}
              >
                <span
                  className={`p-2 rounded-xl border shrink-0 ${
                    isSelected ? "text-summit border-summit/40 bg-void" : "text-ink-2 border-line bg-void"
                  }`}
                >
                  {ICONS[p.id]}
                </span>
                <span className="text-sm font-sans font-semibold text-ink">{p.label}</span>

                {isSelected && !reduceMotion && (
                  <span
                    key={activeIndex}
                    onAnimationEnd={advance}
                    className="absolute left-0 bottom-0 h-0.5 w-full bg-summit origin-left"
                    style={{
                      animation: "approach-fill 8s linear forwards",
                      animationPlayState: isPaused ? "paused" : "running",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="md:col-span-7 bg-surface border border-line rounded-3xl p-6 sm:p-9 shadow-[var(--e2)] flex flex-col justify-center min-h-[18rem]">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: reduceMotion ? 0.15 : 0.3, ease: "easeOut" }}
            >
              <span className="text-[10px] font-mono uppercase tracking-wider text-ink-3 block mb-2">
                Engineering Commitment
              </span>
              <DualText
                value={active.body}
                note={active.body.technical ? "below" : "none"}
                className="font-display text-[clamp(1.6rem,2.8vw,2.25rem)] leading-[1.15] tracking-[-0.015em] text-ink text-balance"
              />
              {active.citesWork && (
                <a
                  href="#work"
                  className="mt-3 inline-block text-xs font-mono text-alpine hover:underline"
                >
                  See it in {projectById("finance")?.title} &rarr;
                </a>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <style>{`@keyframes approach-fill { from { transform: scaleX(0); } to { transform: scaleX(1); } }`}</style>
    </section>
  );
}
