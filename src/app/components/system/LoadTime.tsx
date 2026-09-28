"use client";

import React, { useEffect, useState } from "react";

// "This page loaded in 0.42 s on your device" — measured live in the
// visitor's own browser (Largest Contentful Paint, falling back to the
// navigation timing). Honest proof of the craft, readable by anyone.
export default function LoadTime({ template }: { template: (seconds: string) => string }) {
  const [seconds, setSeconds] = useState<string | null>(null);

  useEffect(() => {
    let lcp = 0;
    let observer: PerformanceObserver | undefined;
    try {
      observer = new PerformanceObserver((list) => {
        for (const e of list.getEntries()) lcp = e.startTime;
      });
      observer.observe({ type: "largest-contentful-paint", buffered: true });
    } catch {
      // LCP unsupported (e.g. Safari) — navigation timing below covers it.
    }

    // LCP is final once the visitor interacts or the page settles; read it
    // a moment after load rather than showing a number that keeps changing.
    const settle = setTimeout(() => {
      observer?.disconnect();
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      const ms = lcp || nav?.domContentLoadedEventEnd || 0;
      if (ms > 0) setSeconds((ms / 1000).toFixed(2));
    }, 4000);

    return () => {
      clearTimeout(settle);
      observer?.disconnect();
    };
  }, []);

  if (!seconds) return null;
  return <p className="mt-4 text-ink-3">{template(seconds)}</p>;
}
