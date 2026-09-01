"use client";

import React from "react";
import Image from "next/image";
import { motion, useMotionTemplate, useSpring } from "framer-motion";

interface CardProps {
  title: string;
  date?: string;
  description?: string;
  className?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  imageSrc?: string;
  imageSize?: number;
}

export default function Card({
  title,
  date,
  description,
  className = "",
  onClick,
  icon,
  imageSrc,
  imageSize,
}: CardProps) {
  const mouseX = useSpring(0, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(0, { stiffness: 500, damping: 100 });

  function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const maskImage = useMotionTemplate`radial-gradient(200px at ${mouseX}px ${mouseY}px, white, transparent)`;
  const style = { maskImage, WebkitMaskImage: maskImage };

  return (
    <div
      onClick={onClick}
      onMouseMove={onMouseMove}
      className={`glass-card overflow-hidden w-full relative rounded-2xl
                  p-5 sm:p-6 transition-all duration-300
                  ${
                    onClick
                      ? "cursor-pointer hover:border-white/[0.16] active:scale-[0.99]"
                      : "border-white/[0.06]"
                  } ${className}`}
    >
      {/* Interactive Spotlight Mask */}
      <div className="pointer-events-none">
        <div className="absolute inset-0 z-0 transition duration-1000 [mask-image:linear-gradient(black,transparent)]" />
        <motion.div
          className="absolute inset-0 z-10 bg-gradient-to-br opacity-80 via-zinc-100/5 transition duration-1000 group-hover:opacity-40"
          style={style}
        />
        <motion.div
          className="absolute inset-0 z-10 opacity-0 mix-blend-overlay transition duration-1000 group-hover:opacity-100"
          style={style}
        />
      </div>

      {imageSrc && (
        <div className="relative z-1 mb-3.5 w-full flex justify-center items-center">
          <div
            className="relative rounded-xl overflow-hidden w-full max-w-[90px] sm:max-w-[110px] aspect-square bg-zinc-900/60 p-2 flex items-center justify-center border border-white/[0.06]"
            style={
              imageSize
                ? {
                    maxWidth: `min(${imageSize}px, 80%)`,
                  }
                : undefined
            }
          >
            <Image src={imageSrc} alt={title} fill className="object-contain p-2" />
          </div>
        </div>
      )}

      {icon && (
        <div className="relative z-1 mb-3 flex items-center">
          {icon}
        </div>
      )}

      <h3 className="font-rubik font-semibold text-base sm:text-lg text-white max-w-full relative z-1 tracking-tight">
        {title}
      </h3>

      {date && (
        <div className="font-mono text-zinc-500 text-xs z-1 relative mt-1 mb-2">
          {date}
        </div>
      )}

      {description && (
        <p className="font-rubik text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed relative z-1">
          {description}
        </p>
      )}
    </div>
  );
}
