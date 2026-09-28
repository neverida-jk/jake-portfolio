"use client";

// Custom cursor (ASCENT_MASTERPLAN.md §5.5). Desktop + fine pointer only, and
// only once this component has actually mounted and confirmed it should run
// — the native cursor is never hidden globally as a default; the CSS rule
// that hides it is scoped to a class this effect adds only on success, so a
// failed mount (or a touch/coarse pointer device) always keeps the native
// cursor.
import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

const DOT_SPRING = { stiffness: 900, damping: 40, mass: 0.3 };
const RING_SPRING = { stiffness: 180, damping: 22, mass: 0.5 };
const BASE_SIZE = 30;

export default function Cursor() {
  const reduceMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [hiddenOverField, setHiddenOverField] = useState(false);
  const [linkHover, setLinkHover] = useState(false);

  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  const dotSpringX = useSpring(dotX, DOT_SPRING);
  const dotSpringY = useSpring(dotY, DOT_SPRING);

  const ringX = useMotionValue(-100);
  const ringY = useMotionValue(-100);
  const ringW = useMotionValue(BASE_SIZE);
  const ringH = useMotionValue(BASE_SIZE);
  const ringRadius = useMotionValue(BASE_SIZE);
  const ringSpringX = useSpring(ringX, RING_SPRING);
  const ringSpringY = useSpring(ringY, RING_SPRING);
  const ringSpringW = useSpring(ringW, RING_SPRING);
  const ringSpringH = useSpring(ringH, RING_SPRING);
  const ringSpringRadius = useSpring(ringRadius, RING_SPRING);

  const magnetTarget = useRef<Element | null>(null);

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

    const placeRing = () => {
      const el = magnetTarget.current;
      if (el && el.getAttribute("data-cursor") === "magnet") {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        ringX.set(rect.left);
        ringY.set(rect.top);
        ringW.set(rect.width);
        ringH.set(rect.height);
        ringRadius.set(parseFloat(style.borderRadius) || 12);
      }
    };

    const onMove = (e: PointerEvent) => {
      dotX.set(e.clientX);
      dotY.set(e.clientY);

      const el = magnetTarget.current;
      const isMagnet = el && el.getAttribute("data-cursor") === "magnet";
      if (!isMagnet) {
        ringX.set(e.clientX - BASE_SIZE / 2);
        ringY.set(e.clientY - BASE_SIZE / 2);
        ringW.set(BASE_SIZE);
        ringH.set(BASE_SIZE);
        ringRadius.set(BASE_SIZE);
      }

      const target = e.target as HTMLElement | null;
      setHiddenOverField(!!target?.closest("input, textarea"));
    };

    const onOver = (e: PointerEvent) => {
      const target = (e.target as HTMLElement | null)?.closest("[data-cursor]");
      if (!target) return;
      const kind = target.getAttribute("data-cursor");
      if (kind === "magnet") {
        magnetTarget.current = target;
        placeRing();
      } else if (kind === "link") {
        setLinkHover(true);
        ringW.set(BASE_SIZE * 1.9);
        ringH.set(BASE_SIZE * 1.9);
        ringRadius.set((BASE_SIZE * 1.9) / 2);
      }
    };

    const onOut = (e: PointerEvent) => {
      const target = (e.target as HTMLElement | null)?.closest("[data-cursor]");
      if (!target) return;
      if (target === magnetTarget.current) magnetTarget.current = null;
      setLinkHover(false);
      ringW.set(BASE_SIZE);
      ringH.set(BASE_SIZE);
      ringRadius.set(BASE_SIZE);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerout", onOut, { passive: true });
    window.addEventListener("scroll", placeRing, { passive: true });
    window.addEventListener("resize", placeRing);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerout", onOut);
      window.removeEventListener("scroll", placeRing);
      window.removeEventListener("resize", placeRing);
    };
  }, [enabled, dotX, dotY, ringX, ringY, ringW, ringH, ringRadius]);

  if (!enabled) return null;

  const opacity = hiddenOverField ? 0 : 1;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[200]" data-print-hide>
      <motion.div
        className="absolute top-0 left-0 h-[5px] w-[5px] rounded-full bg-ink"
        style={{ x: dotSpringX, y: dotSpringY, translateX: "-50%", translateY: "-50%", opacity }}
      />
      <motion.div
        className={`absolute top-0 left-0 border transition-colors duration-150 ${linkHover ? "border-summit" : "border-ink/70"}`}
        style={{
          x: ringSpringX,
          y: ringSpringY,
          width: ringSpringW,
          height: ringSpringH,
          borderRadius: ringSpringRadius,
          opacity,
        }}
      />
    </div>
  );
}
