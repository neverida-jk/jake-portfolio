import type { Dual } from "./types";

export const hero = {
  eyebrow: "Base camp — Laguna, Philippines",
  coords: "14°N 121°E",

  role: {
    plain: "I make sure software works before anyone else has to deal with it.",
    technical: "QA Analyst — test strategy, regression suites, release gating.",
  } satisfies Dual,

  status: {
    plain: "QA Analyst at Vertere Global Solutions",
    technical: "QA @ Vertere Global Solutions Inc. · June 2026 – present",
  } satisfies Dual,

  now: {
    plain: "Testing enterprise software by day, building my own products on the side.",
    technical: "Release QA at Vertere; side projects on Next.js 15 + TypeScript.",
  } satisfies Dual,

  cta: {
    primary: "See the work",
    copy: "Copy email",
    copied: "Copied",
  },

  scrollCue: "Scroll to climb",

  stats: {
    gwa: { value: "1.95", label: "GWA — 1.00 is the top mark" },
    live: { label: "products live" },
    grad: { value: "’26", label: "UPLB Computer Science" },
  },
};
