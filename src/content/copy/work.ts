import type { Dual } from "./types";

// Section chrome only — every project's own words live in src/content/projects.ts.
export const work = {
  eyebrow: "Expeditions",
  title: "Things I've built",
  intro: {
    plain: "Real products, live on the internet. Open any of them to see the thinking behind it.",
    technical: "Each case study: problem → constraint → decisions → outcome, annotated on the real UI.",
  } satisfies Dual,
  live: "live",
  openCase: "Open case study",
  visit: "Visit live site",
  next: "Next project",
  close: "Close case study",
  hotspotHint: "Tap a gold dot to see why it's built that way.",
  elevationTitle: "Altitude on the climb",
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
