"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { soundFx } from "@/util/sound";
import {
  SiPython,
  SiJavascript,
  SiReact,
  SiNextdotjs,
  SiNodedotjs,
  SiTailwindcss,
  SiMongodb,
  SiGithub,
  SiCplusplus,
  SiAnthropic,
  SiAmazonwebservices,
  SiDocker,
  SiGithubactions,
} from "react-icons/si";
import {
  LuCheck,
  LuX,
  LuShieldCheck,
  LuLayers,
  LuCpu,
  LuBrainCircuit,
  LuBot,
} from "react-icons/lu";

interface SkillModalProps {
  skill: string;
  isOpen: boolean;
  onClose: () => void;
}

interface SkillDetail {
  name: string;
  category: string;
  level: string;
  icon: React.ReactNode;
  logoSrc?: string;
  invert?: boolean;
  deployedIn: string;
  description: string;
  points: string[];
}

const SKILL_DETAILS: Record<string, SkillDetail> = {
  python: {
    name: "Python",
    category: "Languages & Modeling",
    level: "Advanced",
    icon: <SiPython className="w-6 h-6 text-yellow-300/90" />,
    logoSrc: "/python.png",
    deployedIn: "quant.dev-jk.me & UPLB algorithmic studies",
    description:
      "Primary language for mathematical modeling, probability distribution analysis, graph traversals, and computational algorithms.",
    points: [
      "Probability distribution modeling and Kelly criterion calculations",
      "Graph traversals, shortest path, and topological algorithms",
      "Algorithmic complexity benchmarking and data structures",
    ],
  },
  javascript: {
    name: "JavaScript",
    category: "Languages",
    level: "Advanced",
    icon: <SiJavascript className="w-6 h-6 text-amber-300/90" />,
    logoSrc: "/javascript.png",
    deployedIn: "Standard across all web client applications",
    description:
      "Extensive experience with ESNext specifications, browser APIs, asynchronous event loops, and client-side reactive patterns.",
    points: [
      "ES6+ syntax, functional composition, and closures",
      "Asynchronous pipelines (Promises, async/await, Web APIs)",
      "DOM and Web Audio API synthesizer programming",
    ],
  },
  typescript: {
    name: "TypeScript",
    category: "Languages",
    level: "Advanced",
    icon: <SiJavascript className="w-6 h-6 text-blue-400/90" />,
    logoSrc: "/javascript.png",
    deployedIn: "Standardized across all production codebases",
    description:
      "Strict compile-time type safety across frontend and backend layers with zero 'any' tolerance.",
    points: [
      "Discriminated union models for application state",
      "Generic data transformers and strict API response contracts",
      "High refactoring resilience in enterprise web apps",
    ],
  },
  cplusplus: {
    name: "C / C++",
    category: "Systems & Algorithms",
    level: "Proficient",
    icon: <SiCplusplus className="w-6 h-6 text-blue-400/90" />,
    deployedIn: "UPLB Computer Science core curriculum",
    description:
      "Low-level memory management, pointer arithmetic, and foundational data structures developed through academic training at UP Los Baños.",
    points: [
      "Manual memory allocation and pointer manipulation",
      "Implementation of trees, heaps, hash tables, and graphs from scratch",
      "Algorithmic performance and cache efficiency benchmarking",
    ],
  },
  react: {
    name: "React 19",
    category: "Frontend",
    level: "Advanced",
    icon: <SiReact className="w-6 h-6 text-cyan-400/90" />,
    logoSrc: "/react.png",
    deployedIn: "finance.dev-jk.me & tropa.dev-jk.me",
    description:
      "Building modular, high-performance user interfaces using React 19, custom hooks, and concurrent reactive state architectures.",
    points: [
      "Custom hook composition for complex decoupled state",
      "Interactive data visualizations with Recharts",
      "Fluid micro-interactions via Framer Motion",
      "Render cycle profiling and unnecessary re-render elimination",
    ],
  },
  nextjs: {
    name: "Next.js 15",
    category: "Frontend & Full-Stack",
    level: "Advanced",
    icon: <SiNextdotjs className="w-6 h-6 text-white" />,
    logoSrc: "/next.svg",
    invert: true,
    deployedIn: "tropa.dev-jk.me & dev-jk.me",
    description:
      "Production web applications leveraging Next.js 15 App Router, React Server Components (RSC), and Turbopack incremental builds.",
    points: [
      "App Router layouts, templates, and streaming UI boundaries",
      "Server Actions and zero-bundle client component architecture",
      "Turbopack high-speed compilation and deployment pipelines",
    ],
  },
  tailwindcss: {
    name: "Tailwind CSS v4",
    category: "Frontend & UI Systems",
    level: "Advanced",
    icon: <SiTailwindcss className="w-6 h-6 text-cyan-300/90" />,
    logoSrc: "/tailwindcss.png",
    deployedIn: "tropa.dev-jk.me & dev-jk.me",
    description:
      "Engineering modern design systems using Tailwind CSS v4. Implementing responsive layouts, glassmorphic textures, and hardware-accelerated CSS.",
    points: [
      "Design token architecture and custom theme configuration",
      "Fluid responsive layouts and container queries",
      "Accessible contrast standards and hardware-accelerated transforms",
    ],
  },
  nodejs: {
    name: "Node.js & Express",
    category: "Backend Services",
    level: "Proficient",
    icon: <SiNodedotjs className="w-6 h-6 text-emerald-400/90" />,
    logoSrc: "/nodejs.png",
    deployedIn: "Full-stack services & API routing",
    description:
      "Asynchronous backend web services, API gateways, and middleware pipelines for authentication, request handling, and error triage.",
    points: [
      "RESTful API design with clean resource routing",
      "JWT authentication and role-based middleware guards",
      "Non-blocking I/O event loop optimization",
    ],
  },
  mongodb: {
    name: "MongoDB & IndexedDB",
    category: "Data & Persistence",
    level: "Proficient",
    icon: <SiMongodb className="w-6 h-6 text-green-500/90" />,
    logoSrc: "/mongodb.png",
    deployedIn: "finance.dev-jk.me (IndexedDB / Dexie.js)",
    description:
      "Document database modeling and client-side database persistence using IndexedDB (Dexie.js) for resilient offline-first user experiences.",
    points: [
      "Client-side IndexedDB persistence via Dexie.js",
      "Document schema design, indexing, and validation",
      "Optimistic offline mutations & schema migrations",
    ],
  },
  github: {
    name: "Git & Engineering DevOps",
    category: "Developer Tools",
    level: "Advanced",
    icon: <SiGithub className="w-6 h-6 text-zinc-200" />,
    logoSrc: "/github.png",
    deployedIn: "Standard engineering workflow for all projects",
    description:
      "Disciplined version control hygiene, continuous integration pipelines, trunk-based feature development, and thorough peer reviews.",
    points: [
      "Atomic commits and rebase branch workflows",
      "Pull request reviews and code quality gates",
      "Automated Vercel deployment triggers and releases",
    ],
  },
  qa: {
    name: "Quality Assurance & Testing",
    category: "Quality Engineering",
    level: "Advanced",
    icon: <LuShieldCheck className="w-6 h-6 text-emerald-400" />,
    deployedIn: "Vertere Global Solutions Inc. (Current Role)",
    description:
      "Driving software quality through systematic test case authoring, manual and automated regression suites, defect isolation and root-cause analysis.",
    points: [
      "Authoring and executing detailed test plans and regression suites",
      "Defect lifecycle tracking, issue isolation, and triage",
      "Cross-browser quality assurance and release validation",
    ],
  },
  claude: {
    name: "Claude & Claude Code",
    category: "AI-Assisted Engineering",
    level: "Advanced",
    icon: <SiAnthropic className="w-6 h-6 text-orange-300/90" />,
    deployedIn: "This entire portfolio — every game, animation, and terminal command",
    description:
      "Pairing with Claude Code as a daily engineering tool: scoping tasks, reviewing generated diffs, and chasing down UX bugs that only surface in a live browser.",
    points: [
      "Directing multi-step feature builds end-to-end, from spec to shipped code",
      "Reviewing AI-generated code for edge cases, race conditions, and regressions",
      "Using Claude Code's terminal workflow for git, testing, and deployment",
    ],
  },
  "context-engineering": {
    name: "Context Engineering",
    category: "AI-Assisted Engineering",
    level: "Proficient",
    icon: <LuBrainCircuit className="w-6 h-6 text-purple-400/90" />,
    deployedIn: "Structuring prompts and project context for reliable AI output",
    description:
      "Deciding what an AI model actually needs to do a task well — the right file, the right constraint, the right example — instead of dumping everything into the prompt and hoping.",
    points: [
      "Scoping tasks tightly enough that an agent can verify its own work",
      "Writing project instructions that keep AI-generated code from scope-creeping",
      "Judging when a task needs more context versus a smaller, clearer task",
    ],
  },
  "agentic-development": {
    name: "Agentic Development",
    category: "AI-Assisted Engineering",
    level: "Proficient",
    icon: <LuBot className="w-6 h-6 text-emerald-400/90" />,
    deployedIn: "Multi-step feature work delegated to and verified from AI agents",
    description:
      "Working with AI agents that plan, write, and test code across several steps — breaking a feature into agent-sized tasks, then reviewing the result the way any code review would.",
    points: [
      "Breaking multi-step features into tasks an agent can complete and verify",
      "Catching AI-introduced bugs like double-invoked effects and state leaks",
      "Treating agent output as a first draft, not a final answer",
    ],
  },
  aws: {
    name: "AWS",
    category: "Cloud & DevOps",
    level: "Familiar",
    icon: <SiAmazonwebservices className="w-6 h-6 text-amber-400/90" />,
    deployedIn: "Cloud infrastructure & deployment fundamentals",
    description:
      "Working knowledge of core AWS services for hosting, storage, and deploying web applications in a cloud environment.",
    points: [
      "Provisioning and configuring compute and storage resources",
      "Understanding IAM roles, security groups, and access boundaries",
      "Reasoning about cost, scaling, and environment separation in cloud setups",
    ],
  },
  docker: {
    name: "Docker",
    category: "Cloud & DevOps",
    level: "Familiar",
    icon: <SiDocker className="w-6 h-6 text-sky-400/90" />,
    deployedIn: "Containerized local development & deployment",
    description:
      "Packaging applications and their dependencies into containers for consistent behavior across development and production.",
    points: [
      "Writing Dockerfiles and managing multi-container setups",
      "Debugging environment drift between local and containerized runs",
      "Using containers to keep dev environments reproducible across machines",
    ],
  },
  "github-actions": {
    name: "GitHub Actions",
    category: "Cloud & DevOps",
    level: "Proficient",
    icon: <SiGithubactions className="w-6 h-6 text-zinc-200" />,
    deployedIn: "CI/CD pipelines for build, test, and deploy",
    description:
      "Automating build, test, and deployment steps so every push is checked the same way, without relying on someone remembering to run it manually.",
    points: [
      "Writing workflows that run lint, type-check, and test steps on every push",
      "Gating merges behind passing checks instead of manual review alone",
      "Wiring deployment triggers into the same pipeline as CI",
    ],
  },
};

export default function SkillModal({ skill, isOpen, onClose }: SkillModalProps) {
  useEffect(() => {
    if (isOpen) {
      soundFx.playSuccess();
      document.body.style.overflow = "hidden";

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          soundFx.playClick(800);
          onClose();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !skill) return null;

  const key = skill.toLowerCase().trim();
  const details: SkillDetail = SKILL_DETAILS[key] || {
    name: skill,
    category: "Technology",
    level: "Proficient",
    icon: <LuCpu className="w-6 h-6 text-emerald-400" />,
    deployedIn: "Software Engineering & Architecture",
    description: `Applied in engineering modern software applications and computer science projects.`,
    points: [
      "Production project implementation & architecture",
      "Strict type assertions and performance optimization",
    ],
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xl animate-fade-in-fast transition-opacity"
        onClick={() => {
          soundFx.playClick(800);
          onClose();
        }}
      />

      {/* Modal Shell */}
      <div
        className="relative w-full max-w-lg flex flex-col rounded-3xl border border-white/[0.12] bg-[#070709] shadow-2xl shadow-black/90 overflow-hidden animate-modal-enter z-10 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Window Chrome */}
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-950/90 border-b border-white/[0.08] select-none gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div
                onClick={() => {
                  soundFx.playClick(800);
                  onClose();
                }}
                className="w-2.5 h-2.5 rounded-full bg-red-500/80 hover:bg-red-400 cursor-pointer transition-colors"
                title="Close"
              />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            </div>

            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-900 border border-white/[0.06] text-zinc-400">
              Stack Inspector
            </span>
          </div>

          <button
            onClick={() => {
              soundFx.playClick(800);
              onClose();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/[0.08] transition-colors text-xs font-mono cursor-pointer"
            title="Close modal (Esc)"
          >
            <span className="text-[10px] text-zinc-500">ESC</span>
            <LuX className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3.5 pb-3 border-b border-white/[0.06]">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/[0.08] p-2 flex items-center justify-center shrink-0 shadow-md">
              {details.logoSrc ? (
                <Image
                  src={details.logoSrc}
                  alt={details.name}
                  width={32}
                  height={32}
                  className={`object-contain ${
                    details.invert ? "invert opacity-80" : ""
                  }`}
                />
              ) : (
                details.icon
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">
                  {details.category}
                </span>
                <span className="text-zinc-600">&bull;</span>
                <span className="text-[10px] font-mono text-zinc-400">
                  {details.level}
                </span>
              </div>
              <h3 className="font-rubik font-bold text-lg text-white truncate">
                {details.name}
              </h3>
            </div>
          </div>

          {/* Deployed In Capsule */}
          <div className="px-3 py-2 rounded-xl bg-zinc-900/80 border border-white/[0.06] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-xs font-mono text-zinc-300 truncate">
              {details.deployedIn}
            </span>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-zinc-300 font-rubik leading-relaxed">
            {details.description}
          </p>

          {/* Demonstrated Capabilities Checklist */}
          <div className="pt-2 border-t border-white/[0.04] space-y-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
              Demonstrated Engineering Capabilities:
            </span>

            <div className="space-y-1.5">
              {details.points.map((pt, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-xs font-rubik text-zinc-300 bg-zinc-950 p-2.5 rounded-xl border border-white/[0.04]"
                >
                  <LuCheck className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-zinc-950 border-t border-white/[0.06] flex items-center justify-between">
          <span className="text-[11px] font-mono text-zinc-500">
            Engineered with Precision
          </span>

          <button
            onClick={() => {
              soundFx.playClick(800);
              onClose();
            }}
            className="px-4 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-rubik text-xs border border-white/[0.08] transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
