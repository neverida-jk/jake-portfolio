"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion, type PanInfo } from "framer-motion";
import { spring, dur } from "@/lib/motion";

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  /** id of the heading rendered inside `children`, for aria-labelledby */
  titleId: string;
  children: React.ReactNode;
  className?: string;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Centered dialog on desktop, drag-to-dismiss bottom sheet on mobile (§7.7).
// One component, responsive via Tailwind breakpoints — the drag/dismiss
// physics apply everywhere but only read as a "sheet" once the viewport is
// narrow enough for the panel to dock to the bottom edge.
export default function Sheet({ isOpen, onClose, titleId, children, className }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const scrollY = window.scrollY;
    const { style } = document.body;
    const prev = { overflow: style.overflow, position: style.position, top: style.top, width: style.width };
    style.overflow = "hidden";
    style.position = "fixed";
    style.top = `-${scrollY}px`;
    style.width = "100%";

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
        onClose();
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
      style.overflow = prev.overflow;
      style.position = prev.position;
      style.top = prev.top;
      style.width = prev.width;
      window.scrollTo(0, scrollY);
      previouslyFocused.current?.focus();
    };
  }, [isOpen, onClose]);

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (info.offset.y > 120 || info.velocity.y > 650) onClose();
    },
    [onClose]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[150] flex items-end justify-center sm:items-center bg-black/70 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.2 : dur.sm }}
          onClick={onClose}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            drag={reduceMotion ? false : "y"}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.55 }}
            onDragEnd={handleDragEnd}
            initial={{ y: reduceMotion ? 0 : "100%" }}
            animate={{ y: 0 }}
            exit={{ y: reduceMotion ? 0 : "100%" }}
            transition={reduceMotion ? { duration: 0.2 } : spring.sheet}
            style={{ touchAction: "none" }}
            className={`w-full sm:w-auto sm:min-w-[420px] max-h-[85vh] sm:max-h-[80vh] overflow-y-auto overscroll-contain bg-surface border border-line rounded-t-3xl sm:rounded-3xl shadow-2xl ${className ?? ""}`}
          >
            <div className="flex justify-center pt-2.5 pb-1 sm:hidden" aria-hidden="true">
              <span className="h-1 w-10 rounded-full bg-ink-3/40" />
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
