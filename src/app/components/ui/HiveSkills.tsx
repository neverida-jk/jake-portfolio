"use client";
import React from 'react';
import Image from 'next/image';

interface SkillGroup {
  title: string;
  skills: string[]; // up to 4 per group: [top, right, bottom, left]
}

interface HiveSkillsProps {
  groups: SkillGroup[];
  className?: string;
  onSkillClick?: (skill: string) => void;
}

const HiveSkills: React.FC<HiveSkillsProps> = ({
  groups = [],
  className = "",
  onSkillClick
}) => {
  // Diamond clip-path (rotated square)
  const diamondClipPath = "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)";

  // Positions (absolute) to form one big diamond:
  // order: [top, right, bottom, left]
  const positionClasses = [
    // small inset from edges so there's a tiny gap between outer edges
    "top-[3px] sm:top-[4px] md:top-[5px] lg:top-[6px] xl:top-[8px] left-1/2 -translate-x-1/2", // top
    "top-1/2 -translate-y-1/2 right-[3px] sm:right-[4px] md:right-[5px] lg:right-[6px] xl:right-[8px]", // right
    "bottom-[3px] sm:bottom-[4px] md:bottom-[5px] lg:bottom-[6px] xl:bottom-[8px] left-1/2 -translate-x-1/2", // bottom
    "top-1/2 -translate-y-1/2 left-[3px] sm:left-[4px] md:left-[5px] lg:left-[6px] xl:left-[8px]", // left
  ];

  return (
    <div className={`flex flex-row flex-wrap justify-center items-start gap-4 sm:gap-6 md:gap-8 lg:gap-10 ${className}`}>
      {groups.map((group) => (
        <div
          key={group.title}
          className="flex flex-col items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6"
        >
          <h3 className="font-rubik font-semibold text-[14px] sm:text-[16px] md:text-[18px] lg:text-[20px] text-zinc-200 text-center">
            {group.title}
          </h3>
          {/* Change height and width here of the whole diamond to adjust the gap */}
          <div
            className="relative
                       w-[140px] h-[140px]
                       sm:w-[160px] sm:h-[160px]
                       md:w-[200px] md:h-[200px]
                       lg:w-[240px] lg:h-[240px]
                       xl:w-[330px] xl:h-[330px]"
          >
            {group.skills.slice(0, 4).map((skill, index) => (
              <div
                key={`${group.title}-${skill}-${index}`}
                className={`${positionClasses[index]} absolute flex justify-center items-center`}
              >
                <div
                  className="relative cursor-pointer transition-all duration-300
                            hover:scale-110 hover:z-10 active:scale-95 group
                            w-[55px] h-[55px]
                            sm:w-[65px] sm:h-[65px]
                            md:w-[80px] md:h-[80px]
                            lg:w-[100px] lg:h-[100px]
                            xl:w-[150px] xl:h-[150px]"
                  onClick={() => onSkillClick?.(skill)}
                >
                  {/* Diamond shape with border effect */}
                  <div
                    className="absolute inset-0 bg-gradient-to-b from-zinc-500 to-zinc-700
                               group-hover:from-zinc-400 group-hover:to-zinc-500
                               transition-all duration-300"
                    style={{ clipPath: diamondClipPath }}
                  />

                  {/* Inner diamond */}
                  <div
                    className="absolute inset-[1.5px] sm:inset-[2px] md:inset-[2.5px] lg:inset-[3px] bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900
                               group-hover:from-zinc-800 group-hover:via-zinc-700 group-hover:to-zinc-800
                               transition-all duration-300"
                    style={{ clipPath: diamondClipPath }}
                  />

                  {/* Subtle inner glow */}
                  <div
                    className="absolute inset-[3px] sm:inset-[4px] md:inset-[5px] lg:inset-[6px] opacity-30
                               bg-gradient-to-r from-transparent via-zinc-600 to-transparent"
                    style={{ clipPath: diamondClipPath }}
                  />

                  {/* Skill icon */}
                  <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-3 md:p-4 lg:p-5 xl:p-7">
                    <div className="relative w-full h-full grayscale group-hover:grayscale-0 transition-all duration-300">
                      <Image
                        src={`/${skill.toLowerCase().replace(/\s+/g, '-')}.png`}
                        alt={skill}
                        fill
                        className="object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]
                                  group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HiveSkills;
