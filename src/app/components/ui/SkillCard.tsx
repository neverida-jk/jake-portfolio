"use client";
import React, { useState } from 'react';
import Image from 'next/image';

interface SkillCardProps {
  skill: string;
  index: number;
  isTopRow: boolean;
  customWidth?: number;
  customHeight?: number;
  className?: string;
  onClick?: () => void;
}

const SkillCard: React.FC<SkillCardProps> = ({
  skill,
  index,
  isTopRow,
  customWidth,
  customHeight,
  className = "",
  onClick
}) => {
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    setImageDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight
    });
  };

  // Use custom dimensions if provided, otherwise use image dimensions, or fallback to defaults
  const width = customWidth || imageDimensions?.width || 280;
  const height = customHeight || imageDimensions?.height || 160;

  // Calculate aspect ratio to maintain proportions
  const aspectRatio = imageDimensions ? imageDimensions.width / imageDimensions.height : 16 / 9;
  const calculatedHeight = customHeight || (customWidth ? customWidth / aspectRatio : undefined) || 160;
  const calculatedWidth = customWidth || (customHeight ? customHeight * aspectRatio : undefined) || 280;

  return (
    <div
      className={`flex-shrink-0 rounded-lg overflow-hidden hover:opacity-80 transition-opacity duration-300 grayscale hover:grayscale-0 cursor-pointer active:scale-95 transition-transform
        scale-[0.5] sm:scale-[0.7] md:scale-[0.85] lg:scale-100 origin-center ${
        isTopRow ? 'translate-x-2 sm:translate-x-6 md:translate-x-10 lg:translate-x-16' : ''
      } ${className}`}
      style={{
        width: `${calculatedWidth}px`,
        height: `${calculatedHeight}px`,
        minWidth: `${calculatedWidth}px`,
        minHeight: `${calculatedHeight}px`
      }}
      onClick={onClick}
    >
      <Image
        src={`/${skill.toLowerCase().replace(/\s+/g, '-')}.png`}
        alt={skill}
        width={calculatedWidth}
        height={calculatedHeight}
        className="w-full h-full object-contain"
        onLoad={handleImageLoad}
      />
    </div>
  );
};

export default SkillCard;

