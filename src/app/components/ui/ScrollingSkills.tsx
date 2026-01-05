"use client";
import React, { useRef } from 'react';
import SkillCard from './SkillCard';

interface SkillConfig {
  name: string;
  width?: number;
  height?: number;
}

interface ScrollingSkillsProps {
  skills: string[] | SkillConfig[];
  className?: string;
  onSkillClick?: (skill: string) => void;
}

const ScrollingSkills: React.FC<ScrollingSkillsProps> = ({
  skills = [],
  className = "",
  onSkillClick
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // Normalize skills to SkillConfig format
  const normalizedSkills: SkillConfig[] = skills.map(skill =>
    typeof skill === 'string' ? { name: skill } : skill
  );

  // Create multiple duplicates for seamless infinite scroll
  const duplicatedSkills = [...normalizedSkills, ...normalizedSkills, ...normalizedSkills, ...normalizedSkills];

  return (
    <div
      className={`overflow-hidden w-full ${className}`}
    >
      <div
        ref={contentRef}
        className="grid grid-flow-col grid-rows-2 gap-0 sm:gap-1 md:gap-4 lg:gap-6 animate-scroll will-change-transform -my-10 sm:-my-6 md:-my-2 lg:my-0"
        style={{
          width: 'max-content',
          gridTemplateRows: 'repeat(2, 1fr)'
        }}
      >
        {duplicatedSkills.map((skillConfig, index) => {
          // With grid-flow-col, even indices (0,2,4...) go to top row, odd (1,3,5...) to bottom row
          const isTopRow = index % 2 === 0;

          return (
            <SkillCard
              key={`${skillConfig.name}-${index}`}
              skill={skillConfig.name}
              index={index}
              isTopRow={isTopRow}
              customWidth={skillConfig.width}
              customHeight={skillConfig.height}
              onClick={() => {
                onSkillClick?.(skillConfig.name);
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ScrollingSkills;

