"use client";

// Live GitHub activity, rendered into the hero's Now panel (§7.4). On any
// failure, rate limit, or empty response fetchGithubActivity() resolves to
// null and this renders nothing — no skeleton, no error state.
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { fetchGithubActivity, type GithubActivity } from "@/lib/github";

const VB_W = 240;
const VB_H = 40;

// Open Catmull-Rom spline through the weekly points, emitted as cubic
// beziers — the same technique as Contours.tsx's closed rings, just not
// wrapped back to the start.
function smoothOpenPath(pts: [number, number][]) {
  if (pts.length < 2) return `M${pts[0]?.[0] ?? 0},${pts[0]?.[1] ?? 0}`;
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}

function sparkPaths(counts: number[]) {
  const max = Math.max(1, ...counts);
  const step = VB_W / (counts.length - 1);
  const pts: [number, number][] = counts.map((c, i) => [i * step, VB_H - (c / max) * (VB_H - 6) - 3]);
  const line = smoothOpenPath(pts);
  const area = `${line} L${VB_W},${VB_H} L0,${VB_H} Z`;
  return { line, area };
}

export default function GitHubActivity() {
  const [data, setData] = useState<GithubActivity | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    let alive = true;
    fetchGithubActivity().then((d) => {
      if (alive) setData(d);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!data) return null;

  const hasSpark = data.weeklyPushCounts.some((c) => c > 0);
  const { line, area } = sparkPaths(data.weeklyPushCounts);

  return (
    <div className="mt-3 border-t border-line pt-3">
      <p className="flex items-center gap-1.5 font-mono text-xs text-ink-2">
        <span className="h-1.5 w-1.5 rounded-full bg-alpine" aria-hidden="true" />
        {data.latestLine}
      </p>

      {hasSpark && (
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="mt-2.5 h-9 w-full" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="gh-spark-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-summit)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--color-summit)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path
            d={area}
            fill="url(#gh-spark-fill)"
            stroke="none"
            initial={reduceMotion ? false : { opacity: 0 }}
            whileInView={reduceMotion ? undefined : { opacity: 1 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          />
          <motion.path
            d={line}
            fill="none"
            stroke="var(--color-summit)"
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={reduceMotion ? false : { pathLength: 0 }}
            whileInView={reduceMotion ? undefined : { pathLength: 1 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
      )}
    </div>
  );
}
