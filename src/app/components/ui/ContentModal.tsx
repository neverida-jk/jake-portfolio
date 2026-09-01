"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { soundFx } from "@/util/sound";
import {
  LuX,
  LuExternalLink,
  LuCopy,
  LuCheck,
  LuGlobe,
  LuShieldCheck,
  LuGraduationCap,
  LuBriefcase,
  LuLayers,
} from "react-icons/lu";

interface MediaItem {
  src: string;
  type: "image" | "video";
  alt?: string;
}

interface ContentModalProps {
  title: string;
  description?: string;
  date?: string;
  media?: MediaItem[];
  imageSrc?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ContentModal({
  title,
  description,
  date,
  media,
  imageSrc,
  isOpen,
  onClose,
}: ContentModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "specs">("overview");
  const [copied, setCopied] = useState(false);

  const mediaItems: MediaItem[] =
    media || (imageSrc ? [{ src: imageSrc, type: "image" as const, alt: title }] : []);

  // Determine item category based on date / title
  const isLiveProject =
    Boolean(date && (date.includes(".dev-jk.me") || date.includes("dev-jk.me") || date.includes("github.io")));
  const isCurrentRole = Boolean(date && (date.includes("Present") || title.includes("Vertere")));
  const isEducation = Boolean(date && (date.includes("2022") || title.includes("Computer Science")));
  const isInternship = Boolean(date && (date.includes("2025") || title.includes("Limitless")));

  // Live URL resolution for projects
  const liveUrl = isLiveProject
    ? date?.startsWith("http")
      ? date
      : `https://${date}`
    : null;

  // Sound and keyboard shortcuts
  useEffect(() => {
    if (isOpen) {
      soundFx.playSuccess();
      document.body.style.overflow = "hidden";
      setActiveTab("overview");
      setCopied(false);

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

  const handleCopyLink = useCallback(() => {
    soundFx.playSuccess();
    const textToCopy = liveUrl || `${title} - Jake Neverida Portfolio`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [liveUrl, title]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      {/* High-Gloss Ambient Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xl animate-fade-in transition-opacity"
        onClick={() => {
          soundFx.playClick(800);
          onClose();
        }}
      />

      {/* Innovative Modal Container */}
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-white/[0.12] bg-[#070709] shadow-2xl shadow-black/90 overflow-hidden animate-modal-enter z-10 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Window Chrome Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-950/90 border-b border-white/[0.08] select-none gap-2">
          {/* Traffic Lights + Context Badge */}
          <div className="flex items-center gap-2.5 shrink-0">
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

            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-900 border border-white/[0.06] text-zinc-400 hidden sm:inline-block">
              {isLiveProject
                ? "Live Application Inspector"
                : isCurrentRole
                ? "Active Experience Dossier"
                : isEducation
                ? "Academic Credential"
                : "Record Inspector"}
            </span>
          </div>

          {/* Quick Breadcrumb / Domain */}
          <div className="text-center truncate px-2 min-w-0">
            <span className="text-xs font-mono text-zinc-300 font-medium truncate block">
              {date || title}
            </span>
          </div>

          {/* Actions & Close Button with Keyboard Hint */}
          <div className="flex items-center gap-2 shrink-0">
            {liveUrl && (
              <button
                onClick={handleCopyLink}
                title="Copy live URL"
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/[0.06] transition-colors cursor-pointer"
              >
                {copied ? (
                  <LuCheck className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <LuCopy className="w-3.5 h-3.5" />
                )}
              </button>
            )}

            <button
              onClick={() => {
                soundFx.playClick(800);
                onClose();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/[0.08] transition-colors text-xs font-mono cursor-pointer"
              title="Close modal (Esc)"
            >
              <span className="text-[10px] text-zinc-500 hidden sm:inline">ESC</span>
              <LuX className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-5 scrollbar-hide">
          {/* Header Banner */}
          <div className="flex items-start gap-4 pb-4 border-b border-white/[0.06]">
            {/* Contextual Icon / Emblem */}
            <div className="w-14 h-14 rounded-2xl bg-zinc-900/90 border border-white/[0.08] p-2 flex items-center justify-center shrink-0 shadow-lg relative overflow-hidden">
              {mediaItems.length > 0 && mediaItems[0].src ? (
                <Image
                  src={mediaItems[0].src}
                  alt={title}
                  width={40}
                  height={40}
                  className={`object-contain ${
                    mediaItems[0].src.includes("next.svg") ? "invert opacity-80" : ""
                  }`}
                />
              ) : isCurrentRole ? (
                <LuShieldCheck className="w-7 h-7 text-emerald-400" />
              ) : isEducation ? (
                <LuGraduationCap className="w-7 h-7 text-emerald-400" />
              ) : (
                <LuBriefcase className="w-7 h-7 text-cyan-400" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                {isLiveProject && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live Production App
                  </span>
                )}
                {isCurrentRole && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Current Position
                  </span>
                )}
                {isEducation && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-900 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
                    1.95 GWA &bull; Iskolar ng Bayan
                  </span>
                )}
                {isInternship && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-300 border border-white/[0.08] text-[10px] font-mono">
                    Engineering Internship
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-bold font-rubik text-white tracking-tight leading-snug">
                {title}
              </h2>

              {date && (
                <div className="text-xs font-mono text-zinc-400 mt-1 flex items-center gap-2">
                  {isLiveProject ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <LuGlobe className="w-3 h-3" />
                      {date}
                    </span>
                  ) : (
                    <span>{date}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Interactive Navigation Pills */}
          <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2">
            <button
              onClick={() => {
                soundFx.playClick(900);
                setActiveTab("overview");
              }}
              className={`px-3 py-1 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "bg-zinc-800 text-white border border-white/[0.16] shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
              }`}
            >
              Overview & Context
            </button>
            <button
              onClick={() => {
                soundFx.playClick(900);
                setActiveTab("specs");
              }}
              className={`px-3 py-1 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                activeTab === "specs"
                  ? "bg-zinc-800 text-white border border-white/[0.16] shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
              }`}
            >
              Architecture & Details
            </button>
          </div>

          {/* Tab 1: Overview & Media Stage */}
          {activeTab === "overview" && (
            <div className="space-y-4 animate-fade-in">
              {description && (
                <div className="bg-zinc-900/40 p-4 rounded-2xl border border-white/[0.04] text-xs sm:text-sm text-zinc-200 font-rubik leading-relaxed">
                  <p>{description}</p>
                </div>
              )}

              {/* Contextual Metric Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-2xl bg-zinc-950 border border-white/[0.06]">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-0.5">
                    Category
                  </span>
                  <span className="text-xs font-mono font-medium text-zinc-200">
                    {isLiveProject
                      ? "Web Application"
                      : isCurrentRole
                      ? "Quality Assurance"
                      : isEducation
                      ? "Computer Science"
                      : "Engineering"}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-950 border border-white/[0.06]">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-0.5">
                    Status
                  </span>
                  <span className="text-xs font-mono font-medium text-emerald-400">
                    {isLiveProject
                      ? "Production Deployed"
                      : isCurrentRole
                      ? "Active Role"
                      : isEducation
                      ? "Graduated '26"
                      : "Completed"}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-950 border border-white/[0.06] col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-0.5">
                    Integrity
                  </span>
                  <span className="text-xs font-mono font-medium text-zinc-300">
                    100% Verified
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Architecture & Details */}
          {activeTab === "specs" && (
            <div className="space-y-3 animate-fade-in">
              <div className="p-4 rounded-2xl bg-zinc-950 border border-white/[0.06] space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-zinc-500">Subject:</span>
                  <span className="text-zinc-200 font-medium">{title}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-zinc-500">Timeline / Domain:</span>
                  <span className="text-zinc-200">{date || "Active"}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-zinc-500">Engineering Rigor:</span>
                  <span className="text-emerald-400">Strict Quality Standards</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-zinc-500">Source Access:</span>
                  <span className="text-zinc-400">Private Proprietary Repository</span>
                </div>
              </div>

              <p className="text-xs text-zinc-400 font-rubik leading-relaxed px-1">
                For detailed technical architecture, system design documentation, or test strategy walkthroughs, feel free to reach out directly via email or terminal CLI.
              </p>
            </div>
          )}
        </div>

        {/* Modal Action Dock (Footer) */}
        <div className="p-4 bg-zinc-950 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {liveUrl ? (
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => soundFx.playClick(900)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-zinc-950 font-rubik font-semibold text-xs hover:bg-zinc-200 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <span>Launch Live System</span>
                <LuExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <a
                href="#contact"
                onClick={() => {
                  soundFx.playClick(900);
                  onClose();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-zinc-950 font-rubik font-semibold text-xs hover:bg-zinc-200 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <span>Inquire on this Role</span>
                <LuBriefcase className="w-3.5 h-3.5" />
              </a>
            )}

            {liveUrl && (
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-rubik text-xs border border-white/[0.08] transition-colors active:scale-95 cursor-pointer"
              >
                <LuCopy className="w-3.5 h-3.5" />
                <span>{copied ? "Copied URL!" : "Copy URL"}</span>
              </button>
            )}
          </div>

          <button
            onClick={() => {
              soundFx.playClick(800);
              onClose();
            }}
            className="px-4 py-2 rounded-full bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white font-rubik text-xs border border-white/[0.06] transition-colors active:scale-95 cursor-pointer ml-auto"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
