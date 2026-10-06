"use client";

// Custom cursor. Desktop + fine pointer only, and only once this component
// has actually mounted and confirmed it should run — the native cursor is
// never hidden globally; the CSS rule that hides it is scoped to a class this
// effect adds only on success, so a failed mount (or a touch/coarse pointer
// device) always keeps the native cursor.
//
// A dot that tracks the pointer exactly, and a ring that follows on a spring.
// The ring is a small slow-turning dial (twelve ticks). Over anything
// clickable it grows and turns gold; over [data-cursor-label] it becomes a
// labelled circle; over [data-cursor="magnet"] it wraps the element.
// Pressing squeezes it. It hides over text fields and when the pointer
// leaves the window.
import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

const DOT_SPRING = { stiffness: 900, damping: 40, mass: 0.3 };
const RING_SPRING = { stiffness: 220, damping: 24, mass: 0.5 };
const BASE = 34;
const LINK = 56;
const LABEL = 72;

type Mode = "idle" | "link" | "label" | "magnet";

const CLICKABLE = "[data-cursor], [data-cursor-label], a[href], button, summary, [role='tab'], [role='button'], label[for]";

export default function Cursor() {
  const reduceMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<Mode>("idle");
  const [label, setLabel] = useState("");
  const [down, setDown] = useState(false);
  const [onField, setOnField] = useState(false);
  const [inWindow, setInWindow] = useState(true);

  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  const dotSpringX = useSpring(dotX, DOT_SPRING);
  const dotSpringY = useSpring(dotY, DOT_SPRING);

  const ringX = useMotionValue(-100);
  const ringY = useMotionValue(-100);
  const ringW = useMotionValue(BASE);
  const ringH = useMotionValue(BASE);
  const ringRadius = useMotionValue(BASE);
  const ringSpringX = useSpring(ringX, RING_SPRING);
  const ringSpringY = useSpring(ringY, RING_SPRING);
  const ringSpringW = useSpring(ringW, RING_SPRING);
  const ringSpringH = useSpring(ringH, RING_SPRING);
  const ringSpringRadius = useSpring(ringRadius, RING_SPRING);

  const magnetTarget = useRef<Element | null>(null);
  const pointer = useRef({ x: -100, y: -100 });
  const size = useRef(BASE);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine || reduceMotion) {
      setEnabled(false);
      return;
    }
    setEnabled(true);
    document.documentElement.classList.add("cursor-ready");
    return () => document.documentElement.classList.remove("cursor-ready");
  }, [reduceMotion]);

  useEffect(() => {
    if (!enabled) return;

    // Centre the ring on the pointer at the given size, or wrap an element.
    const centre = (s: number) => {
      size.current = s;
      ringW.set(s);
      ringH.set(s);
      ringRadius.set(s);
      ringX.set(pointer.current.x - s / 2);
      ringY.set(pointer.current.y - s / 2);
    };

    const wrap = (el: Element) => {
      const rect = el.getBoundingClientRect();
      ringX.set(rect.left);
      ringY.set(rect.top);
      ringW.set(rect.width);
      ringH.set(rect.height);
      ringRadius.set(parseFloat(window.getComputedStyle(el).borderRadius) || 12);
    };

    const onMove = (e: PointerEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY };
      dotX.set(e.clientX);
      dotY.set(e.clientY);
      if (!magnetTarget.current) {
        ringX.set(e.clientX - size.current / 2);
        ringY.set(e.clientY - size.current / 2);
      }
      setOnField(!!(e.target as HTMLElement | null)?.closest("input, textarea"));
    };

    // Runs when the pointer enters a new element: decides the cursor's mode.
    const onOver = (e: PointerEvent) => {
      const target = (e.target as HTMLElement | null)?.closest(CLICKABLE) as HTMLElement | null;
      magnetTarget.current = null;
      if (!target) {
        setMode("idle");
        setLabel("");
        centre(BASE);
        return;
      }
      const kind = target.getAttribute("data-cursor");
      const text = target.getAttribute("data-cursor-label") ?? "";
      if (kind === "magnet") {
        magnetTarget.current = target;
        setMode("magnet");
        setLabel("");
        wrap(target);
      } else if (text) {
        setMode("label");
        setLabel(text);
        centre(LABEL);
      } else {
        setMode("link");
        setLabel("");
        centre(LINK);
      }
    };

    const reposition = () => {
      if (magnetTarget.current) wrap(magnetTarget.current);
    };
    const onDown = () => setDown(true);
    const onUp = () => setDown(false);
    const onLeave = () => setInWindow(false);
    const onEnter = () => setInWindow(true);

    const root = document.documentElement;
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("scroll", reposition, { passive: true });
    window.addEventListener("resize", reposition);
    root.addEventListener("mouseleave", onLeave);
    root.addEventListener("mouseenter", onEnter);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("scroll", reposition);
      window.removeEventListener("resize", reposition);
      root.removeEventListener("mouseleave", onLeave);
      root.removeEventListener("mouseenter", onEnter);
    };
  }, [enabled, dotX, dotY, ringX, ringY, ringW, ringH, ringRadius]);

  if (!enabled) return null;

  const opacity = onField || !inWindow ? 0 : 1;
  const showTicks = mode === "idle" || mode === "link";

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[200]" data-print-hide>
      <motion.div
        className="absolute top-0 left-0 h-[5px] w-[5px] rounded-full bg-ink transition-[background-color,transform] duration-200"
        style={{
          x: dotSpringX,
          y: dotSpringY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: mode === "label" ? 0 : opacity,
          scale: mode === "link" ? 0.6 : 1,
        }}
      />
      <motion.div
        className={`absolute top-0 left-0 grid place-items-center border transition-[border-color,background-color,color] duration-200 ${
          mode === "magnet"
            ? "border-ink/70 text-ink"
            : mode === "idle"
              ? "border-transparent text-ink-2"
              : "border-summit/80 bg-summit/10 text-summit"
        }`}
        style={{
          x: ringSpringX,
          y: ringSpringY,
          width: ringSpringW,
          height: ringSpringH,
          borderRadius: ringSpringRadius,
          opacity,
        }}
      >
        <div
          className="grid h-full w-full place-items-center transition-transform duration-150"
          style={{ transform: down ? "scale(0.82)" : "scale(1)" }}
        >
          <svg
            viewBox="0 0 40 40"
            className="absolute inset-0 h-full w-full transition-opacity duration-200"
            style={{ opacity: showTicks ? 1 : 0, animation: "cursor-spin 28s linear infinite" }}
            fill="none"
          >
            <circle cx={20} cy={20} r={18.4} stroke="currentColor" strokeWidth={2.2} strokeDasharray="1 8.69" strokeLinecap="round" />
          </svg>
          {label && <span className="font-mono text-[10px] uppercase tracking-[0.14em]">{label}</span>}
        </div>
      </motion.div>
    </div>
  );
}
