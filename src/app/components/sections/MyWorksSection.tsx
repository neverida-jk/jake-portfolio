"use client";

import React, { useState } from "react";
import Image from "next/image";
import { soundFx } from "@/util/sound";
import {
  LuArrowUpRight,
  LuExternalLink,
  LuGlobe,
} from "react-icons/lu";

interface MediaItem {
  src: string;
  type: "image" | "video";
  alt?: string;
}

interface MyWorksSectionProps {
  onCardClick?: (
    title: string,
    cardDescription: string,
    modalDescription: string,
    date?: string,
    imageSrc?: string,
    imageSize?: number,
    media?: MediaItem[]
  ) => void;
}

interface Project {
  id: string;
  title: string;
  domain: string;
  liveUrl: string;
  category: string;
  tagline: string;
  summary: string;
  modalDescription: string;
  metrics: string;
  tags: string[];
  logo: string;
  thumbnail: string;
  invert?: boolean;
}

const PROJECTS_DATA: Project[] = [
  {
    id: "quant",
    title: "Prediction Market Edge Engine",
    domain: "quant.dev-jk.me",
    liveUrl: "https://quant.dev-jk.me",
    category: "Quantitative Intelligence & Algorithms",
    tagline: "Statistical probability edge modeling & Kelly criterion position sizing for prediction markets.",
    summary:
      "A quantitative intelligence engine analyzing prediction market order books (e.g. Polymarket). Models real-time implied probability distributions, Brier score calibration, and optimal Kelly criterion stake allocation to identify statistical mispricings.",
    modalDescription:
      "Prediction Market Edge Engine (quant.dev-jk.me). Analyzes live prediction market mechanics with quantitative probability metrics. Implements mathematical order book parsing, implied versus calibrated probability modeling, Brier scoring accuracy analysis, and fraction Kelly criterion bankroll management.",
    metrics: "Kelly Sizing &bull; Order Book Analytics &bull; Polymarket Edge",
    tags: ["Probability Modeling", "Kelly Criterion", "TypeScript", "React", "Prediction Markets"],
    logo: "/python.png",
    thumbnail: "/projects/quant.png",
  },
  {
    id: "tropa",
    title: "Tropa — Climb & Expense Coordinator",
    domain: "tropa.dev-jk.me",
    liveUrl: "https://tropa.dev-jk.me",
    category: "Full-Stack Web Platform",
    tagline: "Philippine mountain itinerary planning, headcount logistics, and shared cost splitting.",
    summary:
      "Full-stack mountaineering coordination platform for Philippine trails (Pulag, Apo, Ulap, Batulao). Allows groups to select trails, schedule van and trailhead timetables, track gear/permits, and split multi-party shared expenses with zero-friction climb join codes.",
    modalDescription:
      "Tropa (tropa.dev-jk.me) — 'Plan the climb. Keep the Tropa together.' Engineered with Next.js App Router, React 19, and Tailwind CSS. Built to eliminate fragmented group chats and spreadsheets by managing trail logistics, headcount validation, and multi-currency expense splitting in one unified collaborative space.",
    metrics: "Next.js App Router &bull; Real Trail Logistics &bull; Cost-Split Engine",
    tags: ["Next.js 15", "React 19", "Tailwind CSS", "TypeScript", "Collaborative State"],
    logo: "/next.svg",
    thumbnail: "/projects/tropa.png",
    invert: true,
  },
  {
    id: "finance",
    title: "Finance Tracker PWA",
    domain: "finance.dev-jk.me",
    liveUrl: "https://finance.dev-jk.me",
    category: "Offline-First Web App / PWA",
    tagline: "Zero-latency offline-first personal financial management and dynamic analytics.",
    summary:
      "A Progressive Web App (PWA) delivering client-side financial analytics and budget tracking. Uses Dexie.js over IndexedDB for resilient offline-first persistence, Recharts for interactive spending breakdowns, and Framer Motion for responsive tactile transitions.",
    modalDescription:
      "Finance Tracker (finance.dev-jk.me). Offline-first Progressive Web App designed for private, high-speed financial analytics. Features client-side schema migrations via Dexie.js (IndexedDB), category budgeting, cash flow forecasting, transaction ledgers, and animated Recharts data visualizations.",
    metrics: "IndexedDB (Dexie.js) &bull; Recharts Analytics &bull; Offline PWA",
    tags: ["React", "Dexie.js", "IndexedDB", "Recharts", "PWA", "Framer Motion"],
    logo: "/react.png",
    thumbnail: "/projects/finance.png",
  },
  {
    id: "portfolio-v2",
    title: "Developer Portfolio v2",
    domain: "dev-jk.me",
    liveUrl: "https://neverida-jk.github.io/portfolio",
    category: "Creative Engineering & UI Systems",
    tagline: "Modern developer showcase featuring embedded Unix shell and synthesized Web Audio.",
    summary:
      "Personal portfolio engineered with Next.js 15 App Router, React 19, and Tailwind CSS v4. Features an embedded interactive Unix CLI sandbox, global Cmd+K spotlight palette, Web Audio API sound synthesizer, and dynamic celebration canvas particle cannons.",
    modalDescription:
      "Personal developer portfolio engineered with Next.js 15 App Router, React 19, and Tailwind CSS v4. Features an embedded interactive Unix-like CLI sandbox, global keyboard shortcut command palette, Web Audio API sound synthesizer, and dynamic canvas particle animations.",
    metrics: "100/100 Lighthouse &bull; Web Audio API &bull; Turbopack",
    tags: ["Next.js 15", "React 19", "Tailwind v4", "TypeScript", "Web Audio API"],
    logo: "/next.svg",
    thumbnail: "/projects/portfolio-v2.png",
    invert: true,
  },
];

export default function MyWorksSection({ onCardClick }: MyWorksSectionProps) {
  const [activeProjectId, setActiveProjectId] = useState<string>("quant");

  const activeProject =
    PROJECTS_DATA.find((p) => p.id === activeProjectId) || PROJECTS_DATA[0];

  return (
    <section id="projects" className="reveal-item px-4 sm:px-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-6 pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-bold font-rubik text-zinc-100 tracking-tight">
            Featured Projects & Live Systems
          </h2>
        </div>
        <span className="text-xs font-mono text-zinc-500">Live Production Apps</span>
      </div>

      {/* Multi-Element Project Showcase: Interactive Browser Simulator (Top) + Project Spec Shelf (Bottom) */}
      <div className="space-y-4">
        {/* Element 1: Interactive Browser Window Mockup */}
        <div className="glass-panel rounded-3xl overflow-hidden border border-white/[0.1] shadow-2xl bg-[#060608]">
          {/* Browser Address Bar Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-zinc-950 border-b border-white/[0.08] gap-3">
            {/* Window Traffic Lights */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            </div>

            {/* URL Display with Linkout */}
            <a
              href={activeProject.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundFx.playClick(900)}
              className="flex-1 max-w-md mx-auto px-3.5 py-1 rounded-full bg-zinc-900/90 hover:bg-zinc-850 border border-white/[0.08] text-[11px] font-mono text-zinc-300 text-center truncate flex items-center justify-center gap-2 transition-colors group cursor-pointer"
              title={`Open ${activeProject.domain} in new tab`}
            >
              <LuGlobe className="w-3 h-3 text-emerald-400" />
              <span className="group-hover:text-white font-medium">{activeProject.domain}</span>
              <LuExternalLink className="w-2.5 h-2.5 text-zinc-500 group-hover:text-zinc-300" />
            </a>

            {/* Quick Project Select Tabs */}
            <div className="flex items-center gap-1 shrink-0">
              {PROJECTS_DATA.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    soundFx.playClick(900);
                    setActiveProjectId(p.id);
                  }}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    p.id === activeProject.id
                      ? "bg-zinc-800 border border-white/[0.18] scale-105"
                      : "opacity-50 hover:opacity-100 hover:bg-zinc-900"
                  }`}
                  title={p.title}
                >
                  <Image
                    src={p.logo}
                    alt={p.title}
                    width={18}
                    height={18}
                    className={`object-contain ${p.invert ? "invert opacity-80" : ""}`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Browser Viewport Stage */}
          <div className="bg-gradient-to-b from-zinc-950 to-zinc-900/80 relative overflow-hidden">
            {/* Real landing page screenshot — actual proof it's live, not just a text card */}
            <div className="relative w-full aspect-video bg-zinc-950 border-b border-white/[0.06]">
              <Image
                key={activeProject.id}
                src={activeProject.thumbnail}
                alt={`${activeProject.title} landing page`}
                fill
                sizes="(max-width: 768px) 100vw, 800px"
                className="object-cover object-top animate-fade-in-fast"
                priority={activeProject.id === PROJECTS_DATA[0].id}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
            </div>

            <div className="max-w-2xl space-y-4 p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-zinc-900 text-zinc-400 border border-white/[0.08] text-[11px] font-mono">
                  {activeProject.category}
                </span>
                <span className="text-zinc-600">&bull;</span>
                <span className="text-xs font-mono text-emerald-400">
                  {activeProject.domain}
                </span>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-bold font-rubik text-white tracking-tight">
                  {activeProject.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 font-rubik mt-1">
                  {activeProject.tagline}
                </p>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 font-rubik leading-relaxed">
                {activeProject.summary}
              </p>

              {/* Engineering Metrics Bar */}
              <div className="py-2 px-3 rounded-xl bg-zinc-900/70 border border-white/[0.06] text-xs font-mono text-emerald-400">
                <span dangerouslySetInnerHTML={{ __html: activeProject.metrics }} />
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {activeProject.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 text-[11px] font-mono rounded bg-zinc-900 text-zinc-300 border border-white/[0.06]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Live Links (No source code buttons - private to user) */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <a
                  href={activeProject.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => soundFx.playClick(900)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-zinc-950 font-rubik text-xs font-medium hover:bg-zinc-200 transition-colors shadow-md active:scale-95 cursor-pointer"
                >
                  <LuExternalLink className="w-3.5 h-3.5" />
                  <span>Launch {activeProject.domain}</span>
                </a>

                <button
                  onClick={() => {
                    soundFx.playClick(850);
                    onCardClick?.(
                      activeProject.title,
                      activeProject.summary,
                      activeProject.modalDescription,
                      activeProject.domain,
                      activeProject.logo,
                      72,
                      [{ src: activeProject.logo, type: "image", alt: activeProject.title }]
                    );
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-rubik text-xs border border-white/[0.08] transition-colors active:scale-95 cursor-pointer"
                >
                  <span>Technical Specs</span>
                  <LuArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-only: swipeable thumbnail strip. The desktop shelf below
            duplicates project details already shown above — on a single
            narrow column that's just repeated scrolling, so mobile gets a
            compact swipe-to-browse strip of screenshots instead. */}
        <div className="sm:hidden -mx-4 px-4">
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1 scrollbar-hide">
            {PROJECTS_DATA.map((p) => {
              const isSelected = p.id === activeProject.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    soundFx.playClick(900);
                    setActiveProjectId(p.id);
                  }}
                  className={`relative shrink-0 w-[75%] snap-center rounded-2xl overflow-hidden border transition-all ${
                    isSelected ? "border-emerald-500/50 shadow-lg" : "border-white/[0.08] opacity-60"
                  }`}
                >
                  <div className="relative w-full aspect-video bg-zinc-950">
                    <Image
                      src={p.thumbnail}
                      alt={`${p.title} landing page`}
                      fill
                      sizes="75vw"
                      className="object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                    <h4 className="text-xs font-rubik font-semibold text-white truncate">
                      {p.title}
                    </h4>
                    <span className="text-[10px] font-mono text-emerald-400 truncate block">
                      {p.domain}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex justify-center gap-1.5 mt-2">
            {PROJECTS_DATA.map((p) => (
              <span
                key={p.id}
                className={`h-1 rounded-full transition-all ${
                  p.id === activeProject.id ? "w-4 bg-emerald-400" : "w-1 bg-zinc-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Element 2: Project Architecture Shelf (Interactive Selector Strips) */}
        <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {PROJECTS_DATA.map((p) => {
            const isSelected = p.id === activeProject.id;

            return (
              <div
                key={p.id}
                onClick={() => {
                  soundFx.playClick(900);
                  setActiveProjectId(p.id);
                }}
                className={`glass-card rounded-2xl p-3.5 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? "border-white/[0.25] bg-zinc-800/80 shadow-md scale-[1.01]"
                    : "hover:border-white/[0.12] hover:bg-zinc-900/60"
                }`}
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/[0.08] p-1.5 flex items-center justify-center shrink-0">
                    <Image
                      src={p.logo}
                      alt={p.title}
                      width={20}
                      height={20}
                      className={`object-contain ${p.invert ? "invert opacity-80" : ""}`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-rubik font-semibold text-white truncate">
                      {p.title}
                    </h4>
                    <span className="text-[10px] font-mono text-emerald-400 truncate block">
                      {p.domain}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-zinc-400 flex items-center justify-between pt-1.5 border-t border-white/[0.04]">
                  <span className="text-[10px] text-zinc-500 truncate">{p.category}</span>
                  <span className="text-zinc-300 text-[11px] shrink-0">&rarr;</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
