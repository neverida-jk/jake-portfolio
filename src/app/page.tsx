"use client";

import React, { useState, useEffect, useCallback } from "react";
import Navbar from "./components/layout/Navbar";
import AboutMe from "./components/sections/AboutMe";
import AnimationController from "./components/ui/AnimationController";
import Particles from "./components/ui/Particles";
import SkillModal from "./components/ui/SkillModal";
import ContentModal from "./components/ui/ContentModal";
import CommandPalette from "./components/ui/CommandPalette";
import TerminalSandbox from "./components/ui/TerminalSandbox";
import { LuCheck } from "react-icons/lu";

interface MediaItem {
  src: string;
  type: "image" | "video";
  alt?: string;
}

export default function Home() {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);

  const [selectedCard, setSelectedCard] = useState<{
    title: string;
    description?: string;
    date?: string;
    imageSrc?: string;
    media?: MediaItem[];
  } | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [particleRefresh, setParticleRefresh] = useState(false);
  const [copiedGlobalToast, setCopiedGlobalToast] = useState(false);

  useEffect(() => {
    const handleOpenCmd = () => setIsCommandPaletteOpen(true);
    window.addEventListener("open-command-palette", handleOpenCmd);
    return () => window.removeEventListener("open-command-palette", handleOpenCmd);
  }, []);

  const handleSkillClick = useCallback((skill: string) => {
    setSelectedSkill(skill);
    setIsSkillModalOpen(true);
  }, []);

  const handleCloseSkillModal = useCallback(() => {
    setIsSkillModalOpen(false);
    setTimeout(() => setSelectedSkill(null), 300);
  }, []);

  const handleCardClick = useCallback(
    (
      title: string,
      cardDescription: string,
      modalDescription: string,
      date?: string,
      imageSrc?: string,
      imageSize?: number,
      media?: MediaItem[]
    ) => {
      setSelectedCard({
        title,
        description: modalDescription,
        date,
        imageSrc,
        media,
      });
      setIsCardModalOpen(true);
    },
    []
  );

  const handleCloseCardModal = useCallback(() => {
    setIsCardModalOpen(false);
    setTimeout(() => setSelectedCard(null), 300);
  }, []);

  const handleCopyEmail = useCallback(() => {
    navigator.clipboard.writeText("jlrneverida@gmail.com");
    setCopiedGlobalToast(true);
    setTimeout(() => setCopiedGlobalToast(false), 2200);
  }, []);

  const handleToggleParticles = useCallback(() => {
    setParticleRefresh((prev) => !prev);
  }, []);

  const isModalActive =
    isSkillModalOpen || isCardModalOpen || isCommandPaletteOpen || isTerminalOpen;

  return (
    <main className="relative min-h-screen bg-[#050505] text-[#ededed] overflow-x-hidden">
      {/* Background Interactive Ambient Particles */}
      <Particles
        className="fixed inset-0 pointer-events-none -z-10 animate-fade-in opacity-70"
        quantity={45}
        refresh={particleRefresh}
      />

      {/* Global Scroll Animation Observer */}
      <AnimationController />

      {/* Floating Navigation Dock */}
      <Navbar
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenTerminal={() => setIsTerminalOpen(true)}
        onCopyEmail={handleCopyEmail}
      />

      {/* Main Content Sections */}
      <div
        className={`transition-opacity duration-200 ${
          isModalActive ? "opacity-40 pointer-events-none sm:pointer-events-auto" : ""
        }`}
      >
        <AboutMe
          onSkillClick={handleSkillClick}
          onCardClick={handleCardClick}
          onOpenTerminal={() => setIsTerminalOpen(true)}
          onCopyEmail={handleCopyEmail}
        />

        {/* Global Footer */}
        <footer className="border-t border-white/[0.04] mt-16 py-6 px-4 text-center text-xs font-mono text-zinc-500">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              Jake Neverida &bull; <span className="text-zinc-400">UP Los Baños</span>
            </div>
            <div className="text-zinc-600">
              Next.js 15 &bull; React 19 &bull; Tailwind CSS v4
            </div>
          </div>
        </footer>
      </div>

      {/* Global Toast Notification */}
      {copiedGlobalToast && (
        <div className="fixed bottom-6 right-6 z-[170] px-3.5 py-2 bg-zinc-900 text-zinc-100 text-xs font-mono rounded-xl shadow-2xl backdrop-blur-md animate-modal-enter flex items-center gap-2 border border-white/[0.1]">
          <LuCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Copied jlrneverida@gmail.com</span>
        </div>
      )}

      {/* Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenTerminal={() => {
          setIsCommandPaletteOpen(false);
          setIsTerminalOpen(true);
        }}
        onToggleParticles={handleToggleParticles}
        onCopyEmail={handleCopyEmail}
      />

      {/* Interactive Developer Terminal Sandbox */}
      <TerminalSandbox
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        onNavigateToSection={(sectionId) => {
          const el = document.getElementById(sectionId);
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* Skill Modal */}
      <SkillModal
        skill={selectedSkill || ""}
        isOpen={isSkillModalOpen}
        onClose={handleCloseSkillModal}
      />

      {/* Content / Project / Credential Modal */}
      <ContentModal
        title={selectedCard?.title || ""}
        description={selectedCard?.description}
        date={selectedCard?.date}
        media={selectedCard?.media}
        imageSrc={selectedCard?.imageSrc}
        isOpen={isCardModalOpen}
        onClose={handleCloseCardModal}
      />
    </main>
  );
}