import type { Dual } from "./types";

// Prompt for Beyond the Resume (§6.6 / Phase 6). The rest of the terminal's
// layer copy is personal narrative, so it stays single-voice. A "What's
// next?" prompt is deliberately absent until Jake writes a real answer — no
// placeholder text on the live site.
export const beyond = {
  whyQa: {
    plain: "I like finding the problem before a user does.",
    technical: "QA Analyst at Vertere since June 2026: test plans, regression suites, defect triage, release gating.",
  } as Dual,
};
