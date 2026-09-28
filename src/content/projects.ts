import type { Dual } from "./copy/types";

// Annotated marker on a project screenshot. Populated in Phase 4 (Expeditions).
export type Hotspot = {
  id: string;
  x: number; // 0-1, relative to the image box
  y: number; // 0-1, relative to the image box
  label: string;
  body: Dual;
};

export type Project = {
  id: string;
  title: string;
  domain: string;
  liveUrl: string;
  thumbnail: string;
  elevation: number; // metres — a fictional "altitude" badge, consistent with the ascent motif
  tools: string[]; // tool ids from src/content/tools.ts
  hotspots: Hotspot[];
};

// Single source of truth for the project <-> tool mapping. The Toolkit
// section's cross-highlight (§6.4) and the Work section's tool chips both
// read from this list — never duplicate a project's tool list elsewhere.
export const projects: Project[] = [
  {
    id: "quant",
    title: "Prediction Market Edge Engine",
    domain: "quant.dev-jk.me",
    liveUrl: "https://quant.dev-jk.me",
    thumbnail: "/projects/quant.jpg",
    elevation: 2410,
    tools: ["typescript", "react", "nodejs"],
    hotspots: [],
  },
  {
    id: "tropa",
    title: "Tropa — Climb & Expense Coordinator",
    domain: "tropa.dev-jk.me",
    liveUrl: "https://tropa.dev-jk.me",
    thumbnail: "/projects/tropa.jpg",
    elevation: 1980,
    tools: ["nextjs", "react", "typescript", "tailwind"],
    hotspots: [],
  },
  {
    id: "finance",
    title: "Finance Tracker PWA",
    domain: "finance.dev-jk.me",
    liveUrl: "https://finance.dev-jk.me",
    thumbnail: "/projects/finance.jpg",
    elevation: 1620,
    tools: ["react", "typescript"],
    hotspots: [],
  },
  {
    id: "portfolio-v2",
    title: "Developer Portfolio v2",
    domain: "dev-jk.me",
    liveUrl: "https://neverida-jk.github.io/portfolio",
    thumbnail: "/projects/portfolio-v2.jpg",
    elevation: 890,
    tools: ["nextjs", "react", "typescript", "tailwind"],
    hotspots: [],
  },
];
