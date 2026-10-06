import type { Dual } from "./types";

export const hero = {
  eyebrow: "Makati, Philippines",
  coords: "14.55°N 121.02°E",

  role: {
    plain: "I build software, then try to break it.",
    technical: "Software Engineer. QA Analyst at Vertere.",
  } satisfies Dual,

  status: {
    plain: "QA Analyst at Vertere Global Solutions",
    technical: "QA Analyst · June 2026 to now",
  } satisfies Dual,

  now: {
    plain: "Testing enterprise software by day. Building my own products on the side.",
    technical: "Side projects in Next.js 15 and TypeScript.",
  } satisfies Dual,

  cta: {
    primary: "See the work",
    copy: "Copy email",
    copied: "Copied",
  },

  scrollCue: "Scroll to turn the clock",

  stats: {
    gwa: { value: "1.95", label: "GWA (1.00 is best)" },
    live: { label: "products live" },
    grad: { value: "’26", label: "UPLB Computer Science" },
  },
};
