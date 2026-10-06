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
          <span className="h-1.5 w-1.5 rounded-full bg-moss" aria-hidden="true" />
          It&apos;s {time} in Makati right now.
        </>
      )}
    </p>
  );
}
