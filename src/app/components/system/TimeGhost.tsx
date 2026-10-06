"use client";

import React, { useEffect, useState } from "react";
import { manilaClockText } from "@/lib/manilaClock";

// The closing image: the current time in Makati, large and outlined, with a
// thin gold line under it that fills once a minute (a pure CSS animation,
// started at the current second so it stays in step with the clock). It sits
// above the headline, never behind it. No dial, no glow.
// Computed after mount so the server render and first client render match.
export default function TimeGhost({ className = "" }: { className?: string }) {
  const [time, setTime] = useState<{ hm: string; secs: number } | null>(null);

  useEffect(() => {
    const tick = () => {
      const [hm] = manilaClockText().split(" ");
      setTime((prev) => (prev && prev.hm === hm ? prev : { hm, secs: ((Date.now() + 8 * 3_600_000) % 60_000) / 1000 }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const [h, m] = time ? time.hm.split(":") : ["", ""];

  return (
    <div
      aria-hidden="true"
      data-print-hide
      className={`pointer-events-none flex min-h-[8.5rem] select-none flex-col items-center sm:min-h-[10.5rem] ${className}`}
    >
      {time && (
        <>
          <div className="font-display text-[clamp(5.5rem,19vw,10.5rem)] leading-none tabular-nums tracking-[-0.04em] text-transparent [-webkit-text-stroke:1px_rgba(159,174,196,0.4)]">
            {h}
            <span style={{ animation: "colon-blink 1s steps(1) infinite" }}>:</span>
            {m}
          </div>
          <div className="mt-3 h-px w-40 bg-line sm:w-56">
            <div
              key={time.hm}
              className="h-full origin-left bg-summit"
              style={{ animation: "sec-sweep 60s linear infinite", animationDelay: `-${time.secs.toFixed(2)}s` }}
            />
          </div>
        </>
      )}
    </div>
  );
}
