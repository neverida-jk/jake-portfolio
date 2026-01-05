"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home(){
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Wait for the title animation to complete (3 seconds), then exit immediately
    const timer = setTimeout(() => {
      setIsExiting(true);
      // Wait for exit animation to complete before navigating
      setTimeout(() => {
        router.push('/contact');
      }, 600); // Match the animation duration
    }, 3000); // 3s animation, exit immediately after

    return () => clearTimeout(timer);
  }, [router]);

  return (
 <div className={`flex flex-col items-center justify-center w-screen h-dvh overflow-hidden bg-gradient-to-tl from-black via-zinc-600/15 to-black ${isExiting ? 'animate-fade-out' : ''}`}>
      <div className="hidden w-screen h-px md:block animate-fade-left bg-gradient-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0" />
      <h1
        className={`py-3.5 px-3 z-10 text-4xl text-transparent font-rubik duration-1000 bg-white cursor-default text-edge-outline animate-title font-display sm:text-6xl md:text-9xl whitespace-nowrap bg-clip-text ${isExiting ? 'animate-fade-out' : ''}`}
      >
        neverida-jk
      </h1>
      <div className="hidden w-screen h-px md:block animate-fade-right bg-gradient-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0" />
    </div>
  );
}