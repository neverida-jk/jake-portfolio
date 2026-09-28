"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { LuArrowRight, LuArrowUpRight, LuGlobe, LuX } from "react-icons/lu";
import Dual from "../system/Dual";
import Sheet from "../system/Sheet";
import { useToolFocus } from "../system/ToolFocusProvider";
import { copy } from "@/content/copy";
import { projects, projectById, type Hotspot, type Project } from "@/content/projects";
import { ease, spring } from "@/lib/motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { soundFx } from "@/util/sound";

const AUTO_ADVANCE_MS = 5000;
const RESUME_AFTER_MS = 5000;

// A clone of the first project appended after the last. Auto-advance scrolls
// onto it like any other card, then — once it's settled — jumps instantly
// back to the real first card. The clone is visually identical, so the loop
// reads as one continuous forward motion instead of a rewind.
const LOOPS = projects.length > 1;
const CAROUSEL = LOOPS ? [...projects, projects[0]] : projects;

const fmtMetres = (m: number) => `${m.toLocaleString("en-US")} m`;

function Hotspots({ project }: { project: Project }) {
  const [open, setOpen] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  if (project.hotspots.length === 0) return null;

  return (
    <div className="absolute inset-0" onClick={() => setOpen(null)}>
      {project.hotspots.map((s: Hotspot) => {
        const isOpen = open === s.id;
        const popId = `hs-${project.id}-${s.id}`;
        // Keep the popover inside the image: anchor left / centre / right by x,
        // and flip above the dot when it sits in the lower half.
        const align = s.x < 0.34 ? "left-0" : s.x > 0.66 ? "right-0" : "left-1/2 -translate-x-1/2";
        const above = s.y > 0.55;
        return (
          <div
            key={s.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${s.x * 100}%`, top: `${s.y * 100}%`, zIndex: isOpen ? 20 : 10 }}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={popId}
              aria-label={s.label}
              onClick={(e) => {
                e.stopPropagation();
                soundFx.playClick(isOpen ? 700 : 1000);
                setOpen(isOpen ? null : s.id);
              }}
              onKeyDown={(e) => {
                // Close just this note — don't let Esc reach the Sheet and
                // close the whole case study.
                if (e.key === "Escape" && isOpen) {
                  e.stopPropagation();
                  setOpen(null);
                }
              }}
              className="group relative grid h-8 w-8 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-summit focus-visible:ring-offset-2 focus-visible:ring-offset-void"
            >
              {!isOpen && !reduceMotion && (
                <span className="absolute inset-1 rounded-full bg-summit/40 animate-ping" aria-hidden="true" />
              )}
              <span
                className={`relative h-3.5 w-3.5 rounded-full ring-2 ring-void transition-transform ${
                  isOpen ? "scale-125 bg-summit-dt" : "bg-summit group-hover:scale-110"
                }`}
                aria-hidden="true"
              />
            </button>

            <div className={`absolute ${align} ${above ? "bottom-full mb-2" : "top-full mt-2"} w-64 max-w-[70vw]`}>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    id={popId}
                    role="note"
                    initial={{ opacity: 0, y: reduceMotion ? 0 : above ? 6 : -6, scale: reduceMotion ? 1 : 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.97 }}
                    transition={spring.snappy}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded-2xl border border-line bg-raised/95 p-4 shadow-[var(--e3)] backdrop-blur-sm"
                  >
                    <p className="text-sm font-semibold text-ink">{s.label}</p>
                    <div className="mt-1">
                      <Dual value={s.body} className="text-sm leading-relaxed text-ink-2" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CaseStudy({
  project,
  morph,
  onClose,
  onNext,
}: {
  project: Project;
  morph: boolean;
  onClose: () => void;
  onNext: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const labels = copy.work.labels;

  return (
    <motion.div
      key={project.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduceMotion ? 0.15 : 0.3, ease: ease.out }}
      className="p-5 sm:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-3">
            <span>{project.category}</span>
            <span className="normal-case text-summit" title={copy.work.elevationTitle}>
              {fmtMetres(project.elevation)}
            </span>
          </p>
          <h3 id="case-title" className="mt-2 font-display text-h2 leading-[1.05] tracking-[-0.02em] text-ink">
            {project.title}
          </h3>
          <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-ink-2">{project.tagline}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={copy.work.close}
          className="shrink-0 rounded-lg p-2 text-ink-3 transition-colors hover:bg-raised hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-summit"
        >
          <LuX className="h-5 w-5" />
        </button>
      </div>

      {/* The artifact: the real screenshot, with the reasoning pinned onto it. */}
      <div className="relative mt-6">
        <motion.div
          layoutId={morph ? `thumb-${project.id}` : undefined}
          transition={spring.smooth}
          className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-line bg-void"
        >
          <Image
            src={project.thumbnail}
            alt={`${project.title} — screenshot`}
            fill
            sizes="(max-width: 640px) 94vw, 980px"
            className="object-cover object-top"
          />
        </motion.div>
        <Hotspots key={project.id} project={project} />
      </div>
      {project.hotspots.length > 0 && (
        <p className="mt-3 font-mono text-[0.6875rem] text-ink-3">{copy.work.hotspotHint}</p>
      )}

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <div>
            <h4 className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-3">{labels.problem}</h4>
            <div className="mt-2">
              <Dual value={project.problem} className="text-base leading-relaxed text-ink" />
            </div>
          </div>
          <div>
            <h4 className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-3">{labels.constraint}</h4>
            <div className="mt-2">
              <Dual value={project.constraint} className="text-base leading-relaxed text-ink" />
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-3">{labels.decisions}</h4>
          <ol className="mt-3 space-y-4">
            {project.decisions.map((d, i) => (
              <li key={d.plain} className="flex gap-3">
                <span className="mt-0.5 font-display text-lg leading-none text-summit" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <Dual value={d} className="text-sm leading-relaxed text-ink" />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-line bg-raised/60 p-5">
        <h4 className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-3">{labels.outcome}</h4>
        <div className="mt-2">
          <Dual value={project.outcome} className="text-base leading-relaxed text-ink" />
        </div>
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label={labels.stack}>
          {project.stack.map((s) => (
            <li key={s} className="rounded-md border border-line bg-surface px-2 py-0.5 font-mono text-[0.6875rem] text-ink-2">
              {s}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <a
          href={project.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => soundFx.playClick(950)}
          className="inline-flex items-center gap-2 rounded-full bg-summit px-5 py-2.5 text-sm font-medium text-void transition-colors hover:bg-summit-dt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-summit focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          {copy.work.visit}
          <LuArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </a>
        {projects.length > 1 && (
          <button
            type="button"
            onClick={onNext}
            className="group inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm text-ink-2 transition-colors hover:border-ink-3 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-summit"
          >
            {copy.work.next}
            <LuArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function WorkSection() {
  const reduceMotion = useReducedMotion();
  const { focusedTool, setFocusedProject } = useToolFocus();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const isProgrammaticScrollRef = useRef(false);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [openId, setOpenId] = useState<string | null>(null);
  // The project whose card thumbnail morphs into the case study. Only the
  // one opened from a card morphs; "Next" and deep links just fade.
  const [morphId, setMorphId] = useState<string | null>(null);
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Shared-element morph only on desktop: on mobile the case study is a
  // bottom sheet sliding up, and a morph inside a translating parent distorts.
  const morphEnabled = desktop && !reduceMotion;

  // --- carousel (auto-advance + seamless loop) ---------------------------
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
    const container = scrollRef.current;
    const card = cardRefs.current[idx];
    if (!container || !card) return;
    isProgrammaticScrollRef.current = programmatic;
    // scrollTo on the container, never scrollIntoView — that walks up the
    // ancestors and can drag the whole page to this section.
    const targetLeft = card.offsetLeft - (container.clientWidth - card.offsetWidth) / 2;
    container.scrollTo({ left: targetLeft, behavior: instant ? "auto" : "smooth" });
    if (programmatic) {
      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, instant ? 50 : 700);
    }
  }, []);

  useEffect(() => {
    if (!LOOPS || activeIndex !== projects.length) return;
    const t = setTimeout(() => {
      scrollToIndex(0, true, true);
      setActiveIndex(0);
    }, 550);
    return () => clearTimeout(t);
  }, [activeIndex, scrollToIndex]);

  useEffect(() => {
    if (!LOOPS || reduceMotion || isPaused || openId || activeIndex >= projects.length) return;
    const id = setInterval(() => scrollToIndex(activeIndex + 1, true), AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [isPaused, openId, activeIndex, scrollToIndex, reduceMotion]);

  const handleUserTakeover = useCallback(() => {
    setIsPaused(true);
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => setIsPaused(false), RESUME_AFTER_MS);
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const onScroll = () => {
      if (!isProgrammaticScrollRef.current) handleUserTakeover();
    };
    container.addEventListener("pointerdown", handleUserTakeover);
    container.addEventListener("wheel", handleUserTakeover, { passive: true });
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      container.removeEventListener("pointerdown", handleUserTakeover);
      container.removeEventListener("wheel", handleUserTakeover);
      container.removeEventListener("scroll", onScroll);
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, [handleUserTakeover]);

  // --- case studies ------------------------------------------------------
  const setHash = (id: string | null) => {
    const base = window.location.pathname + window.location.search;
    window.history.replaceState(null, "", id ? `${base}#work/${id}` : base);
  };

  const openCase = useCallback(
    (id: string, fromCard: boolean) => {
      soundFx.playClick(900);
      setMorphId(fromCard && morphEnabled ? id : null);
      setOpenId(id);
      setHash(id);
    },
    [morphEnabled]
  );

  const closeCase = useCallback(() => {
    setOpenId(null);
    setHash(null);
  }, []);

  const nextCase = useCallback(() => {
    if (!openId) return;
    const i = projects.findIndex((p) => p.id === openId);
    const next = projects[(i + 1) % projects.length];
    soundFx.playClick(950);
    setMorphId(null);
    setOpenId(next.id);
    setHash(next.id);
    scrollToIndex(projects.indexOf(next), true);
    document.getElementById("case-title")?.closest('[role="dialog"]')?.scrollTo({ top: 0, behavior: "smooth" });
  }, [openId, scrollToIndex]);

  // Deep link: /#work/tropa opens that case study on load.
  useEffect(() => {
    const m = window.location.hash.match(/^#work\/([\w-]+)$/);
    if (m && projectById(m[1])) {
      const section = document.getElementById("work");
      if (section) window.scrollTo({ top: section.getBoundingClientRect().top + window.scrollY - 80 });
      setOpenId(m[1]);
    }
  }, []);

  // The command palette can open a case study after load (e.g. from search)
  // by setting the hash and dispatching a synthetic hashchange — the effect
  // above only runs once, on mount, so this is what actually reacts to it.
  useEffect(() => {
    const onHashChange = () => {
      const m = window.location.hash.match(/^#work\/([\w-]+)$/);
      if (m && projectById(m[1])) {
        setMorphId(null);
        setOpenId(m[1]);
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const open = openId ? projectById(openId) : undefined;

  return (
    <section id="work" aria-labelledby="work-heading" className="reveal-item mx-auto max-w-6xl px-4 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-[36rem]">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-3">{copy.work.eyebrow}</p>
          <h2 id="work-heading" className="mt-3 font-display text-h1 leading-[1.02] tracking-[-0.03em] text-ink">
            {copy.work.title}
          </h2>
          <div className="mt-4">
            <Dual value={copy.work.intro} className="text-base leading-relaxed text-ink-2" />
          </div>
        </div>
        <p className="flex items-center gap-2 font-mono text-xs text-ink-3">
          <span className="h-1.5 w-1.5 rounded-full bg-moss" aria-hidden="true" />
          {projects.length} {copy.work.live}
        </p>
      </div>

      {/* layoutScroll: the carousel scrolls horizontally, so framer must
          account for its scrollLeft when measuring a card for the morph. */}
      <motion.div
        layoutScroll
        ref={scrollRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={copy.work.carousel}
        className="mt-10 -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 scrollbar-hide sm:mx-0 sm:px-0"
      >
        {CAROUSEL.map((p, idx) => {
          const isClone = idx >= projects.length;
          const dim = !!focusedTool && !p.tools.includes(focusedTool);
          const lit = !!focusedTool && p.tools.includes(focusedTool);
          // Registered before any click so framer has the card's box to morph from.
          const layoutId = !isClone && morphEnabled ? `thumb-${p.id}` : undefined;
          return (
            <article
              key={isClone ? `${p.id}-clone` : p.id}
              ref={(el) => {
                cardRefs.current[idx] = el;
              }}
              aria-hidden={isClone || undefined}
              onPointerEnter={() => setFocusedProject(p.id)}
              onPointerLeave={() => setFocusedProject(null)}
              onFocus={() => setFocusedProject(p.id)}
              onBlur={() => setFocusedProject(null)}
              className={`group/card w-[88%] shrink-0 snap-center overflow-hidden rounded-3xl border bg-surface shadow-[var(--e2)] transition-[opacity,filter,border-color,transform] duration-300 sm:w-[70%] lg:w-[620px] ${
                dim ? "opacity-35 grayscale-[0.5]" : "opacity-100"
              } ${lit ? "border-summit/50 -translate-y-1" : "border-line hover:border-ink-3/60"}`}
            >
              {/* Browser chrome */}
              <div className="flex items-center gap-3 border-b border-line bg-void/60 px-4 py-3">
                <div className="flex shrink-0 items-center gap-1.5" aria-hidden="true">
                  <span className="h-2.5 w-2.5 rounded-full bg-ink-3/40" />
                  <span className="h-2.5 w-2.5 rounded-full bg-ink-3/40" />
                  <span className="h-2.5 w-2.5 rounded-full bg-ink-3/40" />
                </div>
                <a
                  href={p.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={isClone ? -1 : undefined}
                  onClick={() => soundFx.playClick(900)}
                  className="flex min-w-0 flex-1 items-center justify-center gap-2 truncate rounded-full border border-line bg-surface px-3 py-1 font-mono text-[0.6875rem] text-ink-2 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-summit"
                  title={`Open ${p.domain}`}
                >
                  <LuGlobe className="h-3 w-3 shrink-0 text-moss" aria-hidden="true" />
                  <span className="truncate">{p.domain}</span>
                </a>
              </div>

              <button
                type="button"
                onClick={() => openCase(p.id, true)}
                tabIndex={isClone ? -1 : undefined}
                aria-label={`${copy.work.openCase}: ${p.title}`}
                className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-summit"
              >
                <motion.div
                  layoutId={layoutId}
                  transition={spring.smooth}
                  className="relative aspect-[16/10] overflow-hidden bg-void"
                >
                  <Image
                    src={p.thumbnail}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 88vw, 620px"
                    priority={idx === 0}
                    className="object-cover object-top transition-transform duration-700 ease-out group-hover/card:scale-[1.025]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" aria-hidden="true" />
                </motion.div>
              </button>

              <div className="p-5 sm:p-6">
                <p className="flex items-center justify-between gap-3 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-3">
                  <span className="truncate">{p.category}</span>
                  <span className="shrink-0 normal-case text-summit" title={copy.work.elevationTitle}>
                    {fmtMetres(p.elevation)}
                  </span>
                </p>
                <h3 className="mt-3 font-display text-[clamp(1.75rem,3vw,2.25rem)] leading-[1.05] tracking-[-0.02em] text-ink">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">{p.tagline}</p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => openCase(p.id, true)}
                    tabIndex={isClone ? -1 : undefined}
                    className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-void transition-colors hover:bg-summit-dt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-summit focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                  >
                    {copy.work.openCase}
                    <LuArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </button>
                  <a
                    href={p.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={isClone ? -1 : undefined}
                    onClick={() => soundFx.playClick(900)}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-2.5 text-sm text-ink-2 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-summit"
                  >
                    {copy.work.visit}
                    <LuArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </motion.div>

      {LOOPS && (
        <div className="mt-5 flex justify-center gap-1.5">
          {projects.map((p, idx) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                soundFx.playClick(900);
                handleUserTakeover();
                scrollToIndex(idx, true);
              }}
              aria-label={`${copy.work.goTo} ${p.title}`}
              aria-current={idx === activeIndex % projects.length ? "true" : undefined}
              className={`h-1.5 cursor-pointer rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-summit ${
                idx === activeIndex % projects.length ? "w-7 bg-summit" : "w-1.5 bg-ink-3/40 hover:bg-ink-3"
              }`}
            />
          ))}
        </div>
      )}

      <Sheet isOpen={!!open} onClose={closeCase} titleId="case-title" size="xl" desktopMotion="fade">
        {open && (
          <CaseStudy project={open} morph={morphEnabled && morphId === open.id} onClose={closeCase} onNext={nextCase} />
        )}
      </Sheet>
    </section>
  );
}
