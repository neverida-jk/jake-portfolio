"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LuCheck } from "react-icons/lu";
import Navbar from "./components/layout/Navbar";
import AboutMe from "./components/sections/AboutMe";
import AnimationController from "./components/ui/AnimationController";
import CommandPalette from "./components/ui/CommandPalette";
import TerminalSandbox from "./components/ui/TerminalSandbox";
import PrintResume from "./components/system/PrintResume";
import { spring } from "@/lib/motion";

const EMAIL = "jlrneverida@gmail.com";

export default function Home() {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const open = () => setIsCommandPaletteOpen(true);
    window.addEventListener("open-command-palette", open);
    return () => window.removeEventListener("open-command-palette", open);
  }, []);

  const handleCopyEmail = useCallback(() => {
    navigator.clipboard.writeText(EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }, []);

  return (
    <main className="relative min-h-screen overflow-x-clip">
      <AnimationController />

      <Navbar
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenTerminal={() => setIsTerminalOpen(true)}
        onCopyEmail={handleCopyEmail}
      />

      <AboutMe onOpenTerminal={() => setIsTerminalOpen(true)} onCopyEmail={handleCopyEmail} />

      <PrintResume />

      <AnimatePresence>
        {copied && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={spring.snappy}
            className="fixed bottom-6 right-6 z-[170] flex items-center gap-2 rounded-xl border border-line bg-raised/95 px-3.5 py-2 font-mono text-xs text-ink shadow-[var(--e3)] backdrop-blur-sm"
            data-print-hide
          >
            <LuCheck className="h-3.5 w-3.5 text-moss" aria-hidden="true" />
            <span>Copied {EMAIL}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenTerminal={() => {
          setIsCommandPaletteOpen(false);
          setIsTerminalOpen(true);
        }}
        onCopyEmail={handleCopyEmail}
      />

      <TerminalSandbox
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        onNavigateToSection={(sectionId) => {
          // scrollTo, not scrollIntoView (which walks every scrollable ancestor).
          const el = document.getElementById(sectionId);
          if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 72, behavior: "smooth" });
        }}
      />
    </main>
  );
}
