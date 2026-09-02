"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { soundFx } from "@/util/sound";
import {
  LuArrowUpRight,
  LuExternalLink,
  LuGlobe,
} from "react-icons/lu";

interface MediaItem {
  src: string;
  type: "image" | "video";
  alt?: string;
}

interface MyWorksSectionProps {
  onCardClick?: (
    title: string,
    cardDescription: string,
    modalDescription: string,
    date?: string,
    imageSrc?: string,
    imageSize?: number,
    media?: MediaItem[]
  ) => void;
}

interface Project {
  id: string;
  title: string;
  domain: string;
  liveUrl: string;
  category: string;
  tagline: string;
  summary: string;
  modalDescription: string;
  metrics: string;
  tags: string[];
  logo: string;
  thumbnail: string;
  invert?: boolean;
}

const PROJECTS_DATA: Project[] = [
  {
    id: "quant",
    title: "Prediction Market Edge Engine",
    domain: "quant.dev-jk.me",
    liveUrl: "https://quant.dev-jk.me",
    category: "Quantitative Intelligence & Algorithms",
    tagline: "Statistical probability edge modeling & Kelly criterion position sizing for prediction markets.",
    summary:
      "A quantitative intelligence engine analyzing prediction market order books (e.g. Polymarket). Models real-time implied probability distributions, Brier score calibration, and optimal Kelly criterion stake allocation to identify statistical mispricings.",
    modalDescription:
      "Prediction Market Edge Engine (quant.dev-jk.me). Analyzes live prediction market mechanics with quantitative probability metrics. Implements mathematical order book parsing, implied versus calibrated probability modeling, Brier scoring accuracy analysis, and fraction Kelly criterion bankroll management.",
    metrics: "Kelly Sizing &bull; Order Book Analytics &bull; Polymarket Edge",
    tags: ["Probability Modeling", "Kelly Criterion", "TypeScript", "React", "Prediction Markets"],
    logo: "/python.png",
    thumbnail: "/projects/quant.jpg",
  },
  {
    id: "tropa",
    title: "Tropa — Climb & Expense Coordinator",
    domain: "tropa.dev-jk.me",
    liveUrl: "https://tropa.dev-jk.me",
    category: "Full-Stack Web Platform",
    tagline: "Philippine mountain itinerary planning, headcount logistics, and shared cost splitting.",
    summary:
      "Full-stack mountaineering coordination platform for Philippine trails (Pulag, Apo, Ulap, Batulao). Allows groups to select trails, schedule van and trailhead timetables, track gear/permits, and split multi-party shared expenses with zero-friction climb join codes.",
    modalDescription:
      "Tropa (tropa.dev-jk.me) — 'Plan the climb. Keep the Tropa together.' Engineered with Next.js App Router, React 19, and Tailwind CSS. Built to eliminate fragmented group chats and spreadsheets by managing trail logistics, headcount validation, and multi-currency expense splitting in one unified collaborative space.",
    metrics: "Next.js App Router &bull; Real Trail Logistics &bull; Cost-Split Engine",
    tags: ["Next.js 15", "React 19", "Tailwind CSS", "TypeScript", "Collaborative State"],
    logo: "/next.svg",
    thumbnail: "/projects/tropa.jpg",
    invert: true,
  },
  {
    id: "finance",
    title: "Finance Tracker PWA",
    domain: "finance.dev-jk.me",
    liveUrl: "https://finance.dev-jk.me",
    category: "Offline-First Web App / PWA",
    tagline: "Zero-latency offline-first personal financial management and dynamic analytics.",
    summary:
      "A Progressive Web App (PWA) delivering client-side financial analytics and budget tracking. Uses Dexie.js over IndexedDB for resilient offline-first persistence, Recharts for interactive spending breakdowns, and Framer Motion for responsive tactile transitions.",
    modalDescription:
      "Finance Tracker (finance.dev-jk.me). Offline-first Progressive Web App designed for private, high-speed financial analytics. Features client-side schema migrations via Dexie.js (IndexedDB), category budgeting, cash flow forecasting, transaction ledgers, and animated Recharts data visualizations.",
    metrics: "IndexedDB (Dexie.js) &bull; Recharts Analytics &bull; Offline PWA",
    tags: ["React", "Dexie.js", "IndexedDB", "Recharts", "PWA", "Framer Motion"],
    logo: "/react.png",
    thumbnail: "/projects/finance.jpg",
  },
  {
    id: "portfolio-v2",
    title: "Developer Portfolio v2",
    domain: "dev-jk.me",
    liveUrl: "https://neverida-jk.github.io/portfolio",
    category: "Creative Engineering & UI Systems",
    tagline: "Modern developer showcase featuring embedded Unix shell and synthesized Web Audio.",
    summary:
      "Personal portfolio engineered with Next.js 15 App Router, React 19, and Tailwind CSS v4. Features an embedded interactive Unix CLI sandbox, global Cmd+K spotlight palette, Web Audio API sound synthesizer, and dynamic celebration canvas particle cannons.",
    modalDescription:
      "Personal developer portfolio engineered with Next.js 15 App Router, React 19, and Tailwind CSS v4. Features an embedded interactive Unix-like CLI sandbox, global keyboard shortcut command palette, Web Audio API sound synthesizer, and dynamic canvas particle animations.",
    metrics: "100/100 Lighthouse &bull; Web Audio API &bull; Turbopack",
    tags: ["Next.js 15", "React 19", "Tailwind v4", "TypeScript", "Web Audio API"],
    logo: "/next.svg",
    thumbnail: "/projects/portfolio-v2.jpg",
    invert: true,
  },
];

const AUTO_ADVANCE_MS = 4000;
const RESUME_AFTER_MS = 4500;

// A clone of the first project appended after the last one. Auto-advance
// scrolls onto this clone like any other card, then — once it's settled
// into view — jumps instantly (no animation) back to the real first card.
// Since the clone is visually identical, that jump is imperceptible, so
// the loop reads as one continuous forward motion instead of a rewind.
const CAROUSEL_ITEMS = [...PROJECTS_DATA, PROJECTS_DATA[0]];

export default function MyWorksSection({ onCardClick }: MyWorksSectionProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  // True only while a scroll was triggered by OUR OWN code (auto-advance or
  // a dot click), so the scroll listener below can tell "the carousel
  // moved" apart from "the user moved the carousel" and only pause on the
  // latter.
  const isProgrammaticScrollRef = useRef(false);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // One interaction model at every breakpoint: swipe/drag/scroll through
  // full project cards. The active dot tracks whichever card is actually
  // centered in view, via IntersectionObserver against the scroll container.
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            const idx = cardRefs.current.findIndex((el) => el === entry.target);
            if (idx !== -1) setActiveIndex(idx);
          }
        });
      },
      { root: container, threshold: [0.6] }
    );

    cardRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollToIndex = useCallback((idx: number, programmatic = false, instant = false) => {
    isProgrammaticScrollRef.current = programmatic;
    cardRefs.current[idx]?.scrollIntoView({
      behavior: instant ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
    // Smooth-scroll takes a moment to settle; only clear the flag once it
    // realistically has, so the scroll events it fires along the way don't
    // get misread as user input.
    if (programmatic) {
      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, instant ? 50 : 700);
    }
  }, []);

  // Once the trailing clone card settles into view, snap invisibly back to
  // the real first card so the loop reads as continuous, not a rewind.
  useEffect(() => {
    if (activeIndex !== PROJECTS_DATA.length) return;
    const timeout = setTimeout(() => {
      scrollToIndex(0, true, true);
      setActiveIndex(0);
    }, 550);
    return () => clearTimeout(timeout);
  }, [activeIndex, scrollToIndex]);

  // Auto-advance loop, paused whenever the user has taken control. Skips a
  // beat while sitting on the clone, mid-loop-reset above.
  useEffect(() => {
    if (isPaused || activeIndex >= PROJECTS_DATA.length) return;
    const interval = setInterval(() => {
      scrollToIndex(activeIndex + 1, true);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(interval);
  }, [isPaused, activeIndex, scrollToIndex]);

  // Any real user interaction pauses auto-advance and schedules it to
  // resume after a period of inactivity — so it never fights a mid-swipe,
  // but always picks back up once the user stops touching it.
  const handleUserTakeover = useCallback(() => {
    setIsPaused(true);
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => setIsPaused(false), RESUME_AFTER_MS);
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (isProgrammaticScrollRef.current) return;
      handleUserTakeover();
    };

    container.addEventListener("pointerdown", handleUserTakeover);
    container.addEventListener("wheel", handleUserTakeover, { passive: true });
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("pointerdown", handleUserTakeover);
      container.removeEventListener("wheel", handleUserTakeover);
      container.removeEventListener("scroll", handleScroll);
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, [handleUserTakeover]);

  return (
    <section id="projects" className="reveal-item px-4 sm:px-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-6 pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-bold font-rubik text-zinc-100 tracking-tight">
            Featured Projects & Live Systems
          </h2>
        </div>
        <span className="text-xs font-mono text-zinc-500">Live Production Apps</span>
      </div>

      {/* Swipeable Project Carousel — one full browser-mockup card per
          project, peeking at the edges to invite swiping at any width. */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {CAROUSEL_ITEMS.map((p, idx) => (
          <div
            key={idx < PROJECTS_DATA.length ? p.id : `${p.id}-clone`}
            ref={(el) => {
              cardRefs.current[idx] = el;
            }}
            className="shrink-0 w-[88%] sm:w-[68%] lg:w-[600px] snap-center glass-panel rounded-3xl overflow-hidden border border-white/[0.1] shadow-2xl bg-[#060608]"
          >
            {/* Browser Address Bar Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-zinc-950 border-b border-white/[0.08]">
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              </div>

              <a
                href={p.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => soundFx.playClick(900)}
                className="flex-1 px-3.5 py-1 rounded-full bg-zinc-900/90 hover:bg-zinc-850 border border-white/[0.08] text-[11px] font-mono text-zinc-300 text-center truncate flex items-center justify-center gap-2 transition-colors group cursor-pointer"
                title={`Open ${p.domain} in new tab`}
              >
                <LuGlobe className="w-3 h-3 text-emerald-400" />
                <span className="group-hover:text-white font-medium">{p.domain}</span>
                <LuExternalLink className="w-2.5 h-2.5 text-zinc-500 group-hover:text-zinc-300" />
              </a>
            </div>

            {/* Real landing page screenshot — actual proof it's live, not just a text card */}
            <div className="relative w-full aspect-video bg-zinc-950 border-b border-white/[0.06]">
              <Image
                src={p.thumbnail}
                alt={`${p.title} landing page`}
                fill
                sizes="(max-width: 1024px) 90vw, 600px"
                className="object-cover object-top"
                priority={idx === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
            </div>

            <div className="space-y-3 p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-zinc-900 text-zinc-400 border border-white/[0.08] text-[11px] font-mono">
                  {p.category}
                </span>
                <span className="text-zinc-600">&bull;</span>
                <span className="text-xs font-mono text-emerald-400">{p.domain}</span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold font-rubik text-white tracking-tight">
                  {p.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 font-rubik mt-1">
                  {p.tagline}
                </p>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 font-rubik leading-relaxed line-clamp-3">
                {p.summary}
              </p>

              {/* Engineering Metrics Bar */}
              <div className="py-2 px-3 rounded-xl bg-zinc-900/70 border border-white/[0.06] text-xs font-mono text-emerald-400">
                <span dangerouslySetInnerHTML={{ __html: p.metrics }} />
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {p.tags.map((tag, tagIdx) => (
                  <span
                    key={tagIdx}
                    className="px-2.5 py-0.5 text-[11px] font-mono rounded bg-zinc-900 text-zinc-300 border border-white/[0.06]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Live Links (No source code buttons - private to user) */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <a
                  href={p.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => soundFx.playClick(900)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-zinc-950 font-rubik text-xs font-medium hover:bg-zinc-200 transition-colors shadow-md active:scale-95 cursor-pointer"
                >
                  <LuExternalLink className="w-3.5 h-3.5" />
                  <span>Launch {p.domain}</span>
                </a>

                <button
                  onClick={() => {
                    soundFx.playClick(850);
                    onCardClick?.(
                      p.title,
                      p.summary,
                      p.modalDescription,
                      p.domain,
                      p.logo,
                      72,
                      [{ src: p.logo, type: "image", alt: p.title }]
                    );
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-rubik text-xs border border-white/[0.08] transition-colors active:scale-95 cursor-pointer"
                >
                  <span>Technical Specs</span>
                  <LuArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-1.5 mt-4">
        {PROJECTS_DATA.map((p, idx) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              soundFx.playClick(900);
              scrollToIndex(idx);
            }}
            aria-label={`Go to ${p.title}`}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              idx === activeIndex % PROJECTS_DATA.length ? "w-6 bg-emerald-400" : "w-1.5 bg-zinc-700 hover:bg-zinc-600"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
