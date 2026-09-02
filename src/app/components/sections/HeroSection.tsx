"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import LandingName from "../ui/LandingName";
import { soundFx } from "@/util/sound";
import {
  LuArrowDown,
  LuTerminal,
  LuCopy,
  LuCheck,
  LuMapPin,
  LuClock,
  LuShieldCheck,
  LuGraduationCap,
  LuBrainCircuit,
  LuBot,
} from "react-icons/lu";
import {
  SiGithub,
  SiLinkedin,
  SiAnthropic,
  SiAmazonwebservices,
  SiDocker,
  SiGithubactions,
} from "react-icons/si";

interface HeroSectionProps {
  onOpenTerminal?: () => void;
  onCopyEmail?: () => void;
  onSkillClick?: (skill: string) => void;
}

interface TechLogo {
  id: string;
  name: string;
  src?: string;
  invert?: boolean;
  icon?: React.ReactNode;
}

const TECH_LOGOS: TechLogo[] = [
  { id: "react", name: "React", src: "/react.png" },
  { id: "nextjs", name: "Next.js", src: "/next.svg", invert: true },
  { id: "javascript", name: "JavaScript", src: "/javascript.png" },
  { id: "python", name: "Python", src: "/python.png" },
  { id: "nodejs", name: "Node.js", src: "/nodejs.png" },
  { id: "tailwindcss", name: "Tailwind CSS", src: "/tailwindcss.png" },
  { id: "mongodb", name: "MongoDB", src: "/mongodb.png" },
  { id: "github", name: "GitHub", src: "/github.png" },
  {
    id: "claude",
    name: "Claude",
    icon: <SiAnthropic className="w-full h-full text-orange-300/90" />,
  },
  {
    id: "context-engineering",
    name: "Context Engineering",
    icon: <LuBrainCircuit className="w-full h-full text-purple-400/90" />,
  },
  {
    id: "agentic-development",
    name: "Agentic Development",
    icon: <LuBot className="w-full h-full text-emerald-400/90" />,
  },
  {
    id: "aws",
    name: "AWS",
    icon: <SiAmazonwebservices className="w-full h-full text-amber-400/90" />,
  },
  {
    id: "docker",
    name: "Docker",
    icon: <SiDocker className="w-full h-full text-sky-400/90" />,
  },
  {
    id: "github-actions",
    name: "GitHub Actions",
    icon: <SiGithubactions className="w-full h-full text-zinc-200" />,
  },
];

export default function HeroSection({
  onOpenTerminal,
  onCopyEmail,
  onSkillClick,
}: HeroSectionProps) {
  const [localTime, setLocalTime] = useState<string>("");
  const [copiedToast, setCopiedToast] = useState(false);
  const [currentStatusIdx, setCurrentStatusIdx] = useState(0);

  // Embedded Mini Console State
  const [consoleInput, setConsoleInput] = useState("");
  const [consoleLog, setConsoleLog] = useState<{ command: string; response: string }[]>([
    {
      command: "overview",
      response: "Jake Neverida &bull; QA Analyst @ Vertere Global Solutions &bull; BS CS UP Los Baños",
    },
  ]);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  const statuses = [
    { label: "QA Analyst @ Vertere Global Solutions Inc.", dot: "bg-emerald-400" },
    { label: "Software Engineer & Web Developer", dot: "bg-cyan-400" },
    { label: "BS Computer Science (UP Los Baños '26)", dot: "bg-amber-400" },
  ];

  useEffect(() => {
    const updateTime = () => {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Manila",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      };
      setLocalTime(new Intl.DateTimeFormat("en-US", options).format(new Date()));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = useCallback(() => {
    soundFx.playSuccess();
    navigator.clipboard.writeText("jlrneverida@gmail.com");
    setCopiedToast(true);
    if (onCopyEmail) onCopyEmail();
    setTimeout(() => setCopiedToast(false), 2200);
  }, [onCopyEmail]);

  const runMiniCommand = (cmd: string) => {
    soundFx.playKey();
    const cleanCmd = cmd.trim().toLowerCase();
    let response = "";

    if (cleanCmd === "role") {
      response = "Quality Assurance Analyst @ Vertere Global Solutions Inc. (June 2026 - Present)";
    } else if (cleanCmd === "whoami") {
      response = "Jake Neverida &bull; QA Analyst & Software Engineer. BS CS Graduate from UP Los Baños (GWA 1.95).";
    } else if (cleanCmd === "education") {
      response = "BS Computer Science, University of the Philippines Los Baños (2022 - 2026, GWA 1.95).";
    } else if (cleanCmd === "skills") {
      response = "QA Testing, Test Automation, React 19, Next.js 15, TypeScript, Python, Node.js, Tailwind, Claude &amp; agentic development, AWS, Docker.";
    } else if (cleanCmd === "hire") {
      soundFx.playSuccess();
      response = "Let's connect! Email: jlrneverida@gmail.com";
      const el = document.getElementById("contact");
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 300);
    } else if (cleanCmd === "clear") {
      setConsoleLog([]);
      setConsoleInput("");
      return;
    } else {
      response = `Command "${cmd}" executed. Try: role, whoami, education, skills, hire, clear.`;
    }

    setConsoleLog((prev) => [...prev, { command: cmd, response }]);
    setConsoleInput("");
    setTimeout(() => consoleEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  return (
    <section id="hero" className="reveal-item relative px-4 sm:px-6 max-w-5xl mx-auto pt-4 pb-2">
      {/* Toast Alert */}
      {copiedToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[160] px-3.5 py-1.5 bg-zinc-900 text-zinc-100 text-xs font-mono rounded-full shadow-2xl backdrop-blur-md animate-modal-enter flex items-center gap-2 border border-white/10">
          <LuCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Copied jlrneverida@gmail.com</span>
        </div>
      )}

      {/* Asymmetric Dual Element Container: Personal Anchor (Left) vs Interactive Console (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Element: Personal Identity & Balanced Focus (7 cols) */}
        <div className="lg:col-span-7 glass-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden border border-white/[0.08]">
          <div className="space-y-4">
            {/* Live Status & Manila Clock */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  soundFx.playKey();
                  setCurrentStatusIdx((prev) => (prev + 1) % statuses.length);
                }}
                title="Click to cycle status"
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 hover:bg-zinc-850 border border-white/[0.08] text-zinc-300 text-xs font-mono transition-all active:scale-95 cursor-pointer"
              >
                <span className={`w-2 h-2 rounded-full ${statuses[currentStatusIdx].dot} animate-pulse`} />
                <span>{statuses[currentStatusIdx].label}</span>
                <span className="text-[10px] text-zinc-500 ml-0.5">↻</span>
              </button>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/60 border border-white/[0.06] text-zinc-400 text-xs font-mono">
                <LuMapPin className="w-3 h-3 text-zinc-500" />
                <span>Laguna, PH</span>
                <span className="text-zinc-600">&bull;</span>
                <LuClock className="w-3 h-3 text-zinc-500" />
                <span>{localTime || "GMT+8"}</span>
              </div>
            </div>

            {/* Profile Avatar & Name Header */}
            <div className="flex items-center gap-4 pt-1">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-white/[0.12] shadow-xl bg-zinc-900 relative shrink-0">
                <Image
                  src="/jake.jpg"
                  alt="Jake Neverida"
                  fill
                  priority
                  className="object-cover"
                />
              </div>

              <div>
                <h1 className="text-2xl sm:text-4xl font-bold tracking-tight font-rubik text-white leading-tight">
                  Jake Neverida
                </h1>
                <div className="min-h-[24px] mt-0.5 flex items-center">
                  <LandingName
                    phrases={[
                      "Quality Assurance Analyst",
                      "Software Engineer",
                      "BS Computer Science • UP Los Baños",
                    ]}
                    className="text-xs sm:text-sm text-zinc-400 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Balanced Experience & Education Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-900/80 border border-emerald-500/25 text-xs font-mono text-zinc-300">
                <LuShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>QA Analyst @ Vertere Global Solutions</span>
                <span className="text-emerald-400/80 font-medium">Current</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-900/80 border border-white/[0.08] text-xs font-mono text-zinc-400">
                <LuGraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                <span>BS Computer Science, UPLB &apos;26</span>
              </div>
            </div>

            {/* Balanced Professional Bio */}
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-rubik">
              Quality Assurance Analyst at Vertere Global Solutions Inc. and Software Engineer with a BS in Computer Science from UP Los Baños (1.95 GWA).
              Focused on software test validation, automated regression suites, and high-performance web systems using Next.js, React, and TypeScript.
            </p>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-2.5 pt-4 border-t border-white/[0.04] mt-4">
            <a
              href="#projects"
              onClick={() => soundFx.playClick(950)}
              className="px-4 py-2 rounded-full bg-white text-zinc-950 font-rubik font-medium text-xs sm:text-sm hover:bg-zinc-200 transition-all flex items-center gap-1.5 active:scale-95 shadow-md"
            >
              <span>Featured Work</span>
              <LuArrowDown className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-rubik text-xs sm:text-sm transition-all border border-white/[0.08] active:scale-95 flex items-center gap-1.5"
            >
              <LuCopy className="w-3.5 h-3.5 text-zinc-400" />
              <span>Copy Email</span>
            </button>

            <div className="flex items-center gap-1.5 ml-auto">
              <a
                href="https://github.com/neverida-jk"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => soundFx.playClick(900)}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/[0.06] transition-colors"
                title="GitHub"
              >
                <SiGithub className="w-3.5 h-3.5" />
              </a>

              <a
                href="https://linkedin.com/in/your-profile"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => soundFx.playClick(900)}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/[0.06] transition-colors"
                title="LinkedIn"
              >
                <SiLinkedin className="w-3.5 h-3.5 text-blue-400" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Element: Live Interactive Mini Console Widget (5 cols) */}
        <div className="lg:col-span-5 glass-card rounded-3xl p-5 flex flex-col justify-between border border-white/[0.08] font-mono text-xs bg-[#08080a]/90 relative overflow-hidden">
          {/* Console Header */}
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <span className="ml-2 text-[11px] text-zinc-400">interactive shell</span>
              </div>

              <button
                onClick={() => {
                  soundFx.playClick(850);
                  if (onOpenTerminal) onOpenTerminal();
                }}
                className="text-[10px] text-zinc-500 hover:text-zinc-300 font-mono transition-colors"
                title="Open full terminal window"
              >
                expand &gt;_
              </button>
            </div>

            {/* Quick Interactive Command Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide mb-3 pb-1">
              {["role", "whoami", "education", "skills", "hire"].map((cmd) => (
                <button
                  key={cmd}
                  onClick={() => runMiniCommand(cmd)}
                  className="px-2 py-0.5 rounded-md bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-white/[0.06] text-[10px] font-mono transition-all shrink-0 cursor-pointer"
                >
                  {cmd}
                </button>
              ))}
            </div>

            {/* Live Console Output Stream */}
            <div className="space-y-2 max-h-[160px] overflow-y-auto scrollbar-hide text-[11px]">
              {consoleLog.map((log, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="text-zinc-500">
                    <span className="text-emerald-400">&gt;</span> {log.command}
                  </div>
                  <div
                    className="text-zinc-300 pl-3 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: log.response }}
                  />
                </div>
              ))}
              <div ref={consoleEndRef} />
            </div>
          </div>

          {/* Live Prompt Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (consoleInput.trim()) runMiniCommand(consoleInput);
            }}
            className="pt-3 mt-3 border-t border-white/[0.06] flex items-center gap-2"
          >
            <span className="text-emerald-400 font-bold text-xs">&gt;</span>
            <input
              type="text"
              value={consoleInput}
              onChange={(e) => setConsoleInput(e.target.value)}
              placeholder="try 'role' or 'education'..."
              className="w-full bg-transparent text-white text-xs outline-none font-mono caret-white placeholder-zinc-600"
            />
          </form>
        </div>
      </div>

      {/* Playful Interactive Tech Logo Ribbon */}
      <div className="mt-4 glass-card rounded-2xl px-4 py-3 border border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 shrink-0">
          Core Technologies:
        </span>

        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-0.5 px-1">
          {TECH_LOGOS.map((tech) => (
            <button
              key={tech.id}
              onClick={() => {
                soundFx.playClick(900);
                onSkillClick?.(tech.id);
              }}
              className="relative w-8 h-8 rounded-lg bg-zinc-900/90 border border-white/[0.06] hover:border-white/[0.25] p-1.5 flex items-center justify-center transition-all duration-200 hover:scale-125 hover:-translate-y-0.5 shrink-0 group cursor-pointer shadow-sm"
              title={`View ${tech.name} details`}
            >
              {tech.icon ? (
                tech.icon
              ) : (
                <Image
                  src={tech.src!}
                  alt={tech.name}
                  width={20}
                  height={20}
                  className={`object-contain transition-all ${
                    tech.invert ? "invert opacity-80 group-hover:opacity-100" : ""
                  }`}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
