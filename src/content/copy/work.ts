import type { Dual } from "./types";

// Section chrome only — every project's own words live in src/content/projects.ts.
export const work = {
  eyebrow: "Shipped",
  title: "Things I've built",
  intro: {
    plain: "Real products, live on the internet. Open one to see how it was built.",
    technical: "Each case study: problem, constraint, decisions, outcome.",
  } satisfies Dual,
  live: "live",
  openCase: "Open case study",
  visit: "Visit live site",
  next: "Next project",
  close: "Close case study",
  hotspotHint: "Tap a gold dot to see why it's built that way.",
  labels: {
    problem: "The problem",
    constraint: "The constraint",
    decisions: "Key decisions",
    outcome: "Outcome",
    stack: "Built with",
  },
  carousel: "Projects",
  goTo: "Go to",
};
