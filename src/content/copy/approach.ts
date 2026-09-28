import type { Dual } from "./types";
import { projects, projectById } from "../projects";

export type ApproachPrinciple = {
  id: "qa" | "arch" | "execution" | "rigor";
  label: string;
  body: Dual;
  /** true when the principle's technical receipt cites a specific live project. */
  citesWork: boolean;
};

const hasFinance = projects.some((p) => p.id === "finance");
const quant = projectById("quant");

// Every principle collapses to one Dual (§6.5 owner revision): plain is the
// claim, technical is the receipt. Execution's receipt needs the live
// project count, so it's built from `projectCount` rather than static copy.
export function getApproachPrinciples(projectCount: number): ApproachPrinciple[] {
  return [
    {
      id: "qa",
      label: "Quality & Reliability",
      citesWork: false,
      body: {
        plain: "Quality is a habit, not a final step — I test as I build.",
        technical: "Press ⌘K → Break It to run this site's own accessibility and behaviour test suite against itself.",
      },
    },
    {
      id: "arch",
      label: "Clean Architecture",
      citesWork: hasFinance,
      body: {
        plain: "I build things that still make sense to open a year later.",
        // Only a real citation when the project it cites actually exists.
        technical: hasFinance
          ? "Finance Tracker persists every transaction client-side through Dexie.js over IndexedDB — no backend, nothing lost on refresh."
          : "",
      },
    },
    {
      id: "execution",
      label: "Execution & Ownership",
      citesWork: false,
      body: {
        plain: "I finish what I start, end to end.",
        technical: `${projectCount} project${projectCount === 1 ? "" : "s"} live in production, from architecture through deploy.`,
      },
    },
    {
      id: "rigor",
      label: "Engineering Rigor",
      citesWork: false,
      body: {
        plain: "I like problems that have a right answer.",
        // Cites the quant project only while it is on the site.
        technical: quant
          ? `${quant.domain} models implied probability and Kelly-criterion stake sizing over live prediction-market order books.`
          : "Computer Science foundations: algorithms, complexity, data structures.",
      },
    },
  ];
}

export const approach = { getApproachPrinciples };
