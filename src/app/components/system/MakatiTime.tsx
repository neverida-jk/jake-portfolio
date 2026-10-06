"use client";

import React, { useEffect, useState } from "react";
import { manilaClockText } from "@/lib/manilaClock";

// The local time where Jake is — useful if you're about to email him.
// Computed after mount so the server render and the first client render match.
export default function MakatiTime({ className = "" }: { className?: string }) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => setTime(manilaClockText());
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <p className={`flex min-h-[1.25rem] items-center justify-center gap-2 font-mono text-xs text-ink-3 ${className}`}>
      {time && (
        <>
          <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-moss opacity-60 motion-reduce:hidden" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-moss" />
          </span>
          It&apos;s {time} in Makati right now.
        </>
      )}
    </p>
  );
}
