"use client";

import React, { useState } from "react";
import { soundFx } from "@/util/sound";
import { LuLayers, LuZap, LuCpu, LuCheck, LuShieldCheck } from "react-icons/lu";

interface Principle {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  standards: string[];
}

export default function WhyWorkWithMeSection() {
  const [activeTab, setActiveTab] = useState<string>("qa");

  const principles: Principle[] = [
    {
      id: "qa",
      title: "Quality & Reliability",
      subtitle: "Defect Prevention & Release Assurance",
      description:
        "Bringing a dedicated Quality Assurance mindset to every project. Validating system requirements, maintaining regression suites, and ensuring defect-free production deployments.",
      icon: <LuShieldCheck className="w-4 h-4 text-emerald-400" />,
      standards: [
        "Comprehensive test cases & regression suites",
        "Rigorous defect lifecycle tracking & triage",
        "Cross-browser stability & release validation",
      ],
    },
    {
      id: "arch",
      title: "Clean Architecture",
      subtitle: "Modular Systems & Strict Boundaries",
      description:
        "Writing modular, type-safe, and self-documenting code with clear domain boundaries, reusable abstractions, and zero technical debt.",
      icon: <LuLayers className="w-4 h-4 text-cyan-400" />,
      standards: [
        "Strict TypeScript contracts & interfaces",
        "Deterministic component state machines",
        "Maintainable folder & domain separation",
      ],
    },
    {
      id: "speed",
      title: "Execution & Ownership",
      subtitle: "Velocity with Production Discipline",
      description:
        "Shipping working software with full ownership—from initial architectural planning and API design to UI polish and production monitoring.",
      icon: <LuZap className="w-4 h-4 text-amber-400" />,
      standards: [
        "Rapid prototyping with production discipline",
        "Comprehensive edge-case and error handling",
        "Proactive problem resolution & telemetry",
      ],
    },
    {
      id: "rigor",
      title: "Engineering Rigor",
      subtitle: "CS Foundations & Algorithmic Efficiency",
      description:
        "Applying solid computer science fundamentals: asymptotic complexity optimization, scalable data structures, and systemic analysis.",
      icon: <LuCpu className="w-4 h-4 text-blue-400" />,
      standards: [
        "Optimal time and memory complexity",
        "Graph traversals, queues, and tree structures",
        "Clean algorithmic problem-solving",
      ],
    },
  ];

  const currentPrinciple =
    principles.find((p) => p.id === activeTab) || principles[0];

  return (
    <section id="why-work-with-me" className="reveal-item px-4 sm:px-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-6 pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-bold font-rubik text-zinc-100 tracking-tight">
            Approach & Engineering Philosophy
          </h2>
        </div>
        <span className="text-xs font-mono text-zinc-500">Core Principles</span>
      </div>

      {/* Multi-Element Interactive Manifesto: Navigation Strip (Left) + Principle Focus Canvas (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        {/* Navigation Selector Strip (5 cols) */}
        <div className="md:col-span-5 space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block pl-1">
            Core Principles:
          </span>

          <div className="space-y-2">
            {principles.map((p) => {
              const isSelected = p.id === currentPrinciple.id;

              return (
                <button
                  key={p.id}
                  onClick={() => {
                    soundFx.playClick(900);
                    setActiveTab(p.id);
                  }}
                  className={`w-full glass-card rounded-2xl p-3.5 flex items-center justify-between text-left transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "border-white/[0.28] bg-zinc-800/80 shadow-md scale-[1.01]"
                      : "hover:border-white/[0.12] hover:bg-zinc-900/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-zinc-900 border border-white/[0.08] shrink-0">
                      {p.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-rubik font-semibold text-white truncate">
                        {p.title}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400 truncate">
                        {p.subtitle}
                      </div>
                    </div>
                  </div>

                  <span className="text-zinc-500 text-xs font-mono pl-2 shrink-0">
                    &rarr;
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Principle Focus Canvas (7 cols) */}
        <div className="md:col-span-7 glass-panel rounded-3xl p-6 sm:p-7 border border-white/[0.1] shadow-2xl flex flex-col justify-between bg-gradient-to-br from-zinc-900/95 via-zinc-900/60 to-zinc-950/95">
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-white/[0.06]">
              <div className="p-2.5 rounded-2xl bg-zinc-900 border border-white/[0.08] shrink-0">
                {currentPrinciple.icon}
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block">
                  Engineering Commitment
                </span>
                <h3 className="font-rubik font-bold text-lg sm:text-xl text-white">
                  {currentPrinciple.title}
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 font-rubik leading-relaxed">
              {currentPrinciple.description}
            </p>

            <div className="pt-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-2">
                Operational Standards:
              </span>

              <div className="space-y-2">
                {currentPrinciple.standards.map((std, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 text-xs font-rubik text-zinc-200 bg-zinc-900/80 px-3.5 py-2 rounded-xl border border-white/[0.04]"
                  >
                    <LuCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{std}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.04] mt-4 flex items-center justify-between text-[11px] font-mono text-zinc-500">
            <span>Quality & Engineering Best Practices</span>
            <span className="text-emerald-400">Strict Standards</span>
          </div>
        </div>
      </div>
    </section>
  );
}
