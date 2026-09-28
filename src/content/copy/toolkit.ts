import type { Dual } from "./types";

// Verb-grouped intros for the Toolkit (§6.4). One field note per group —
// that's the whole field-note budget for this section.
export const toolkit: Record<"build" | "test" | "ship", Dual> = {
  build: {
    plain: "I build the interfaces and systems that make an idea usable.",
    technical: "React components, Node services, and a MongoDB schema, sharing one set of TypeScript contracts end to end.",
  },
  // Reuses the §9.2 voice example verbatim — it's the plainest, truest
  // sentence for what a QA Analyst's day actually is.
  test: {
    plain: "I make sure software works before anyone else has to deal with it.",
    technical: "Regression suites, defect lifecycle management, and release gating for enterprise applications.",
  },
  ship: {
    plain: "I get the thing in front of people, and keep it there.",
    technical: "Git-based CI through GitHub Actions, containerized with Docker, deployed to AWS and Vercel.",
  },
};
