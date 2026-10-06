"use client";

import React, { useEffect, useState } from "react";
import { manilaClockText } from "@/lib/manilaClock";

// The closing image: the current time in Makati, huge and outlined, sitting
// behind the headline like a watermark. A thin gold line under it fills once
// a minute (a pure CSS animation, started at the current second so it stays
// in step with the clock). No dial, no glow.
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
    <div aria-hidden="true" data-print-hide className={`pointer-events-none flex select-none flex-col items-center ${className}`}>
      {time && (
        <>
          <div className="font-display text-[clamp(8rem,34vw,21rem)] leading-[0.8] tabular-nums tracking-[-0.04em] text-transparent [-webkit-text-stroke:1px_rgba(159,174,196,0.3)]">
            {h}
            <span style={{ animation: "colon-blink 1s steps(1) infinite" }}>:</span>
            {m}
          </div>
          <div className="mt-4 h-px w-48 bg-line sm:w-72">
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
