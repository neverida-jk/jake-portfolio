import type { Dual } from "./types";

export const hero = {
  role: {
    plain: "I make sure software works before anyone else has to deal with it.",
    technical: "QA Analyst — test strategy, regression automation, release gating.",
  } satisfies Dual,
  status: {
    plain: "Currently working full-time",
    technical: "QA Analyst @ Vertere Global Solutions Inc.",
  } satisfies Dual,
};
