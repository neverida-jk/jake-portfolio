"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useInView,
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

const MILESTONES: Milestone[] = copy.journey.milestones;

// The dial lives in a fixed 1200x600 viewBox, so every coordinate scales with
// the SVG. A semicircular gauge: 2022 at nine o'clock, now at three, and a
// hand that sweeps across as you scroll. Stations are placed analytically on
// the arc — no DOM measuring.
const VB_W = 1200;
const VB_H = 600;
const CX = 600;
const CY = 500;
const R = 440;
const ARC = `M${CX - R},${CY} A${R},${R} 0 0 1 ${CX + R},${CY}`;
// Where along the arc (0-1) each milestone sits.
const FRACTIONS = [0.03, 0.36, 0.68, 0.97];
// Scroll progress (0-1) at which the hand reaches the end; the rest is a
// short dwell on the final milestone before the section releases.
const DRAW_END = 0.92;
// Time on this dial is not uniform: it lingers where more happened. The
// readout interpolates between each station's real year.
const YEAR_AT: [number, number][] = [
  [0, 2022],
  [0.03, 2022],
  [0.36, 2025.4],
  [0.68, 2026],
  [0.97, 2026.5],
  [1, 2026.5],
];
const TICK_COUNT = 48;

const r1 = (n: number) => n.toFixed(1);
const pointAt = (f: number, radius = R) => {
  const a = Math.PI * (1 - f);
  return { x: CX + radius * Math.cos(a), y: CY - radius * Math.sin(a) };
};
const yearAt = (f: number) => {
  for (let i = 1; i < YEAR_AT.length; i++) {
    const [f1, y1] = YEAR_AT[i];
    const [f0, y0] = YEAR_AT[i - 1];
    if (f <= f1) return Math.floor(f1 === f0 ? y1 : y0 + ((f - f0) / (f1 - f0)) * (y1 - y0));
  }
  return 2026;
};

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
  const handRef = useRef<SVGGElement>(null);
  const yearRef = useRef<SVGTextElement>(null);

  const place = useCallback((v: number) => {
    const f = Math.min(1, Math.max(0, v));
    handRef.current?.setAttribute("transform", `rotate(${(-90 + 180 * f).toFixed(2)} ${CX} ${CY})`);
    if (yearRef.current) yearRef.current.textContent = String(yearAt(f));
  }, []);
  useMotionValueEvent(drawn, "change", place);
  useEffect(() => place(drawn.get()), [place, drawn]);

  const markerR = compact ? 9 : 7;

  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="block h-auto w-full overflow-visible" aria-hidden="true">
      <path d={ARC} fill="none" stroke="var(--color-line)" strokeWidth={1.4} />

      {/* Minute-style ticks along the arc: one per month across four years. */}
      {Array.from({ length: TICK_COUNT + 1 }, (_, i) => {
        const f = i / TICK_COUNT;
        const major = i % 12 === 0;
        const a = pointAt(f, R + 6);
        const b = pointAt(f, R - (major ? 26 : 14));
        return (
          <line
            key={i}
            x1={r1(a.x)}
            y1={r1(a.y)}
            x2={r1(b.x)}
            y2={r1(b.y)}
            stroke="var(--color-ink-3)"
            strokeOpacity={major ? 0.9 : 0.5}
            strokeWidth={major ? 2.2 : 1.2}
            strokeLinecap="round"
          />
        );
      })}

      {/* The time already passed, in gold. */}
      <motion.path d={ARC} fill="none" stroke="var(--color-summit)" strokeWidth={compact ? 4 : 3} strokeLinecap="round" style={{ pathLength: drawn }} />

      {FRACTIONS.map((f, i) => {
        const p = pointAt(f);
        const label = pointAt(f, R - (compact ? 74 : 64));
        const reached = i <= activeIndex;
        const current = i === activeIndex;
        return (
          <g key={MILESTONES[i].id} className="cursor-pointer" onClick={() => onPick(i)}>
            {current && (
              <circle cx={r1(p.x)} cy={r1(p.y)} r={markerR + 7} fill="none" stroke="var(--color-summit)" strokeOpacity="0.5" strokeWidth="1.5" className="motion-safe:animate-pulse" />
            )}
            <circle
              cx={r1(p.x)}
              cy={r1(p.y)}
              r={markerR}
              fill={reached ? "var(--color-summit)" : "var(--color-canvas)"}
              stroke={reached ? "var(--color-summit)" : "var(--color-ink-3)"}
              strokeWidth="2"
            />
            <text
              x={r1(label.x)}
              y={r1(label.y)}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize={compact ? 26 : 17}
              fill={reached ? "var(--color-ink)" : "var(--color-ink-3)"}
            >
              {MILESTONES[i].short}
              <tspan x={r1(label.x)} dy={compact ? 28 : 19} fill="var(--color-ink-3)" fontSize={compact ? 22 : 14}>
                {MILESTONES[i].year}
              </tspan>
            </text>
          </g>
        );
      })}

      <g ref={handRef} transform={`rotate(-90 ${CX} ${CY})`}>
        <line x1={CX} y1={CY} x2={CX} y2={CY - R + 22} stroke="var(--color-summit)" strokeWidth={compact ? 5 : 4} strokeLinecap="round" />
      </g>
      <circle cx={CX} cy={CY} r={compact ? 15 : 13} fill="var(--color-canvas)" stroke="var(--color-summit)" strokeWidth={3} />

      <text
        ref={yearRef}
        x={CX}
        y={VB_H - 14}
        textAnchor="middle"
        fontFamily="var(--font-instrument-serif)"
        fontSize={compact ? 92 : 78}
        fill="var(--color-ink)"
        fillOpacity={0.92}
      >
        2022
      </text>
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

function DetailsButton({ m, onOpen, disabled }: { m: Milestone; onOpen: (m: Milestone) => void; disabled?: boolean }) {
  if (!m.detail) return null;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onOpen(m)}
      className="group mt-5 inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 font-mono text-xs text-ink-2 transition-colors hover:border-ink-3 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-summit"
      aria-label={`${copy.journey.detailsLabel}: ${m.title}`}
    >
      {copy.journey.detailsLabel}
      <LuArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
    </button>
  );
}

function MobileMilestoneCard({
  m,
  isActive,
  reduceMotion,
  onOpen,
}: {
  m: Milestone;
  isActive: boolean;
  reduceMotion: boolean;
  onOpen: (m: Milestone) => void;
}) {
  const ref = useRef<HTMLLIElement>(null);
  // Reveals on this card's own real position in the viewport, not a shared
  // scroll-fraction guess — that heuristic could fire after the card had
  // already scrolled past, under the pinned trail header, so it "appeared"
  // already covered. The top margin excludes roughly the header's zone;
  // the bottom margin reveals a touch before the card is fully in view.
  const inView = useInView(ref, { once: true, margin: "-30% 0px -5% 0px" });
  const reached = reduceMotion || inView;

  return (
    <motion.li
      ref={ref}
      id={`milestone-${m.id}`}
      initial={false}
      animate={{ opacity: reached ? 1 : 0, y: reached ? 0 : 10, scale: reached ? 1 : 0.97 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.4, ease: ease.out }}
      aria-hidden={!reached}
      className={`rounded-3xl border bg-surface/90 p-5 transition-colors duration-300 ${
        isActive ? "border-summit/50" : "border-line"
      }`}
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
      <DetailsButton m={m} onOpen={onOpen} disabled={!reached} />
    </motion.li>
  );
}

export default function JourneySection() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [detail, setDetail] = useState<Milestone | null>(null);
  const isDesktop = useRef(false);
  // Only the trail for the current breakpoint is mounted — the CSS-hidden
  // twin was still doing all its per-frame work.
  const [layout, setLayout] = useState<"mobile" | "desktop" | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => {
      isDesktop.current = mq.matches;
      setLayout(mq.matches ? "desktop" : "mobile");
    };
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

  // Stiff: the arc and the hand should track the scroll almost directly —
  // a soft spring here read as the page lagging behind the finger.
  const smooth = useSpring(raw, { stiffness: 420, damping: 44, mass: 0.5 });
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
            {/* Desktop: one milestone at a time, in step with the hand.
                Print shows every milestone as a flat list instead (below). */}
            <div className="hidden lg:block" data-print-hide>
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

            </div>
          </div>

          {/* ---------- Trail ---------- */}
          {/* Mobile: pinned beneath the nav while the milestones scroll by. */}
          {/* A blurred, translucent band (not a flat fill) so cards slide
              cleanly under the pinned trail without showing through it —
              a flat color here always drifted from the sky gradient
              scrolling behind it and read as a hard seam; the blur just
              samples whatever's actually back there, sky included. */}
          <div
            className="sticky top-0 z-10 -mx-4 bg-canvas/60 px-4 pb-5 pt-[4.5rem] backdrop-blur-md sm:-mx-6 sm:px-6 lg:static lg:col-span-7 lg:mx-0 lg:mt-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none"
            data-print-hide
          >
            <div className="lg:hidden">
              {layout === "mobile" ? (
                <Trail drawn={drawn} activeIndex={activeIndex} onPick={pick} compact />
              ) : (
                <div className="aspect-[2/1]" aria-hidden="true" />
              )}
              <div className="pointer-events-none absolute inset-x-0 top-full h-8 bg-gradient-to-b from-canvas/60 to-transparent" aria-hidden="true" />
            </div>
            <div className="hidden lg:block">
              {layout === "desktop" ? (
                <Trail drawn={drawn} activeIndex={activeIndex} onPick={pick} />
              ) : (
                <div className="aspect-[2/1]" aria-hidden="true" />
              )}
            </div>
          </div>

          {/* Mobile: a milestone's card opens as it actually scrolls into
              view — not the whole timeline dumped up front, and not on a
              scroll-fraction guess shared with the hand above (that could
              fire once the card had already passed, under the pinned
              header). Each still reserves its layout height (opacity/
              transform only), so the list's own scroll distance — which
              drives the hike above — never shifts under the reveal. Print
              forces every card visible regardless — it's the flat résumé
              view there. */}
          <ol ref={listRef} className="relative mt-2 space-y-5 pb-10 lg:hidden" data-print-show>
            {MILESTONES.map((m, i) => (
              <MobileMilestoneCard
                key={m.id}
                m={m}
                isActive={i === activeIndex}
                reduceMotion={reduceMotion}
                onOpen={setDetail}
              />
            ))}
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
