"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  type MotionValue,
} from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { LuArrowUpRight, LuCheck, LuShieldCheck, LuX } from "react-icons/lu";
import Dual from "../system/Dual";
import Sheet from "../system/Sheet";
import { copy } from "@/content/copy";
import type { Milestone } from "@/content/copy/journey";
import { ease } from "@/lib/motion";

// AboutMe still passes onCardClick; the journey opens its own detail sheet.
interface JourneySectionProps {
  onCardClick?: unknown;
}

const MILESTONES: Milestone[] = copy.journey.milestones;

// Trail geometry lives in a fixed 1200x600 viewBox, so every coordinate
// scales with the SVG — markers are placed with getPointAtLength() on the
// real path, never hardcoded pixels.
const VB_W = 1200;
const VB_H = 600;
const RIDGE =
  "M0,600 L0,500 C120,480 200,420 300,400 C400,380 450,350 540,330 C620,312 620,260 700,240 C780,220 820,180 880,150 C940,120 980,70 1040,62 C1100,55 1150,90 1200,120 L1200,600 Z";
// The crest alone, for the outline — stroking the closed RIDGE shape would
// also draw its bottom and side edges as a visible box.
const RIDGE_CREST =
  "M0,500 C120,480 200,420 300,400 C400,380 450,350 540,330 C620,312 620,260 700,240 C780,220 820,180 880,150 C940,120 980,70 1040,62 C1100,55 1150,90 1200,120";
const TRAIL =
  "M60,540 C170,530 230,470 320,448 C410,426 440,470 520,430 C600,390 560,330 640,300 C720,270 780,300 840,250 C900,200 880,150 950,120 C1000,98 1040,104 1080,92";
// Where along the trail (0-1 of its length) each milestone sits.
const FRACTIONS = [0.03, 0.36, 0.68, 0.97];
// Scroll progress (0-1) at which the trail finishes drawing; the rest is a
// short dwell on the final milestone before the section releases.
const DRAW_END = 0.92;

type Pt = { x: number; y: number };

function Hiker() {
  // Faces right (uphill). Drawn in a 24x24 box with the feet at the bottom.
  return (
    <g transform="translate(-12,-23) scale(1)">
      <circle cx="13.2" cy="3.4" r="2.4" fill="var(--color-ink)" />
      <rect x="7.3" y="6.9" width="3.6" height="6.2" rx="1.2" fill="var(--color-summit)" />
      <path d="M10.6 6.8 L14.2 7.2 L13.1 14.1 L10.1 13.8 Z" fill="var(--color-ink)" />
      <path d="M11 13.8 L9.4 20.4 M12.8 14 L15.2 20.2" stroke="var(--color-ink)" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M13.8 8.4 L16.9 11.4 M17.1 10.2 L18.4 20.6" stroke="var(--color-ink)" strokeWidth="1.3" strokeLinecap="round" />
    </g>
  );
}

function Trail({
  drawn,
  activeIndex,
  onPick,
  compact = false,
}: {
  drawn: MotionValue<number>;
  activeIndex: number;
  onPick: (i: number) => void;
  compact?: boolean;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const [points, setPoints] = useState<Pt[]>([]);
  const lengthRef = useRef(0);
  const hx = useMotionValue(60);
  const hy = useMotionValue(540);

  useLayoutEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const L = path.getTotalLength();
    lengthRef.current = L;
    setPoints(FRACTIONS.map((f) => {
      const p = path.getPointAtLength(f * L);
      return { x: p.x, y: p.y };
    }));
  }, []);

  const placeHiker = useCallback(
    (v: number) => {
      const path = pathRef.current;
      if (!path || !lengthRef.current) return;
      const p = path.getPointAtLength(Math.min(1, Math.max(0, v)) * lengthRef.current);
      hx.set(p.x);
      hy.set(p.y);
    },
    [hx, hy]
  );
  useMotionValueEvent(drawn, "change", placeHiker);
  useEffect(() => placeHiker(drawn.get()), [placeHiker, drawn, points]);

  const markerR = compact ? 9 : 7;

  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="block h-auto w-full overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id="journey-ridge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-raised)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--color-base)" stopOpacity="0" />
        </linearGradient>
      </defs>

      <path d={RIDGE} fill="url(#journey-ridge)" />
      <path d={RIDGE_CREST} fill="none" stroke="var(--color-line)" strokeWidth="1.2" />

      {/* The route ahead, faintly — then the route already walked, in gold. */}
      <path ref={pathRef} d={TRAIL} fill="none" stroke="var(--color-ink-3)" strokeOpacity="0.45" strokeWidth="2" strokeDasharray="2 9" strokeLinecap="round" />
      <motion.path
        d={TRAIL}
        fill="none"
        stroke="var(--color-summit)"
        strokeWidth={compact ? 4 : 3}
        strokeLinecap="round"
        style={{ pathLength: drawn }}
      />

      {points.map((p, i) => {
        const reached = i <= activeIndex;
        const current = i === activeIndex;
        return (
          <g
            key={MILESTONES[i].id}
            transform={`translate(${p.x},${p.y})`}
            className="cursor-pointer"
            onClick={() => onPick(i)}
          >
            {current && (
              <circle r={markerR + 7} fill="none" stroke="var(--color-summit)" strokeOpacity="0.5" strokeWidth="1.5" className="motion-safe:animate-pulse" />
            )}
            <circle
              r={markerR}
              fill={reached ? "var(--color-summit)" : "var(--color-base)"}
              stroke={reached ? "var(--color-summit)" : "var(--color-ink-3)"}
              strokeWidth="2"
            />
            <text
              y={compact ? 42 : 32}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize={compact ? 26 : 16}
              fill={reached ? "var(--color-ink)" : "var(--color-ink-3)"}
            >
              {MILESTONES[i].short}
              <tspan x="0" dy={compact ? 28 : 18} fill="var(--color-ink-3)" fontSize={compact ? 22 : 14}>
                {MILESTONES[i].year}
              </tspan>
            </text>
          </g>
        );
      })}

      <motion.g style={{ x: hx, y: hy }}>
        <g transform={compact ? "scale(2.4)" : "scale(1.9)"}>
          <Hiker />
        </g>
      </motion.g>
    </svg>
  );
}

function MilestoneBadge({ m, size = 40 }: { m: Milestone; size?: number }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-xl border border-line bg-raised flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {m.logo ? (
        <Image src={m.logo} alt="" fill sizes={`${size}px`} className="object-contain p-1.5" />
      ) : (
        <LuShieldCheck className="h-1/2 w-1/2 text-moss" aria-hidden="true" />
      )}
    </div>
  );
}

function DetailsButton({ m, onOpen }: { m: Milestone; onOpen: (m: Milestone) => void }) {
  if (!m.detail) return null;
  return (
    <button
      type="button"
      onClick={() => onOpen(m)}
      className="group mt-5 inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 font-mono text-xs text-ink-2 transition-colors hover:border-ink-3 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-summit"
      aria-label={`${copy.journey.detailsLabel}: ${m.title}`}
    >
      {copy.journey.detailsLabel}
      <LuArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
    </button>
  );
}

export default function JourneySection(_: JourneySectionProps) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [detail, setDetail] = useState<Milestone | null>(null);
  const isDesktop = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => (isDesktop.current = mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Desktop: the whole tall section is the scroll track. Mobile: the list
  // of milestones is, while the compact trail stays pinned above it.
  const { scrollYProgress: sectionProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const { scrollYProgress: listProgress } = useScroll({ target: listRef, offset: ["start 0.6", "end 0.7"] });

  const raw = useMotionValue(0);
  useMotionValueEvent(sectionProgress, "change", (p) => {
    if (isDesktop.current) raw.set(Math.min(1, p / DRAW_END));
  });
  useMotionValueEvent(listProgress, "change", (p) => {
    if (!isDesktop.current) raw.set(p);
  });

  const smooth = useSpring(raw, { stiffness: 140, damping: 30, mass: 0.6 });
  const drawn = reduceMotion ? raw : smooth;

  useMotionValueEvent(drawn, "change", (v) => {
    let idx = 0;
    FRACTIONS.forEach((f, i) => {
      if (v >= f - 0.02) idx = i;
    });
    setActiveIndex((prev) => (prev === idx ? prev : idx));
  });

  // Jump to a milestone: scroll so the trail is drawn just past its marker.
  const pick = useCallback((i: number) => {
    const target = Math.min(1, FRACTIONS[i] + 0.01);
    if (isDesktop.current && sectionRef.current) {
      const el = sectionRef.current;
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + target * DRAW_END * (el.offsetHeight - window.innerHeight), behavior: "smooth" });
    } else {
      document.getElementById(`milestone-${MILESTONES[i].id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const active = MILESTONES[activeIndex];

  return (
    <section
      id="journey"
      ref={sectionRef}
      aria-labelledby="journey-heading"
      className="relative px-4 sm:px-6 lg:h-[280vh]"
    >
      <div className="mx-auto max-w-6xl lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center lg:pt-16">
        <div className="w-full lg:grid lg:grid-cols-12 lg:items-center lg:gap-12">
          {/* ---------- Story ---------- */}
          <div className="lg:col-span-5">
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-3">{copy.journey.eyebrow}</p>
            <h2 id="journey-heading" className="mt-3 font-display text-h1 leading-[1.02] tracking-[-0.03em] text-ink">
              {copy.journey.title}
            </h2>
            <div className="mt-4 max-w-[30rem]">
              <Dual value={copy.journey.intro} className="text-base leading-relaxed text-ink-2" />
            </div>

            {/* Desktop: one milestone at a time, in step with the hiker. */}
            <div className="hidden lg:block">
              {/* Crossfade (cards stacked absolutely), not mode="wait": scrolling
                  fast past several milestones fires key changes faster than
                  exits finish, and "wait" can then leave no card visible. */}
              <div className="relative mt-10 min-h-[21.5rem]" aria-live="polite">
                <AnimatePresence initial={false}>
                  <motion.article
                    key={active.id}
                    initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: reduceMotion ? 0 : -10 }}
                    transition={{ duration: reduceMotion ? 0.15 : 0.35, ease: ease.out }}
                    className="absolute inset-x-0 top-0 rounded-3xl border border-line bg-surface p-6 shadow-[var(--e2)]"
                  >
                    <div className="flex items-center gap-3">
                      <MilestoneBadge m={active} />
                      <div className="min-w-0">
                        <p className="truncate text-sm text-ink-2">{active.org}</p>
                        {active.current && (
                          <p className="mt-0.5 flex items-center gap-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-moss">
                            <span className="h-1.5 w-1.5 rounded-full bg-moss" aria-hidden="true" />
                            Current
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="mt-5 font-display text-[2.75rem] leading-none text-summit">{active.year}</p>
                    <h3 className="mt-2 text-h3 font-semibold text-ink">{active.title}</h3>
                    <div className="mt-3">
                      <Dual value={active.body} className="text-sm leading-relaxed text-ink-2" />
                    </div>
                    <DetailsButton m={active} onOpen={setDetail} />
                  </motion.article>
                </AnimatePresence>
              </div>

              <nav aria-label="Milestones" className="mt-6">
                <ol className="flex items-center gap-2">
                  {MILESTONES.map((m, i) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => pick(i)}
                        aria-current={i === activeIndex ? "step" : undefined}
                        aria-label={`${m.year} — ${m.title}`}
                        className={`relative isolate rounded-full px-3 py-1.5 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-summit ${
                          i === activeIndex ? "text-void" : i < activeIndex ? "text-ink-2 hover:text-ink" : "text-ink-3 hover:text-ink-2"
                        }`}
                      >
                        {i === activeIndex && (
                          <motion.span
                            layoutId="journey-step"
                            className="absolute inset-0 -z-10 rounded-full bg-summit"
                            transition={{ type: "spring", stiffness: 500, damping: 38 }}
                          />
                        )}
                        {m.short}
                      </button>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          </div>

          {/* ---------- Trail ---------- */}
          {/* Mobile: pinned beneath the nav while the milestones scroll by. */}
          {/* Solid band + a soft fade below it, so cards slide cleanly under
              the pinned trail instead of showing through it. */}
          <div className="sticky top-0 z-10 -mx-4 bg-base px-4 pb-5 pt-[4.5rem] sm:-mx-6 sm:px-6 lg:static lg:col-span-7 lg:mx-0 lg:mt-0 lg:bg-transparent lg:p-0">
            <div className="lg:hidden">
              <Trail drawn={drawn} activeIndex={activeIndex} onPick={pick} compact />
              <div className="pointer-events-none absolute inset-x-0 top-full h-8 bg-gradient-to-b from-base to-transparent" aria-hidden="true" />
            </div>
            <div className="hidden lg:block">
              <Trail drawn={drawn} activeIndex={activeIndex} onPick={pick} />
            </div>
          </div>

          {/* Mobile: every milestone as a card, the reached ones lit. */}
          <ol ref={listRef} className="relative mt-2 space-y-5 pb-10 lg:hidden">
            {MILESTONES.map((m, i) => {
              const reached = i <= activeIndex;
              return (
                <li
                  id={`milestone-${m.id}`}
                  key={m.id}
                  className={`rounded-3xl border bg-surface/90 p-5 transition-colors duration-300 ${
                    i === activeIndex ? "border-summit/50" : "border-line"
                  } ${reached ? "" : "opacity-60"}`}
                >
                  <div className="flex items-center gap-3">
                    <MilestoneBadge m={m} size={36} />
                    <p className="min-w-0 truncate text-sm text-ink-2">{m.org}</p>
                  </div>
                  <p className="mt-4 font-display text-[2.25rem] leading-none text-summit">{m.year}</p>
                  <h3 className="mt-1.5 text-lg font-semibold text-ink">
                    {m.title}
                    {m.current && (
                      <span className="ml-2 align-middle font-mono text-[0.625rem] uppercase tracking-[0.12em] text-moss">Current</span>
                    )}
                  </h3>
                  <div className="mt-2">
                    <Dual value={m.body} className="text-sm leading-relaxed text-ink-2" />
                  </div>
                  <DetailsButton m={m} onOpen={setDetail} />
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <Sheet isOpen={!!detail} onClose={() => setDetail(null)} titleId="journey-detail-title" className="sm:max-w-lg">
        {detail?.detail && (
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <MilestoneBadge m={detail} size={44} />
                <div>
                  <h3 id="journey-detail-title" className="text-base font-semibold text-ink">
                    {detail.detail.heading}
                  </h3>
                  <p className="font-mono text-xs text-ink-3">{detail.detail.period}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetail(null)}
                className="rounded-lg p-1.5 text-ink-3 transition-colors hover:bg-raised hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-summit"
                aria-label="Close"
              >
                <LuX className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5">
              <Dual value={detail.detail.summary} className="text-sm leading-relaxed text-ink-2" />
            </div>

            <ul className="mt-5 space-y-2">
              {detail.detail.points.map((pt) => (
                <li key={pt} className="flex items-start gap-2.5 text-sm text-ink">
                  <LuCheck className="mt-0.5 h-4 w-4 shrink-0 text-moss" aria-hidden="true" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>

            <ul className="mt-6 flex flex-wrap gap-1.5" aria-label="Topics">
              {detail.detail.tags.map((t) => (
                <li key={t} className="rounded-md border border-line bg-raised px-2 py-0.5 font-mono text-[0.6875rem] text-ink-2">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Sheet>
    </section>
  );
}
