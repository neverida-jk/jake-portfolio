"use client";

import React, { useEffect, useState } from "react";
import { manilaClockText } from "@/lib/manilaClock";

// The closing image: the current time in Makati, huge and outlined, sitting
// behind the headline like a watermark. Nothing else: no dial, no glow, no line.
// Computed after mount so the server render and first client render match.
export default function TimeGhost({ className = "" }: { className?: string }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => {
      const [hm] = manilaClockText().split(" ");
      setTime(hm);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const [h, m] = time ? time.split(":") : ["", ""];

  return (
    <div aria-hidden="true" data-print-hide className={`pointer-events-none flex select-none flex-col items-center ${className}`}>
      {time && (
        <>
          <div className="font-display text-[clamp(5rem,19vw,10.5rem)] leading-[0.8] tabular-nums tracking-[-0.04em] text-transparent [-webkit-text-stroke:1px_rgba(159,174,196,0.3)]">
            {h}
            <span style={{ animation: "colon-blink 1s steps(1) infinite" }}>:</span>
            {m}
          </div>
        </>
      )}
    </div>
  );
}
