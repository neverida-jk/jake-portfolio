import type { Dual } from "./types";

// Verb-grouped intros for the Toolkit (§6.4). One field note per group —
// that's the whole field-note budget for this section.
export const toolkit: Record<"build" | "test" | "ship", Dual> = {
  build: {
    plain: "I build interfaces and the systems behind them.",
    technical: "React, Node and MongoDB, with one set of TypeScript types end to end.",
  },
  test: {
    plain: "I find what breaks before your users do.",
    technical: "Regression suites, defect triage, release gating.",
  },
  ship: {
    plain: "I get it in front of people and keep it running.",
    technical: "GitHub Actions CI, Docker, AWS and Vercel.",
  },
};
