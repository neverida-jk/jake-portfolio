"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useDragControls, type PanInfo } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { spring, dur } from "@/lib/motion";

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  /** id of the heading rendered inside `children`, for aria-labelledby */
  titleId: string;
  children: React.ReactNode;
  className?: string;
  /** "md" (default) — a compact dialog; "xl" — wide, for case studies. */
  size?: "md" | "xl";
  /** Desktop entrance: "slide" (default) or "fade". Use "fade" when the
   *  content contains a layoutId shared element — an ancestor that is
   *  itself translating would distort the morph. Mobile always slides. */
  desktopMotion?: "slide" | "fade";
}

const SIZE_CLASSES = {
  md: "sm:w-auto sm:min-w-[420px] sm:max-h-[80vh]",
  xl: "sm:w-[min(1040px,94vw)] sm:max-h-[88vh]",
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Centered dialog on desktop, drag-to-dismiss bottom sheet on mobile (§7.7).
// One component, responsive via Tailwind breakpoints — the drag/dismiss
// physics apply everywhere but only read as a "sheet" once the viewport is
// narrow enough for the panel to dock to the bottom edge.
export default function Sheet({
  isOpen,
  onClose,
  titleId,
  children,
  className,
  size = "md",
  desktopMotion = "slide",
}: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();
  const dragControls = useDragControls();
  const [desktop, setDesktop] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const fade = reduceMotion || (desktop && desktopMotion === "fade");
  const panelMotion = fade
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } };

  // Callers usually pass an inline arrow. With onClose as an effect
  // dependency, every parent re-render would tear down and re-run the
  // effect — restoring focus to the trigger and re-locking scroll mid-use.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    // Lock scroll with overflow:hidden on <html>, NOT position:fixed on
    // <body>. Pinning the body collapses the document height, so every
    // scroll-linked value (the rings, the chronometer) jumps to its end state
    // behind the open sheet. Pad by the scrollbar width to avoid a shift.
    const root = document.documentElement;
    const scrollbar = window.innerWidth - root.clientWidth;
    const prev = { overflow: root.style.overflow, paddingRight: document.body.style.paddingRight };
    root.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;

    const focusFirst = () => {
      const node = panelRef.current;
      if (!node) return;
      const focusables = node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      (focusables[0] ?? node).focus();
    };
    const raf = requestAnimationFrame(focusFirst);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const node = panelRef.current;
      if (!node) return;
      const focusables = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", handleKeyDown);
      root.style.overflow = prev.overflow;
      document.body.style.paddingRight = prev.paddingRight;
      // preventScroll: restoring focus must not yank the page to the trigger.
      previouslyFocused.current?.focus({ preventScroll: true });
    };
  }, [isOpen]);

  const handleDragEnd = useCallback((_: unknown, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 650) onCloseRef.current();
  }, []);

  // Portalled to <body>: a transformed ancestor (e.g. a .reveal-item section)
  // turns position:fixed into "fixed to that ancestor", boxing the overlay
  // inside the section instead of covering the viewport.
  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[150] flex items-end justify-center sm:items-center bg-void/55 backdrop-blur-sm"
          data-print-hide
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.2 : dur.sm }}
          onClick={() => onCloseRef.current()}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            // Drag starts only from the grab handle. Making the whole panel the
            // drag target (with touch-action:none) hijacks vertical touch, so
            // long sheet content could never scroll on a phone.
            drag={fade ? false : "y"}
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.55 }}
            onDragEnd={handleDragEnd}
            {...panelMotion}
            transition={fade ? { duration: reduceMotion ? 0.2 : dur.md } : spring.sheet}
            className={`w-full max-h-[88vh] overflow-y-auto overscroll-contain bg-surface border border-line rounded-t-3xl sm:rounded-3xl shadow-2xl ${SIZE_CLASSES[size]} ${className ?? ""}`}
          >
            <div
              className="sticky top-0 z-10 flex justify-center pt-3 pb-2 sm:hidden cursor-grab active:cursor-grabbing bg-surface rounded-t-3xl"
              style={{ touchAction: "none" }}
              onPointerDown={(e) => dragControls.start(e)}
              aria-hidden="true"
            >
              <span className="h-1 w-10 rounded-full bg-ink-3/40" />
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
