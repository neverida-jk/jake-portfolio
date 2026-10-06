import type { Dual } from "./types";

export const hero = {
  eyebrow: "Makati, Philippines",
  coords: "14.55°N 121.02°E",

  role: {
    plain: "I build software, then try to break it.",
    technical: "Software Engineer. QA Analyst at Vertere.",
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
