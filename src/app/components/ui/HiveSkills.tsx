"use client";

import React from "react";
import Image from "next/image";
import { soundFx } from "@/util/sound";

interface SkillGroup {
  title: string;
  skills: string[]; // up to 4 per group: [top, right, bottom, left]
}

interface HiveSkillsProps {
  groups: SkillGroup[];
  className?: string;
  onSkillClick?: (skill: string) => void;
}

export default function HiveSkills({
  groups = [],
  className = "",
  onSkillClick,
}: HiveSkillsProps) {
  // Diamond clip-path (rotated square)
  const diamondClipPath = "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)";

  // Positions (absolute) to form one big diamond:
  // order: [top, right, bottom, left]
  const positionClasses = [
    "top-[3px] sm:top-[4px] md:top-[5px] lg:top-[6px] xl:top-[8px] left-1/2 -translate-x-1/2", // top
    "top-1/2 -translate-y-1/2 right-[3px] sm:right-[4px] md:right-[5px] lg:right-[6px] xl:right-[8px]", // right
    "bottom-[3px] sm:bottom-[4px] md:bottom-[5px] lg:bottom-[6px] xl:bottom-[8px] left-1/2 -translate-x-1/2", // bottom
    "top-1/2 -translate-y-1/2 left-[3px] sm:left-[4px] md:left-[5px] lg:left-[6px] xl:left-[8px]", // left
  ];

  return (
    <div className={`flex flex-row flex-wrap justify-center items-start gap-6 sm:gap-8 md:gap-10 lg:gap-12 ${className}`}>
      {groups.map((group) => (
        <div
          key={group.title}
          className="flex flex-col items-center gap-3 sm:gap-4"
        >
          <div className="px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs sm:text-sm font-rubik font-medium text-zinc-300 text-center">
            {group.title}
          </div>

          <div
            className="relative
                       w-[150px] h-[150px]
                       sm:w-[170px] sm:h-[170px]
                       md:w-[210px] md:h-[210px]
                       lg:w-[250px] lg:h-[250px]"
          >
            {group.skills.slice(0, 4).map((skill, index) => {
              const hasSkill = Boolean(skill && skill.trim().length > 0);

              return (
                <div
                  key={`${group.title}-${skill || "empty"}-${index}`}
                  className={`${positionClasses[index]} absolute flex justify-center items-center`}
                >
                  <div
                    className={`relative transition-all duration-300
                              w-[55px] h-[55px]
                              sm:w-[65px] sm:h-[65px]
                              md:w-[80px] md:h-[80px]
                              lg:w-[95px] lg:h-[95px]
                              ${
                                hasSkill
                                  ? "cursor-pointer hover:scale-110 hover:z-10 active:scale-95 group"
                                  : "opacity-30 cursor-default"
                              }`}
                    onClick={() => {
                      if (hasSkill) {
                        soundFx.playClick(900);
                        onSkillClick?.(skill);
                      }
                    }}
                    title={hasSkill ? `Click to view details for ${skill}` : undefined}
                  >
                    {/* Diamond shape with border effect */}
                    <div
                      className="absolute inset-0 bg-gradient-to-b from-zinc-500 to-zinc-700
                                 group-hover:from-zinc-300 group-hover:to-zinc-500
                                 transition-all duration-300 shadow-md"
                      style={{ clipPath: diamondClipPath }}
                    />

                    {/* Inner diamond */}
                    <div
                      className="absolute inset-[1.5px] sm:inset-[2px] md:inset-[2.5px] lg:inset-[3px] bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950
                                 group-hover:from-zinc-800 group-hover:via-zinc-700 group-hover:to-zinc-800
                                 transition-all duration-300"
                      style={{ clipPath: diamondClipPath }}
                    />

                    {/* Subtle inner glow */}
                    <div
                      className="absolute inset-[3px] sm:inset-[4px] md:inset-[5px] lg:inset-[6px] opacity-30
                                 bg-gradient-to-r from-transparent via-zinc-500 to-transparent"
                      style={{ clipPath: diamondClipPath }}
                    />

                    {/* Skill icon or core node */}
                    <div className="absolute inset-0 flex items-center justify-center p-2.5 sm:p-3 md:p-4 lg:p-5">
                      {hasSkill ? (
                        <div className="relative w-full h-full grayscale group-hover:grayscale-0 transition-all duration-300">
                          <Image
                            src={`/${skill.toLowerCase().replace(/\s+/g, "-")}.png`}
                            alt={skill}
                            fill
                            className="object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]
                                      group-hover:drop-shadow-[0_0_14px_rgba(255,255,255,0.4)]"
                          />
                        </div>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-zinc-700/60" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
