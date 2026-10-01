"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useAnimationControls,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { LuArrowDown, LuCheck, LuCopy, LuMapPin } from "react-icons/lu";
import { SiGithub } from "react-icons/si";
import Dual from "../system/Dual";
import Contours from "../system/Contours";
import { INTRO_REVEAL_EVENT } from "../system/IntroSequence";
import Magnetic from "../motion/Magnetic";
import GitHubActivity from "../system/GitHubActivity";
import { copy } from "@/content/copy";
import { projects } from "@/content/projects";
import { ease } from "@/lib/motion";
import { soundFx } from "@/util/sound";

interface HeroSectionProps {
  onCopyEmail?: () => void;
}

const EMAIL = "jlrneverida@gmail.com";
const NAME_LINES = ["Jake", "Neverida"];

// The intro timeline, in seconds (§5.6). The name leads — it's the LCP
// element, so it starts almost immediately instead of waiting on the rest.
const T = { eyebrow: 0.05, name: 0.12, role: 0.2, now: 0.68, cta: 0.82, stats: 0.95, cue: 1.3 };

function useManilaTime() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Manila",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function HeroSection({ onCopyEmail }: HeroSectionProps) {
  const reduceMotion = useReducedMotion();
  const controls = useAnimationControls();
  const speed = useRef(1);
  const sectionRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // Contours mount when the hero starts (not behind the intro overlay), as
  // ONE instance for the current breakpoint — two animated copies, one
  // CSS-hidden, was wasted work on every frame of the draw-in.
  const [contours, setContours] = useState<null | "mobile" | "desktop">(null);
  const time = useManilaTime();

  // Keyframed from 0 so the animation starts from the CSS-hidden state
  // (.js .intro-*) regardless of what the DOM currently holds.
  const fade: Variants = {
    show: (d: number) => ({
      opacity: [0, 1],
      y: [14, 0],
      transition: { duration: 0.7, delay: d * speed.current, ease: ease.out },
    }),
  };
  // Transform-only entrance for the role line: fully opaque from the first
  // paint, so the browser records it as the largest early paint and the
  // page's load time settles immediately — instead of on whatever small
  // element arrives later (like the GitHub line).
  const lift: Variants = {
    show: (d: number) => ({
      y: [16, 0],
      transition: { duration: 0.8, delay: d * speed.current, ease: ease.out },
    }),
  };
  const rise: Variants = {
    show: (d: number) => ({
      y: ["105%", "0%"],
      transition: { duration: 0.85, delay: d * speed.current, ease: ease.out },
    }),
  };

  useEffect(() => {
    // Hydrated after the CSS failsafe already revealed everything (slow
    // device/network) — replaying the intro now would flash content out.
    const lateHydration = performance.now() > 3200;
    const root = document.documentElement;
    // The opening is playing: wait for its fly-through before rising.
    const introPlaying = !root.classList.contains("intro-seen");
    const layout = window.matchMedia("(min-width: 640px)").matches ? "desktop" : "mobile";

    // Read the preference directly: the hook reports false on its first pass
    // (hydration safety), which would start the intro for a frame and then
    // snap it — a visible jump and a layout-shift for reduced-motion users.
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || lateHydration) {
      controls.set("show");
      setContours(layout);
      return;
    }

    // Straight after the opening: the full rise. Repeat visits: brisk.
    speed.current = introPlaying ? 1 : 0.35;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchstart", skip);
    };
    // Any input means the visitor wants the page, not the show.
    const skip = () => {
      controls.stop();
      controls.set("show");
      finish();
    };
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    window.addEventListener("wheel", skip, { passive: true });
    window.addEventListener("touchstart", skip, { passive: true });

    let begun = false;
    let fallback: ReturnType<typeof setTimeout> | undefined;
    const begin = () => {
      // The event and the fallback timer both call this — only the first
      // should count, or the rise replays mid-page (and the stale timer
      // was never cleared, since `once: true` only drops the listener).
      if (begun) return;
      begun = true;
      if (fallback) clearTimeout(fallback);
      setContours(layout);
      controls.start("show").then(finish);
    };
    if (introPlaying) {
      window.addEventListener(INTRO_REVEAL_EVENT, begin, { once: true });
      fallback = setTimeout(begin, 3000); // in case the opening never reports
    } else {
      begin();
    }
    return () => {
      window.removeEventListener(INTRO_REVEAL_EVENT, begin);
      if (fallback) clearTimeout(fallback);
      finish();
    };
  }, [controls]);

  // Leaving base camp: the hero recedes as you scroll past it.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const contentScale = useTransform(scrollYProgress, [0, 1], [1, 0.97]);
  const contoursY = useTransform(scrollYProgress, [0, 1], [0, 120]);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => {
    if (v > 40 && !scrolled) setScrolled(true);
  });

  const handleCopy = useCallback(() => {
    soundFx.playSuccess();
    navigator.clipboard.writeText(EMAIL);
    setCopied(true);
    onCopyEmail?.();
    setTimeout(() => setCopied(false), 2200);
  }, [onCopyEmail]);

  let charIndex = 0;

  return (
    <section
      id="hero"
      ref={sectionRef}
      aria-labelledby="hero-heading"
      className="relative isolate min-h-[100svh] flex items-start overflow-hidden px-4 sm:px-6 pt-28 pb-24 lg:pt-[max(8rem,17vh)]"
    >
      {/* Topography around the summit — draws itself in on arrival. */}
      <motion.div
        className="absolute inset-0 -z-10"
        style={reduceMotion ? undefined : { y: contoursY }}
        aria-hidden="true"
      >
        {/* Mobile: the peak sits in the open space top-right, clear of the name. */}
        {contours === "mobile" && <Contours
          className="absolute right-0 top-0 h-[62svh] w-full opacity-80"
          seed={2954}
          rings={9}
          cx={800}
          cy={400}
          r0={40}
          dr={40}
          draw
          drawDelay={0.05}
        />}
        {/* Desktop: a wide landform behind the Now panel. */}
        {contours === "desktop" && <Contours
          className="absolute -right-[10%] top-[-8%] h-[118%] w-[78%] lg:w-[64%] opacity-90"
          seed={2954}
          rings={10}
          draw
          drawDelay={0.05}
        />}
      </motion.div>

      <motion.div
        className="relative w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-end"
        style={reduceMotion ? undefined : { y: contentY, opacity: contentOpacity, scale: contentScale }}
      >
        {/* ---------- Identity ---------- */}
        <div className="lg:col-span-7">
          <motion.p
            className="intro-fade font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-3 flex flex-wrap items-center gap-x-3 gap-y-1"
            custom={T.eyebrow}
            variants={fade}
            animate={controls}
          >
            <span>{copy.hero.eyebrow}</span>
            <span className="hidden text-ink-3/60 sm:inline" aria-hidden="true">·</span>
            {/* Own line on mobile: a fixed line count means the font swap
                (fallback → Geist Mono) can never re-wrap it and shift the hero. */}
            <span className="basis-full text-ink-2 sm:basis-auto">{copy.hero.coords}</span>
          </motion.p>

          <h1
            id="hero-heading"
            aria-label={NAME_LINES.join(" ")}
            className="mt-5 font-display text-display leading-[0.9] tracking-[-0.035em] text-ink"
          >
            {NAME_LINES.map((line, li) => (
              <span key={line} className="block" aria-hidden="true">
                {Array.from(line).map((ch) => {
                  const i = charIndex++;
                  return (
                    <span key={i} className="inline-block overflow-hidden align-bottom pb-[0.22em] -mb-[0.22em]">
                      <motion.span
                        className={`intro-char inline-block ${li === 1 ? "italic" : ""}`}
                        custom={T.name + i * 0.032}
                        variants={rise}
                        animate={controls}
                      >
                        {ch}
                      </motion.span>
                    </span>
                  );
                })}
              </span>
            ))}
          </h1>

          <motion.div
            className="intro-lift mt-7 max-w-[34rem]"
            custom={T.role}
            variants={lift}
            animate={controls}
          >
            <Dual value={copy.hero.role} className="text-h3 leading-snug text-ink-2 text-balance" />
          </motion.div>

          <motion.div
            className="intro-fade mt-9 flex flex-wrap items-center gap-3"
            custom={T.cta}
            variants={fade}
            animate={controls}
          >
            <Magnetic>
              <motion.a
                href="#work"
                data-cursor="magnet"
                onClick={() => soundFx.playClick(950)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                className="group inline-flex items-center gap-2 rounded-full bg-summit px-6 py-3 text-sm font-medium text-void shadow-[0_10px_30px_-12px_rgba(255,180,84,0.65)] transition-colors hover:bg-summit-dt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-summit focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
              >
                <span>{copy.hero.cta.primary}</span>
                <LuArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
              </motion.a>
            </Magnetic>

            <Magnetic>
              <motion.button
                type="button"
                data-cursor="magnet"
                onClick={handleCopy}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-5 py-3 text-sm text-ink-2 transition-colors hover:border-ink-3 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-summit focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
              >
                {copied ? <LuCheck className="h-4 w-4 text-moss" /> : <LuCopy className="h-4 w-4" />}
                <span aria-live="polite">{copied ? copy.hero.cta.copied : copy.hero.cta.copy}</span>
              </motion.button>
            </Magnetic>
          </motion.div>

          <motion.dl
            className="intro-fade mt-12 grid max-w-[34rem] grid-cols-3 gap-4 border-t border-line pt-5"
            custom={T.stats}
            variants={fade}
            animate={controls}
          >
            {[
              { value: copy.hero.stats.gwa.value, label: copy.hero.stats.gwa.label },
              { value: String(projects.length), label: copy.hero.stats.live.label },
              { value: copy.hero.stats.grad.value, label: copy.hero.stats.grad.label },
            ].map((s) => (
              <div key={s.label} className="min-w-0">
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display text-[clamp(1.75rem,3.2vw,2.5rem)] leading-none text-ink">{s.value}</dd>
                <dd className="mt-2 font-mono text-[0.6875rem] leading-snug text-ink-3">{s.label}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* ---------- Now ---------- */}
        <motion.aside
          aria-label="What I'm doing now"
          className="intro-fade lg:col-span-5 lg:mb-2"
          custom={T.now}
          variants={fade}
          animate={controls}
        >
          <div className="rounded-3xl border border-line bg-surface/90 p-6 shadow-[var(--e2)]">
            <div className="flex items-center justify-between font-mono text-[0.6875rem] uppercase tracking-[0.14em]">
              <span className="flex items-center gap-2 text-ink-2">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-moss opacity-60 motion-reduce:hidden" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-moss" />
                </span>
                Now
              </span>
              <span className="text-ink-3 tabular-nums">{time ? `${time} · GMT+8` : "GMT+8"}</span>
            </div>

            <div className="mt-5 flex items-center gap-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-line">
                <Image src="/jake.jpg" alt="Jake Neverida" fill sizes="56px" priority className="object-cover" />
              </div>
              <div className="min-w-0">
                <Dual value={copy.hero.status} note="none" className="text-sm font-medium text-ink" />
                <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-3">
                  <LuMapPin className="h-3 w-3" aria-hidden="true" />
                  Makati, Philippines
                </p>
              </div>
            </div>

            <div className="mt-5 border-t border-line pt-5">
              <Dual value={copy.hero.now} className="text-sm leading-relaxed text-ink-2" />
            </div>

            <GitHubActivity />

            <div className="mt-5 flex items-center gap-2">
              <a
                href="https://github.com/neverida-jk"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => soundFx.playClick(900)}
                className="inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-1.5 font-mono text-xs text-ink-2 transition-colors hover:border-ink-3 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-summit"
              >
                <SiGithub className="h-3.5 w-3.5" aria-hidden="true" />
                github.com/neverida-jk
              </a>
            </div>
          </div>
        </motion.aside>
      </motion.div>

      {/* Scroll cue — tells non-technical visitors what to do, and sets up
          the climb metaphor. Gone as soon as they start. */}
      <motion.div
        className="intro-fade pointer-events-none absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        custom={T.cue}
        variants={fade}
        animate={controls}
        aria-hidden="true"
      >
        <motion.div
          animate={{ opacity: scrolled ? 0 : 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-2"
        >
          <span className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-ink-3">{copy.hero.scrollCue}</span>
          <span className="relative block h-7 w-px overflow-hidden bg-line">
            <motion.span
              className="absolute inset-x-0 top-0 block h-3 bg-ink-2"
              // Stops once the visitor scrolls — an infinite loop kept writing
              // styles every frame long after the cue had faded out.
              animate={reduceMotion || scrolled ? { y: "-100%" } : { y: ["-100%", "240%"] }}
              transition={scrolled ? { duration: 0 } : { duration: 1.6, repeat: Infinity, ease: ease.inOut }}
            />
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}
