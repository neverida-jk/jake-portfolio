import type { Dual } from "./types";

// New prompts for Beyond the Resume (§6.6 / Phase 6). The rest of the
// terminal's layer copy is personal narrative, not an explanatory claim, so
// it stays single-voice; these two are the ones the owner asked for.
export const beyond = {
  whyQa: {
    plain: "I like being the person who finds the problem before a user does.",
    technical: "QA Analyst, Vertere Global Solutions Inc., since June 2026 — test plans, regression suites, defect lifecycle and triage, release quality gating.",
  } as Dual,
  // No verified facts in ASCENT_MASTERPLAN.md §9.1 for this one yet.
  whatsNext: {
    plain: "TODO(jake): what's next?",
    technical: "TODO(jake): what's next?",
  } as Dual,
};
