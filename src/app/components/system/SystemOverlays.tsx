"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LuVolume2 } from "react-icons/lu";
import { copy } from "@/content/copy";
import { spring } from "@/lib/motion";
import { soundFx } from "@/util/sound";
import { fireConfetti } from "@/util/confetti";


const INVITE_KEY = "jake.soundInvite.shown";
const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

// Site-wide, opt-in layers that don't belong to any one section: the custom
// cursor, the one-time sound invite, and the Konami egg.
export default function SystemOverlays() {
  const [invite, setInvite] = useState(false);
  const konamiPos = useRef(0);

  // Sound is muted by default. After the visitor's first real click on
  // something interactive, offer it once per session — never auto-play.
  useEffect(() => {
    if (sessionStorage.getItem(INVITE_KEY) === "1") return;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    const onFirstClick = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest("a, button")) return;
      window.removeEventListener("pointerdown", onFirstClick);
      sessionStorage.setItem(INVITE_KEY, "1");
      if (!soundFx.getIsMuted()) return;
      setInvite(true);
      hideTimer = setTimeout(() => setInvite(false), 6000);
    };
    window.addEventListener("pointerdown", onFirstClick);
    return () => {
      window.removeEventListener("pointerdown", onFirstClick);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, []);

  // ↑ ↑ ↓ ↓ ← → ← → B A — a burst of confetti. Hidden, harmless.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      konamiPos.current = key === KONAMI[konamiPos.current] ? konamiPos.current + 1 : key === KONAMI[0] ? 1 : 0;
      if (konamiPos.current === KONAMI.length) {
        konamiPos.current = 0;
        soundFx.playSuccess();
        fireConfetti();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const enableSound = useCallback(() => {
    if (soundFx.getIsMuted()) soundFx.toggleMute();
    setInvite(false);
  }, []);

  return (
    <>

      <AnimatePresence>
        {invite && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={spring.snappy}
            className="fixed bottom-6 left-1/2 z-[160] -translate-x-1/2"
            data-print-hide
          >
            <button
              type="button"
              onClick={enableSound}
              className="flex items-center gap-2 rounded-full border border-line bg-raised/95 px-4 py-2 font-mono text-xs text-ink-2 shadow-[var(--e3)] backdrop-blur-sm transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-summit"
            >
              <LuVolume2 className="h-3.5 w-3.5 text-summit" aria-hidden="true" />
              {copy.common.soundInvite}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
