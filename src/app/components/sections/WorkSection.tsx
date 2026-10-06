"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { LuArrowRight, LuArrowUpRight, LuGlobe, LuX } from "react-icons/lu";
import Dual from "../system/Dual";
import Sheet from "../system/Sheet";
import { copy } from "@/content/copy";
import { projects, projectById, type Hotspot, type Project } from "@/content/projects";
import { ease, spring } from "@/lib/motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { soundFx } from "@/util/sound";

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
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-3">{project.category}</p>
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
  // The project shown in the live preview (desktop). Hover or focus a row to
  // change it; on narrow screens every row carries its own screenshot.
  const [activeId, setActiveId] = useState(projects[0].id);
  const [openId, setOpenId] = useState<string | null>(null);
  // The project whose preview image morphs into the case study. Only the
  // one opened from the list morphs; "Next" and deep links just fade.
  const [morphId, setMorphId] = useState<string | null>(null);
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Shared-element morph only where the preview panel exists (wide screens):
  // on narrow ones the case study is a bottom sheet sliding up, and a morph
  // inside a translating parent distorts.
  const morphEnabled = wide && !reduceMotion;

  // --- case studies ------------------------------------------------------
  const setHash = (id: string | null) => {
    const base = window.location.pathname + window.location.search;
    window.history.replaceState(null, "", id ? `${base}#work/${id}` : base);
  };

  const openCase = useCallback(
    (id: string, fromList: boolean) => {
      soundFx.playClick(900);
      setActiveId(id);
      setMorphId(fromList && morphEnabled ? id : null);
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
    setActiveId(next.id);
    setOpenId(next.id);
    setHash(next.id);
    document.getElementById("case-title")?.closest('[role="dialog"]')?.scrollTo({ top: 0, behavior: "smooth" });
  }, [openId]);

  // Deep link: /#work/tropa opens that case study on load.
  useEffect(() => {
    const m = window.location.hash.match(/^#work\/([\w-]+)$/);
    if (m && projectById(m[1])) {
      const section = document.getElementById("work");
      if (section) window.scrollTo({ top: section.getBoundingClientRect().top + window.scrollY - 80 });
      setActiveId(m[1]);
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
        setActiveId(m[1]);
        setOpenId(m[1]);
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const open = openId ? projectById(openId) : undefined;
  const active = projectById(activeId) ?? projects[0];

  return (
    <section id="work" aria-labelledby="work-heading" className="reveal-item mx-auto max-w-6xl px-4 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-[36rem]">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-3">{copy.work.eyebrow}</p>
          <h2 id="work-heading" className="mt-3 font-display text-h1 leading-[1.02] tracking-[-0.03em] text-ink">
            {copy.work.title}
          </h2>
        </div>
        <p className="flex items-center gap-2 font-mono text-xs text-ink-3">
          <span className="h-1.5 w-1.5 rounded-full bg-moss" aria-hidden="true" />
          {projects.length} {copy.work.live}
        </p>
      </div>

      {/* Phones: swipe through the projects, one card at a time. */}
      <ul
        className="-mx-4 mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:hidden [&::-webkit-scrollbar]:hidden"
        aria-label="Projects"
      >
        {projects.map((p, i) => (
          <li key={p.id} className="w-[82%] shrink-0 snap-center">
            <button
              type="button"
              onClick={() => openCase(p.id, false)}
              aria-label={`${copy.work.openCase}: ${p.title}`}
              className="block w-full overflow-hidden rounded-3xl border border-line bg-surface text-left shadow-[var(--e2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-summit"
            >
              <span className="relative block aspect-[16/10] bg-void">
                <Image src={p.thumbnail} alt="" fill sizes="82vw" priority={i === 0} className="object-cover object-top" />
              </span>
              <span className="block p-4">
                <span className="block font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-3">
                  {String(i + 1).padStart(2, "0")} · {p.category}
                </span>
                <span className="mt-1.5 block font-display text-[1.75rem] leading-[1.05] tracking-[-0.02em] text-ink">{p.title}</span>
                <span className="mt-2 block text-sm leading-relaxed text-ink-2">{p.tagline}</span>
                <span className="mt-3 inline-flex items-center gap-1.5 font-mono text-xs text-summit">
                  {copy.work.openCase}
                  <LuArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-1 text-center font-mono text-[0.6875rem] text-ink-3 lg:hidden">Swipe</p>

      <div className="mt-10 hidden gap-10 lg:grid lg:grid-cols-12 lg:gap-14">
        {/* The index: one big row per project. */}
        <ol className="lg:col-span-6 border-t border-line">
          {projects.map((p, i) => {
            const on = p.id === active.id;
            return (
              <li
                key={p.id}
                onPointerEnter={() => setActiveId(p.id)}
                onFocus={() => setActiveId(p.id)}
                className="group/row relative border-b border-line"
              >
                <span
                  aria-hidden="true"
                  className={`absolute left-0 top-0 hidden h-full w-px origin-top bg-summit transition-transform duration-500 ease-out lg:block ${
                    on ? "scale-y-100" : "scale-y-0"
                  }`}
                />

                <button
                  type="button"
                  onClick={() => openCase(p.id, true)}
                  aria-label={`${copy.work.openCase}: ${p.title}`}
                  data-cursor-label="Open"
                  className="block w-full py-6 text-left transition-[padding] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-summit lg:py-7 lg:pl-0 lg:group-hover/row:pl-5 lg:data-[on=true]:pl-5"
                  data-on={on}
                >
                  {/* Narrow screens: no preview panel, so the screenshot sits here. */}
                  <span className="relative mb-5 block aspect-[16/10] overflow-hidden rounded-2xl border border-line bg-void lg:hidden">
                    <Image src={p.thumbnail} alt="" fill sizes="(max-width: 1024px) 94vw, 0px" priority={i === 0} className="object-cover object-top" />
                  </span>

                  <span className="flex items-baseline gap-4">
                    <span className={`font-mono text-xs tabular-nums transition-colors ${on ? "text-summit" : "text-ink-3"}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`font-display text-[clamp(2.1rem,4.2vw,3.4rem)] leading-[1.02] tracking-[-0.03em] transition-colors duration-300 ${
                        on ? "text-ink" : "text-ink lg:text-ink-3"
                      }`}
                    >
                      {p.title}
                    </span>
                  </span>

                  <span className="mt-3 block pl-0 sm:pl-[2.1rem]">
                    <span className="block font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-3">{p.category}</span>
                    <span className="mt-1.5 block max-w-[34ch] text-sm leading-relaxed text-ink-2">{p.tagline}</span>
                  </span>
                </button>

                <a
                  href={p.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => soundFx.playClick(900)}
                  className="mb-6 ml-0 inline-flex items-center gap-1.5 font-mono text-xs text-ink-3 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-summit sm:ml-[2.1rem] lg:mb-7"
                >
                  <LuGlobe className="h-3.5 w-3.5 text-moss" aria-hidden="true" />
                  {p.domain}
                  <LuArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </li>
            );
          })}
        </ol>

        {/* The preview: follows the hovered row. Decorative twin of the row's
            own button, so it stays out of the tab order and the a11y tree. */}
        <div className="hidden lg:col-span-6 lg:block" aria-hidden="true">
          <div className="sticky top-28">
            <div
              onClick={() => openCase(active.id, true)}
              data-cursor-label="Open"
              className="cursor-pointer overflow-hidden rounded-3xl border border-line bg-surface shadow-[var(--e2)]"
            >
              <div className="flex items-center gap-3 border-b border-line bg-void/60 px-4 py-3">
                <div className="flex shrink-0 items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-ink-3/40" />
                  <span className="h-2.5 w-2.5 rounded-full bg-ink-3/40" />
                  <span className="h-2.5 w-2.5 rounded-full bg-ink-3/40" />
                </div>
                <span className="flex min-w-0 flex-1 items-center justify-center gap-2 truncate rounded-full border border-line bg-surface px-3 py-1 font-mono text-[0.6875rem] text-ink-2">
                  <LuGlobe className="h-3 w-3 shrink-0 text-moss" />
                  <span className="truncate">{active.domain}</span>
                </span>
              </div>

              <div className="relative aspect-[16/10] overflow-hidden bg-void">
                {projects.map((p) => {
                  const on = p.id === active.id;
                  return (
                    <motion.div
                      key={p.id}
                      layoutId={morphEnabled ? `thumb-${p.id}` : undefined}
                      transition={spring.smooth}
                      className={`absolute inset-0 transition-[opacity,transform] duration-500 ease-out ${
                        on ? "opacity-100 scale-100" : "opacity-0 scale-[1.03]"
                      }`}
                    >
                      <Image src={p.thumbnail} alt="" fill sizes="620px" priority={p.id === projects[0].id} className="object-cover object-top" />
                    </motion.div>
                  );
                })}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface/80 via-transparent to-transparent" />
              </div>
            </div>
            <p className="mt-3 text-center font-mono text-[0.6875rem] text-ink-3">{copy.work.openCase}</p>
          </div>
        </div>
      </div>

      <Sheet isOpen={!!open} onClose={closeCase} titleId="case-title" size="xl" desktopMotion="fade">
        {open && (
          <CaseStudy project={open} morph={morphEnabled && morphId === open.id} onClose={closeCase} onNext={nextCase} />
        )}
      </Sheet>
    </section>
  );
}
