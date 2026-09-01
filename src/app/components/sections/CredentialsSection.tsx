"use client";

import React from "react";
import Image from "next/image";
import { soundFx } from "@/util/sound";
import {
  LuShieldCheck,
  LuBriefcase,
  LuGraduationCap,
  LuCheck,
  LuBookOpen,
} from "react-icons/lu";

interface MediaItem {
  src: string;
  type: "image" | "video";
  alt?: string;
}

interface CredentialsSectionProps {
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

export default function CredentialsSection({ onCardClick }: CredentialsSectionProps) {
  const experienceVertere = {
    id: "vertere",
    title: "Quality Assurance Analyst",
    company: "Vertere Global Solutions Inc.",
    badge: "Current Role",
    current: true,
    period: "June 2026 – Present",
    summary:
      "Executing comprehensive software testing strategies, defect lifecycle management, regression suites, and release readiness verification for enterprise applications.",
    modalDescription:
      "Quality Assurance Analyst at Vertere Global Solutions Inc. (June 2026 – Present). Driving software quality through systematic test case authoring, manual and automated regression suites, defect isolation and root-cause analysis, and cross-functional release quality assurance.",
    icon: <LuShieldCheck className="w-5 h-5 text-emerald-400" />,
    deliverables: [
      "Authored and executed comprehensive test plans and regression suites",
      "Managed defect lifecycle, issue triage, and root-cause isolation",
      "Collaborated with engineering leads to ensure production release quality",
    ],
    tags: ["QA Testing", "Test Plans", "Defect Management", "Regression Suites", "Release Quality"],
  };

  const experienceLimitless = {
    id: "limitless",
    title: "Software Engineer Intern",
    company: "Limitless Lab",
    badge: "Internship",
    current: false,
    period: "May 2025 – July 2025",
    summary:
      "Engineered responsive user interfaces, integrated RESTful API endpoints, and built modular React component libraries in an agile engineering team.",
    modalDescription:
      "Software Engineer Internship at Limitless Lab (May 2025 – July 2025). Collaborated with cross-functional engineering teams to implement modern web applications using React, Next.js, and TypeScript. Refactored UI components for accessibility, responsive performance, and state management.",
    logo: "/limitlesslab.jpeg",
    deliverables: [
      "Built modular, accessible React component libraries and client views",
      "Integrated RESTful API endpoints and handled asynchronous data streams",
    ],
    tags: ["React", "Next.js", "TypeScript", "REST APIs", "Agile Sprints"],
  };

  const education = {
    title: "BS Computer Science",
    institution: "University of the Philippines Los Baños",
    badge: "Academic Degree",
    period: "2022 – 2026",
    summary:
      "Four-year computer science curriculum combining rigorous theoretical foundations with practical software systems engineering.",
    modalDescription:
      "Bachelor of Science in Computer Science at University of the Philippines Los Baños (2022 – 2026). Iskolar ng Bayan with a cumulative GWA of 1.95. Rigorous study in algorithms & complexity, data structures, software architecture, database management, and operating systems.",
    logo: "/uplb.png",
    gwa: "1.95 GWA",
    honors: "Iskolar ng Bayan",
    highlights: [
      "Algorithms & Complexity (asymptotic analysis, graph algorithms)",
      "Advanced Data Structures & Object-Oriented Systems",
      "Database Architecture, Query Optimization & System Design",
      "Operating Systems, Memory Models & Concurrent Programming",
    ],
    tags: [
      "Algorithms & Complexity",
      "Data Structures",
      "Database Systems",
      "1.95 GWA",
      "UPLB '26",
    ],
  };

  return (
    <section id="credentials" className="reveal-item px-4 sm:px-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-6 pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-bold font-rubik text-zinc-100 tracking-tight">
            Experience & Education
          </h2>
        </div>
        <span className="text-xs font-mono text-zinc-500">Career & Academic Record</span>
      </div>

      {/* Balanced 2-Column Presentation: Professional Experience (Left 6 cols) vs Academic Foundation (Right 6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Column 1: Professional Experience (6 cols) */}
        <div className="lg:col-span-6 flex flex-col justify-between gap-4">
          {/* Subheader */}
          <div className="flex items-center justify-between pl-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <LuBriefcase className="w-3 h-3 text-emerald-400" />
              <span>Industry Experience</span>
            </span>
            <span className="text-[10px] font-mono text-zinc-500">QA & Software Engineering</span>
          </div>

          {/* Card A: Vertere Global Solutions Inc. (Current Role) */}
          <div
            onClick={() => {
              soundFx.playClick(850);
              onCardClick?.(
                experienceVertere.title,
                experienceVertere.summary,
                experienceVertere.modalDescription,
                experienceVertere.period
              );
            }}
            className="glass-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between cursor-pointer hover:border-emerald-500/40 hover:shadow-xl transition-all duration-300 group border border-white/[0.1] bg-gradient-to-br from-zinc-900/95 via-zinc-900/70 to-zinc-950/90"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-zinc-900 border border-emerald-500/30 p-2 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                    {experienceVertere.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">
                        {experienceVertere.badge}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <h3 className="font-rubik font-bold text-base sm:text-lg text-white group-hover:text-emerald-300 transition-colors">
                      {experienceVertere.title}
                    </h3>
                    <p className="text-xs text-zinc-400 font-rubik">
                      {experienceVertere.company}
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono shrink-0">
                  {experienceVertere.period}
                </span>
              </div>

              <p className="text-xs text-zinc-300 font-rubik leading-relaxed mb-3">
                {experienceVertere.summary}
              </p>

              <div className="space-y-1.5 mb-3">
                {experienceVertere.deliverables.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-zinc-400 font-rubik">
                    <LuCheck className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2.5 border-t border-white/[0.04] flex flex-wrap gap-1.5">
              {experienceVertere.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 text-[10px] font-mono rounded bg-zinc-900 text-zinc-300 border border-white/[0.06]"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Card B: Limitless Lab (Internship) */}
          <div
            onClick={() => {
              soundFx.playClick(850);
              onCardClick?.(
                experienceLimitless.title,
                experienceLimitless.summary,
                experienceLimitless.modalDescription,
                experienceLimitless.period,
                experienceLimitless.logo,
                72,
                [{ src: experienceLimitless.logo, type: "image", alt: experienceLimitless.company }]
              );
            }}
            className="glass-card rounded-3xl p-4 sm:p-5 flex flex-col justify-between cursor-pointer hover:border-white/[0.18] transition-all duration-300 group bg-zinc-950/70 border border-white/[0.06]"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/[0.08] p-1.5 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                    <Image
                      src={experienceLimitless.logo}
                      alt={experienceLimitless.company}
                      width={28}
                      height={28}
                      className="object-contain rounded-md"
                    />
                  </div>
                  <div>
                    <h3 className="font-rubik font-semibold text-sm sm:text-base text-white group-hover:text-zinc-200 transition-colors">
                      {experienceLimitless.title}
                    </h3>
                    <p className="text-xs text-zinc-400 font-rubik">
                      {experienceLimitless.company}
                    </p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-white/[0.06] text-[10px] font-mono shrink-0">
                  {experienceLimitless.period}
                </span>
              </div>

              <p className="text-xs text-zinc-400 font-rubik leading-relaxed mb-2.5">
                {experienceLimitless.summary}
              </p>

              <div className="space-y-1.5 mb-2.5">
                {experienceLimitless.deliverables.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-zinc-400 font-rubik">
                    <LuCheck className="w-3.5 h-3.5 text-zinc-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.04] flex flex-wrap gap-1.5">
              {experienceLimitless.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 text-[10px] font-mono rounded bg-zinc-900/80 text-zinc-400 border border-white/[0.04]"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2: Academic Foundation (6 cols) */}
        <div className="lg:col-span-6 flex flex-col justify-between gap-4">
          {/* Subheader */}
          <div className="flex items-center justify-between pl-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <LuGraduationCap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Academic Foundation</span>
            </span>
            <span className="text-[10px] font-mono text-zinc-500">Computer Science Rigor</span>
          </div>

          {/* Card C: University of the Philippines Los Baños */}
          <div
            onClick={() => {
              soundFx.playClick(850);
              onCardClick?.(
                education.title,
                education.summary,
                education.modalDescription,
                education.period,
                education.logo,
                80,
                [{ src: education.logo, type: "image", alt: education.institution }]
              );
            }}
            className="glass-card rounded-3xl p-5 sm:p-6 flex-1 flex flex-col justify-between cursor-pointer hover:border-emerald-500/30 hover:shadow-xl transition-all duration-300 group border border-white/[0.1] bg-gradient-to-br from-zinc-900/90 via-zinc-900/50 to-zinc-950/90"
          >
            <div>
              {/* University Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/[0.08] p-2 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                    <Image
                      src={education.logo}
                      alt={education.institution}
                      width={38}
                      height={38}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block">
                      {education.badge}
                    </span>
                    <h3 className="font-rubik font-bold text-base sm:text-lg text-white group-hover:text-emerald-300 transition-colors">
                      {education.title}
                    </h3>
                    <p className="text-xs text-zinc-400 font-rubik mt-0.5">
                      {education.institution}
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 text-zinc-300 border border-white/[0.08] text-[10px] font-mono shrink-0">
                  {education.period}
                </span>
              </div>

              {/* Dignified Academic Badges */}
              <div className="grid grid-cols-2 gap-2 mb-3.5">
                <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-white/[0.06]">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">Cumulative Average</div>
                  <div className="text-sm font-mono font-bold text-emerald-400">{education.gwa}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-white/[0.06]">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">Recognition</div>
                  <div className="text-sm font-mono font-medium text-zinc-200">{education.honors}</div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-rubik mb-3">
                {education.summary}
              </p>

              {/* Core Academic Foundations */}
              <div className="space-y-1.5 mb-3">
                {education.highlights.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300 font-rubik">
                    <LuCheck className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2.5 border-t border-white/[0.04] flex flex-wrap gap-1.5">
              {education.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 text-[10px] font-mono rounded bg-zinc-900 text-zinc-300 border border-white/[0.06]"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
